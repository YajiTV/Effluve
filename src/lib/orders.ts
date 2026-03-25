import { prisma } from "@/lib/prisma";

export type OrderStatus = "pending_payment" | "paid" | "preparing" | "shipped" | "delivered" | "cancelled";

export type OrderSummary = {
  id: number;
  orderNumber: string;
  createdAt: string;
  totalCents: number;
  paymentStatus: OrderStatus;
};

export type OrderDetail = {
  id: number;
  orderNumber: string;
  createdAt: string;
  totalCents: number;
  paymentStatus: OrderStatus;
  stripeInvoiceUrl: string | null;
  shippingAddressId: number;
  billingAddressId: number;
  items: {
    id: number;
    productId: number;
    productName: string;
    unitPriceCents: number;
    quantity: number;
    lineTotalCents: number;
  }[];
};

export type PaidOrderForReturn = {
  id: number;
  orderNumber: string;
  items: {
    id: number;
    productName: string;
  }[];
};

function makeOrderNumber(userId: number) {
  const stamp = Date.now().toString(36).toUpperCase();
  return `CMD-${userId}-${stamp}`;
}

export async function createOrderFromCart(params: {
  userId: number;
  shippingAddressId: number;
  billingAddressId: number;
}) {
  const { userId, shippingAddressId, billingAddressId } = params;
  const orderNumber = makeOrderNumber(userId);

  return prisma.$transaction(async (tx) => {
    const cartItems = await tx.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: { id: true, name: true, priceCents: true, stock: true },
        },
      },
      orderBy: { id: "desc" },
    });

    if (!cartItems.length) {
      throw new Error("PANIER_VIDE");
    }

    // Vérifie que tous les articles ont du stock suffisant
    const outOfStock = cartItems.filter((item) => item.product.stock < item.quantity);
    if (outOfStock.length > 0) {
      const names = outOfStock.map((item) => item.product.name).join(", ");
      throw new Error(`STOCK_INSUFFISANT:${names}`);
    }

    const [shippingAddress, billingAddress] = await Promise.all([
      tx.address.findFirst({ where: { id: shippingAddressId, userId }, select: { id: true } }),
      tx.address.findFirst({ where: { id: billingAddressId, userId }, select: { id: true } }),
    ]);

    if (!shippingAddress || !billingAddress) {
      throw new Error("ADRESSE_INVALIDE");
    }

    const totalCents = cartItems.reduce((sum, row) => sum + row.product.priceCents * row.quantity, 0);

    const order = await tx.order.create({
      data: {
        userId,
        orderNumber,
        totalCents,
        paymentStatus: "pending_payment",
        shippingAddressId,
        billingAddressId,
      },
    });

    await tx.orderItem.createMany({
      data: cartItems.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        productName: item.product.name,
        unitPriceCents: item.product.priceCents,
        quantity: item.quantity,
        lineTotalCents: item.product.priceCents * item.quantity,
      })),
    });

    // Décrémente le stock de chaque produit commandé
    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await tx.cartItem.deleteMany({ where: { userId } });

    return { orderId: order.id, orderNumber: order.orderNumber, totalCents, paymentStatus: "pending_payment" as const };
  });
}

export async function markOrderAsPaid(
  userId: number,
  orderId: number,
  invoice?: { stripeInvoiceId?: string; stripeInvoiceUrl?: string }
) {
  const result = await prisma.order.updateMany({
    where: { id: orderId, userId, paymentStatus: "pending_payment" },
    data: {
      paymentStatus: "paid",
      ...(invoice?.stripeInvoiceId ? { stripeInvoiceId: invoice.stripeInvoiceId } : {}),
      ...(invoice?.stripeInvoiceUrl ? { stripeInvoiceUrl: invoice.stripeInvoiceUrl } : {}),
    },
  });
  return result.count > 0;
}

export async function markOrderAsCancelled(userId: number, orderId: number) {
  const result = await prisma.order.updateMany({
    where: { id: orderId, userId, paymentStatus: { not: "paid" } },
    data: { paymentStatus: "cancelled" },
  });
  return result.count > 0;
}

