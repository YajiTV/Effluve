import { prisma } from "@/lib/prisma";

export type PromoResult =
  | { valid: true; discountCents: number; code: string; description: string }
  | { valid: false; error: string };

export async function validatePromoCode(
  code: string,
  orderTotalCents: number
): Promise<PromoResult> {
  const promo = await prisma.promoCode.findUnique({ where: { code } });

  if (!promo || !promo.isActive) {
    return { valid: false, error: "Code promo invalide ou inactif." };
  }

  if (promo.expiresAt && promo.expiresAt <= new Date()) {
    return { valid: false, error: "Ce code promo a expiré." };
  }

  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
    return { valid: false, error: "Ce code promo a atteint sa limite d'utilisations." };
  }

  if (orderTotalCents < promo.minOrderCents) {
    const minEur = (promo.minOrderCents / 100).toFixed(2).replace(".", ",");
    return {
      valid: false,
      error: `Commande minimum de ${minEur} € requise pour ce code.`,
    };
  }

  let discountCents: number;
  if (promo.discountType === "percent") {
    discountCents = Math.floor((orderTotalCents * promo.discountValue) / 100);
  } else {
    discountCents = promo.discountValue;
  }

  discountCents = Math.max(0, Math.min(discountCents, orderTotalCents));

  const discountDisplay =
    promo.discountType === "percent"
      ? `${promo.discountValue} %`
      : `${(promo.discountValue / 100).toFixed(2).replace(".", ",")} €`;

  return {
    valid: true,
    discountCents,
    code: promo.code,
    description: `Code ${promo.code} — ${discountDisplay} de réduction`,
  };
}

export async function applyPromoCode(code: string): Promise<void> {
  await prisma.promoCode.update({
    where: { code },
    data: { usedCount: { increment: 1 } },
  });
}
