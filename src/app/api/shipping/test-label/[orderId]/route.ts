import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const order = await prisma.order.findUnique({
    where: { id: Number(orderId) },
    include: { shippingAddress: true },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const addr = order.shippingAddress;
  const tracking = order.trackingNumber ?? "—";
  const orderRef = order.orderNumber ?? `#${order.id}`;
  const date = new Date(order.createdAt).toLocaleDateString("fr-FR");

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Étiquette TEST — ${orderRef}</title>
  <style>
    body { font-family: monospace; margin: 0; padding: 32px; background: #fff; }
    .label {
      border: 3px solid #000; width: 400px; padding: 24px;
      margin: auto; position: relative;
    }
    .banner {
      background: #000; color: #fff; text-align: center;
      font-size: 11px; letter-spacing: 2px; padding: 4px 0; margin-bottom: 16px;
    }
    .logo { font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 16px; }
    .section { margin-bottom: 12px; }
    .label-sm { font-size: 10px; text-transform: uppercase; color: #666; }
    .value { font-size: 14px; font-weight: bold; }
    .tracking {
      border: 2px dashed #000; text-align: center; padding: 12px;
      font-size: 18px; letter-spacing: 3px; margin: 16px 0;
    }
    .barcode { font-size: 48px; letter-spacing: -2px; text-align: center; }
    hr { border: none; border-top: 1px solid #000; margin: 12px 0; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="label">
    <div class="banner">⚠ ÉTIQUETTE DE TEST — NE PAS EXPÉDIER ⚠</div>
    <div class="logo">EFFLUVE</div>
    <hr />
    <div class="section">
      <div class="label-sm">Expéditeur</div>
      <div class="value">EFFLUVE</div>
      <div>12 Rue Pres d'ici</div>
      <div>31000 Toulouse, FR</div>
    </div>
    <hr />
    <div class="section">
      <div class="label-sm">Destinataire</div>
      <div class="value">${addr.name}</div>
      <div>${addr.street}</div>
      <div>${addr.zipcode} ${addr.city}</div>
      <div>${addr.country ?? "France"}</div>
    </div>
    <hr />
    <div class="tracking">
      <div class="label-sm">Numéro de suivi</div>
      <div>${tracking}</div>
    </div>
    <div class="barcode">||||| || ||| |||| |||||</div>
    <hr />
    <div style="display:flex; justify-content:space-between; font-size:12px;">
      <span><span class="label-sm">Commande</span><br/><b>${orderRef}</b></span>
      <span><span class="label-sm">Date</span><br/><b>${date}</b></span>
      <span><span class="label-sm">Transporteur</span><br/><b>${order.carrierName ?? "Colissimo"}</b></span>
    </div>
  </div>
  <p style="text-align:center; margin-top:16px;">
    <button onclick="window.print()">Imprimer l'étiquette</button>
  </p>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
