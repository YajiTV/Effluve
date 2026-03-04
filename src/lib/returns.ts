import type { ReturnReason, ReturnStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ReturnSummary = {
  id: number;
  orderId: number;
  orderNumber: string;
  orderItemId: number | null;
  productName: string | null;
  reason: ReturnReason;
  status: ReturnStatus;
  note: string | null;
  requestedAt: string;
  refundCents: number | null;
};

export type AdminReturnSummary = ReturnSummary & {
  userEmail: string;
  userName: string;
};

export async function createReturnRequest(params: {
  userId: number;
  orderId: number;
  orderItemId?: number | null;
  reason: ReturnReason;
  note?: string | null;
}) {
  const { userId, orderId, orderItemId, reason, note } = params;

  try {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, userId, paymentStatus: "paid" },
        select: { id: true },
      });
      if (!order) throw new Error("ORDER_NOT_RETURNABLE");

      if (orderItemId) {
        const item = await tx.orderItem.findFirst({
          where: { id: orderItemId, orderId },
          select: { id: true },
        });
        if (!item) throw new Error("ORDER_ITEM_INVALID");
      }

      const created = await tx.orderReturn.create({
        data: {
          userId,
          orderId,
          orderItemId: orderItemId ?? null,
          reason,
          note: note ? note.slice(0, 500) : null,
          status: "requested",
        },
        select: { id: true },
      });

      return created.id;
    });
  } catch (error) {
    if (isOrderReturnsTableMissing(error)) {
      throw new Error("RETURNS_TABLE_MISSING");
    }
    throw error;
  }
}

export async function getReturnsByUserId(userId: number): Promise<ReturnSummary[]> {
  let rows: Awaited<ReturnType<typeof prisma.orderReturn.findMany>>;
  try {
    rows = await prisma.orderReturn.findMany({
      where: { userId },
      include: {
        order: { select: { id: true, orderNumber: true } },
        orderItem: { select: { id: true, productName: true } },
      },
      orderBy: [{ requestedAt: "desc" }, { id: "desc" }],
    });
  } catch (error) {
    if (isOrderReturnsTableMissing(error)) return [];
    throw error;
  }

  return rows.map((row) => ({
    id: row.id,
    orderId: row.order.id,
    orderNumber: row.order.orderNumber,
    orderItemId: row.orderItem?.id ?? null,
    productName: row.orderItem?.productName ?? null,
    reason: row.reason,
    status: row.status,
    note: row.note,
    requestedAt: row.requestedAt.toISOString(),
    refundCents: row.refundCents,
  }));
}

export async function getLatestReturnStatusByOrderIds(userId: number, orderIds: number[]) {
  if (!orderIds.length) return new Map<number, ReturnStatus>();

  let rows: Awaited<ReturnType<typeof prisma.orderReturn.findMany>>;
  try {
    rows = await prisma.orderReturn.findMany({
      where: { userId, orderId: { in: orderIds } },
      select: { orderId: true, status: true, createdAt: true },
      orderBy: [{ orderId: "asc" }, { createdAt: "desc" }, { id: "desc" }],
    });
  } catch (error) {
    if (isOrderReturnsTableMissing(error)) return new Map<number, ReturnStatus>();
    throw error;
  }

  const map = new Map<number, ReturnStatus>();
  for (const row of rows) {
    if (!map.has(row.orderId)) map.set(row.orderId, row.status);
  }

  return map;
}

export async function getAllReturnsForAdmin(): Promise<AdminReturnSummary[]> {
  let rows: Awaited<ReturnType<typeof prisma.orderReturn.findMany>>;
  try {
    rows = await prisma.orderReturn.findMany({
      include: {
        user: { select: { email: true, fullName: true } },
        order: { select: { id: true, orderNumber: true } },
        orderItem: { select: { id: true, productName: true } },
      },
      orderBy: [{ requestedAt: "desc" }, { id: "desc" }],
    });
  } catch (error) {
    if (isOrderReturnsTableMissing(error)) return [];
    throw error;
  }

  return rows.map((row) => ({
    id: row.id,
    userEmail: row.user.email,
    userName: row.user.fullName,
    orderId: row.order.id,
    orderNumber: row.order.orderNumber,
    orderItemId: row.orderItem?.id ?? null,
    productName: row.orderItem?.productName ?? null,
    reason: row.reason,
    status: row.status,
    note: row.note,
    requestedAt: row.requestedAt.toISOString(),
    refundCents: row.refundCents,
  }));
}

export async function adminUpdateReturn(params: {
  returnId: number;
  status: ReturnStatus;
  refundCents?: number | null;
}) {
  const { returnId, status, refundCents } = params;

  try {
    const existing = await prisma.orderReturn.findUnique({
      where: { id: returnId },
      select: { id: true, status: true },
    });
    if (!existing) throw new Error("RETURN_NOT_FOUND");

    if (!isAllowedTransition(existing.status, status)) {
      throw new Error("RETURN_INVALID_TRANSITION");
    }

    if (status === "refunded" && (refundCents == null || refundCents < 0)) {
      throw new Error("RETURN_REFUND_REQUIRED");
    }

    const updated = await prisma.orderReturn.update({
      where: { id: returnId },
      data: {
        status,
        refundCents: status === "refunded" ? refundCents ?? 0 : null,
        processedAt: status === "requested" ? null : new Date(),
      },
      select: { id: true, status: true, refundCents: true },
    });

    return updated;
  } catch (error) {
    if (isOrderReturnsTableMissing(error)) throw new Error("RETURNS_TABLE_MISSING");
    throw error;
  }
}

function isAllowedTransition(current: ReturnStatus, next: ReturnStatus) {
  if (current === next) return true;
  // Admin override: autorise les changements d'etat, sauf retour vers "requested".
  if (next === "requested") return false;
  return true;
}

function isOrderReturnsTableMissing(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (error.code !== "P2021") return false;
  const table = (error.meta as { table?: string } | undefined)?.table ?? "";
  return typeof table === "string" && table.includes("order_returns");
}
