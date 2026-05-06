import { Shippo } from "shippo";
import { prisma } from "@/lib/prisma";

// Adresse d'expédition Effluve (expéditeur)
const FROM_ADDRESS = {
  name: "EFFLUVE",
  street1: process.env.EFFLUVE_STREET ?? "12 Rue Pres d'ici",
  city: process.env.EFFLUVE_CITY ?? "Toulouse",
  zip: process.env.EFFLUVE_ZIP ?? "31000",
  country: "FR",
  phone: process.env.EFFLUVE_PHONE ?? "+33600000000",
  email: "contact@effluve.fr",
};

// Dimensions par défaut d'un colis vêtement
const DEFAULT_PARCEL = {
  length: "30",
  width: "20",
  height: "5",
  distanceUnit: "cm" as const,
  weight: "500",
  massUnit: "g" as const,
};

function toIsoCountry(country: string | null | undefined): string {
  const map: Record<string, string> = {
    france: "FR",
    "france métropolitaine": "FR",
    belgique: "BE",
    suisse: "CH",
    luxembourg: "LU",
    espagne: "ES",
    italie: "IT",
    allemagne: "DE",
    "royaume-uni": "GB",
    "united kingdom": "GB",
    "united states": "US",
    "états-unis": "US",
  };
  if (!country) return "FR";
  return map[country.toLowerCase()] ?? country.toUpperCase().slice(0, 2);
}

function getShippoClient() {
  const key = process.env.SHIPPO_API_KEY;
  if (!key) throw new Error("SHIPPO_API_KEY manquante dans .env");
  return new Shippo({ apiKeyHeader: key });
}

export type LabelResult = {
  trackingNumber: string;
  labelUrl: string;
  carrierName: string;
};

function isMockMode(): boolean {
  const key = process.env.SHIPPO_API_KEY ?? "";
  return key.startsWith("shippo_test_") || process.env.SHIPPING_MOCK === "true";
}

function generateMockLabel(orderId: number): LabelResult {
  const trackingNumber = `MOCK${Date.now()}${orderId}`;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ?? "http://localhost:3000";
  return {
    trackingNumber,
    labelUrl: `${baseUrl}/api/shipping/test-label/${orderId}`,
    carrierName: "Colissimo (simulation)",
  };
}

export async function generateLabel(orderId: number): Promise<LabelResult> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, paymentStatus: { in: ["paid", "preparing"] } },
    include: { shippingAddress: true, items: true },
  });

  if (!order) throw new Error("Commande introuvable ou non payée.");

  if (isMockMode()) {
    const result = generateMockLabel(orderId);
    await prisma.order.update({
      where: { id: orderId },
      data: {
        trackingNumber: result.trackingNumber,
        labelUrl: result.labelUrl,
        carrierName: result.carrierName,
        paymentStatus: "preparing",
      },
    });
    return result;
  }

  const client = getShippoClient();

  const addr = order.shippingAddress;
  const toAddress = {
    name: addr.name,
    company: addr.company ?? undefined,
    street1: addr.street,
    city: addr.city,
    zip: addr.zipcode,
    country: toIsoCountry(addr.country),
  };

  // Poids total : 500g par article par défaut
  const totalWeightG = order.items.reduce((sum, item) => sum + item.quantity * 500, 0);
  const parcel = { ...DEFAULT_PARCEL, weight: String(totalWeightG) };

  // Création du shipment (récupère les tarifs en même temps)
  const shipment = await client.shipments.create({
    addressFrom: FROM_ADDRESS,
    addressTo: toAddress,
    parcels: [parcel],
    async: false,
  });

  if (!shipment.rates || shipment.rates.length === 0) {
    throw new Error(
      `Aucun transporteur disponible pour cette adresse (${toAddress.country}). ` +
      `Vérifie que tu as au moins un carrier actif dans Shippo → Settings → Carriers qui couvre la route FR→${toAddress.country}.`
    );
  }

  const eligible = shipment.rates;

  // Trie par prix croissant, préfère les carriers connus
  const PREFERRED = ["DHL", "FedEx", "UPS", "Colissimo", "USPS", "TNT", "GLS", "DPD"];
  const sorted = eligible.sort((a, b) => {
    const aPreferred = PREFERRED.some((p) => a.provider.toUpperCase().includes(p)) ? 0 : 1;
    const bPreferred = PREFERRED.some((p) => b.provider.toUpperCase().includes(p)) ? 0 : 1;
    if (aPreferred !== bPreferred) return aPreferred - bPreferred;
    return parseFloat(a.amount) - parseFloat(b.amount);
  });

  // Essaie les rates dans l'ordre jusqu'à ce qu'un label soit généré avec succès
  const errors: string[] = [];
  for (const rate of sorted) {
    const transaction = await client.transactions.create({
      rate: rate.objectId,
      labelFileType: "PDF",
      async: false,
    });

    if (transaction.status === "SUCCESS" && transaction.labelUrl && transaction.trackingNumber) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          trackingNumber: transaction.trackingNumber,
          labelUrl: transaction.labelUrl,
          carrierName: rate.provider,
          paymentStatus: "preparing",
        },
      });

      return {
        trackingNumber: transaction.trackingNumber,
        labelUrl: transaction.labelUrl,
        carrierName: rate.provider,
      };
    }

    const msg = transaction.messages?.map((m) => m.text).join(", ") ?? "erreur inconnue";
    errors.push(`${rate.provider}: ${msg}`);
  }

  throw new Error(`Aucun transporteur n'a pu générer l'étiquette. Détails : ${errors.join(" | ")}`);
}
