import { prisma } from "@/lib/prisma";

export const POINTS_PER_EURO = 10;
export const PALIER = 1000;
export const LOYALTY_DISCOUNT_PCT = 20;

export async function getLoyaltyPoints(userId: number): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { loyaltyPoints: true },
  });
  return user?.loyaltyPoints ?? 0;
}

export async function awardLoyaltyPoints(userId: number, totalCents: number): Promise<void> {
  const points = Math.floor(totalCents / 100) * POINTS_PER_EURO;
  if (points <= 0) return;
  await prisma.user.update({
    where: { id: userId },
    data: { loyaltyPoints: { increment: points } },
  });
}

// Déduit 1000 points (1 palier) — à appeler dans une transaction Prisma
export async function consumeLoyaltyPalier(
  userId: number,
  tx: Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">
): Promise<void> {
  await tx.user.update({
    where: { id: userId },
    data: { loyaltyPoints: { decrement: PALIER } },
  });
}

export function computeLoyaltyDiscount(subTotalCents: number): number {
  return Math.floor(subTotalCents * LOYALTY_DISCOUNT_PCT / 100);
}
