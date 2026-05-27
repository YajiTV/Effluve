import { prisma } from "@/lib/prisma";

export type ProductStat = {
  productId: number;
  productName: string;
  unitsSold: number;
  revenueCents: number;
  returnCount: number;
  returnRate: number;
};

export type DashboardKPIs = {
  revenueCents: number;
  orderCount: number;
  newCustomers: number;
  averageBasketCents: number;
};

export type RevenueDataPoint = {
  date: string;
  revenueCents: number;
  orderCount: number;
};

export type RecentOrder = {
  id: number;
  orderNumber: string;
  customerName: string;
  totalCents: number;
  paymentStatus: string;
  createdAt: string;
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

export async function getWeeklyRevenue(): Promise<RevenueDataPoint[]> {
  const days: RevenueDataPoint[] = [];

  for (let i = 6; i >= 0; i--) {
    const start = new Date();
    start.setDate(start.getDate() - i);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: "paid",
        createdAt: { gte: start, lte: end },
      },
      select: { totalCents: true },
    });

    const revenueCents = orders.reduce((sum, o) => sum + o.totalCents, 0);
    const date = start.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });

    days.push({ date, revenueCents, orderCount: orders.length });
  }

  return days;
}

export async function getProductStats(): Promise<ProductStat[]> {
  const paidOrders = await prisma.order.findMany({
    where: { paymentStatus: "paid" },
    select: {
      items: {
        select: { productId: true, productName: true, quantity: true, lineTotalCents: true },
      },
    },
  });

  const map = new Map<number, { name: string; units: number; revenueCents: number }>();
  for (const order of paidOrders) {
    for (const item of order.items) {
      const prev = map.get(item.productId) ?? { name: item.productName, units: 0, revenueCents: 0 };
      prev.units += item.quantity;
      prev.revenueCents += item.lineTotalCents;
      map.set(item.productId, prev);
    }
  }

  const returns = await prisma.orderReturn.groupBy({
    by: ["orderItemId"],
    _count: { id: true },
    where: { orderItemId: { not: null } },
  });

  const returnsByItem = new Map<number, number>();
  for (const r of returns) {
    if (r.orderItemId) returnsByItem.set(r.orderItemId, r._count.id);
  }

  return Array.from(map.entries())
    .map(([productId, data]) => {
      const returnCount = returnsByItem.get(productId) ?? 0;
      const returnRate = data.units > 0 ? Math.round((returnCount / data.units) * 100) : 0;
      return { productId, productName: data.name, unitsSold: data.units, revenueCents: data.revenueCents, returnCount, returnRate };
    })
    .sort((a, b) => b.revenueCents - a.revenueCents);
}

export async function getRecentOrders(limit = 10): Promise<RecentOrder[]> {
  const orders = await prisma.order.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { fullName: true } } },
  });

  return orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.user?.fullName ?? "—",
    totalCents: o.totalCents,
    paymentStatus: o.paymentStatus,
    createdAt: o.createdAt.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
  }));
}