export async function getOrdersByUserId(userId: number): Promise<OrderSummary[]> {
  const rows = await prisma.order.findMany({
    where: { userId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      orderNumber: true,
      createdAt: true,
      totalCents: true,
      paymentStatus: true,
    },
  });

  return rows.map((row) => ({
    id: row.id,
    orderNumber: row.orderNumber,
    createdAt: row.createdAt.toISOString(),
    totalCents: row.totalCents,
    paymentStatus: row.paymentStatus,
  }));
}

export async function getOrderDetailById(userId: number, orderId: number): Promise<OrderDetail | null> {
  const row = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: { orderBy: { id: "asc" } },
    },
  });

  if (!row) return null;

  return {
    id: row.id,
    orderNumber: row.orderNumber,
    createdAt: row.createdAt.toISOString(),
    totalCents: row.totalCents,
    paymentStatus: row.paymentStatus,
    stripeInvoiceUrl: row.stripeInvoiceUrl ?? null,
    shippingAddressId: row.shippingAddressId,
    billingAddressId: row.billingAddressId,
    items: row.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      unitPriceCents: item.unitPriceCents,
      quantity: item.quantity,
      lineTotalCents: item.lineTotalCents,
    })),
  };
}

export type OrderInvoiceData = {
  id: number;
  orderNumber: string;
  createdAt: string;
  totalCents: number;
  paymentStatus: OrderStatus;
  customer: { fullName: string; email: string };
  stripeInvoiceUrl: string | null;
  shippingAddress: { name: string; street: string; city: string; zipcode: string; country: string; company: string | null };
  billingAddress: { name: string; street: string; city: string; zipcode: string; country: string; company: string | null; vatNumber: string | null };
  items: { productName: string; unitPriceCents: number; quantity: number; lineTotalCents: number }[];
};

export async function getOrderInvoiceData(userId: number, orderId: number): Promise<OrderInvoiceData | null> {
  const row = await prisma.order.findFirst({
    where: { id: orderId, userId, paymentStatus: "paid" },
    include: {
      items: { orderBy: { id: "asc" } },
      user: { select: { fullName: true, email: true } },
      shippingAddress: true,
      billingAddress: true,
    },
  });
  if (!row) return null;

  return {
    id: row.id,
    orderNumber: row.orderNumber,
    createdAt: row.createdAt.toISOString(),
    totalCents: row.totalCents,
    paymentStatus: row.paymentStatus,
    stripeInvoiceUrl: row.stripeInvoiceUrl ?? null,
    customer: { fullName: row.user.fullName, email: row.user.email },
    shippingAddress: {
      name: row.shippingAddress.name,
      street: row.shippingAddress.street,
      city: row.shippingAddress.city,
      zipcode: row.shippingAddress.zipcode,
      country: row.shippingAddress.country ?? "France",
      company: row.shippingAddress.company ?? null,
    },
    billingAddress: {
      name: row.billingAddress.name,
      street: row.billingAddress.street,
      city: row.billingAddress.city,
      zipcode: row.billingAddress.zipcode,
      country: row.billingAddress.country ?? "France",
      company: row.billingAddress.company ?? null,
      vatNumber: row.billingAddress.vatNumber ?? null,
    },
    items: row.items.map((item) => ({
      productName: item.productName,
      unitPriceCents: item.unitPriceCents,
      quantity: item.quantity,
      lineTotalCents: item.lineTotalCents,
    })),
  };
}

export async function getPaidOrdersWithItemsByUserId(userId: number): Promise<PaidOrderForReturn[]> {
  const rows = await prisma.order.findMany({
    where: { userId, paymentStatus: "paid" },
    select: {
      id: true,
      orderNumber: true,
      items: {
        select: { id: true, productName: true },
        orderBy: { id: "asc" },
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });

  return rows.map((row) => ({
    id: row.id,
    orderNumber: row.orderNumber,
    items: row.items.map((item) => ({
      id: item.id,
      productName: item.productName,
    })),
  }));
}
