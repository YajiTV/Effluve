import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";

export const ORDER_STATUSES: PaymentStatus[] = [
  "paid",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
];

export type AdminOrder = {
  id: number;
  orderNumber: string;
  createdAt: string;
  totalCents: number;
  paymentStatus: PaymentStatus;
  customerName: string;
  customerEmail: string;
  itemCount: number;
  trackingNumber: string | null;
  labelUrl: string | null;
  carrierName: string | null;
};

export async function getAllOrdersForAdmin(): Promise<AdminOrder[]> {
  const rows = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      createdAt: true,
      totalCents: true,
      paymentStatus: true,
      trackingNumber: true,
      labelUrl: true,
      carrierName: true,
      user: { select: { fullName: true, email: true } },
      items: { select: { quantity: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    orderNumber: row.orderNumber,
    createdAt: row.createdAt.toISOString(),
    totalCents: row.totalCents,
    paymentStatus: row.paymentStatus,
    customerName: row.user.fullName,
    customerEmail: row.user.email,
    itemCount: row.items.reduce((sum, item) => sum + item.quantity, 0),
    trackingNumber: row.trackingNumber ?? null,
    labelUrl: row.labelUrl ?? null,
    carrierName: row.carrierName ?? null,
  }));
}

export async function updateOrderStatus(orderId: number, status: PaymentStatus) {
  return prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: status },
  });
}
