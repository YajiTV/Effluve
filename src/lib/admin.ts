import { prisma } from "@/lib/prisma";

export type DashboardKPIs = {
  revenueCents: number;      // CA du jour (commandes payées)
  orderCount: number;        // Nb commandes du jour
  newCustomers: number;      // Nb nouveaux clients du jour
  averageBasketCents: number; // Panier moyen du jour
};

export async function getDashboardKPIs(): Promise<DashboardKPIs> {
  // Début et fin de la journée en cours
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Commandes payées aujourd'hui
  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: "paid",
      createdAt: { gte: startOfDay, lte: endOfDay },
    },
    select: { totalCents: true },
  });

  // Nouveaux clients aujourd'hui
  const newCustomers = await prisma.user.count({
    where: {
      role: "customer",
      createdAt: { gte: startOfDay, lte: endOfDay },
    },
  });

  const orderCount = orders.length;
  const revenueCents = orders.reduce((sum, o) => sum + o.totalCents, 0);
  const averageBasketCents = orderCount > 0 ? Math.round(revenueCents / orderCount) : 0;

  return { revenueCents, orderCount, newCustomers, averageBasketCents };
}
