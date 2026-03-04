import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";
import { getCartItemsByUserId } from "@/lib/cart";

export type OrderStatus = "pending_payment" | "paid" | "cancelled";

export type OrderSummary = {
  id: number;
  orderNumber: string;
  createdAt: string;
  totalCents: number;
  paymentStatus: OrderStatus;
};

type OrderRow = RowDataPacket & {
  id: number;
  order_number: string;
  created_at: string;
  total_cents: number;
  payment_status: OrderStatus;
};

export type OrderDetail = {
  id: number;
  orderNumber: string;
  createdAt: string;
  totalCents: number;
  paymentStatus: OrderStatus;
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

type OrderDetailRow = RowDataPacket & {
  id: number;
  order_number: string;
  created_at: string;
  total_cents: number;
  payment_status: OrderStatus;
  shipping_address_id: number;
  billing_address_id: number;
};

type OrderItemRow = RowDataPacket & {
  id: number;
  product_id: number;
  product_name: string;
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
};

function makeOrderNumber(userId: number) {
  const stamp = Date.now().toString(36).toUpperCase();
  return `EFF-${userId}-${stamp}`;
}

// Crée une commande à partir du panier utilisateur et vide le panier dans la même transaction.
export async function createOrderFromCart(params: {
  userId: number;
  shippingAddressId: number;
  billingAddressId: number;
}) {
  const { userId, shippingAddressId, billingAddressId } = params;
  const cartItems = await getCartItemsByUserId(userId);
  if (!cartItems.length) {
    throw new Error("PANIER_VIDE");
  }

  const totalCents = cartItems.reduce((sum, row) => sum + row.pricecents * row.quantity, 0);
  const orderNumber = makeOrderNumber(userId);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await assertAddressOwnership(connection, userId, shippingAddressId);
    await assertAddressOwnership(connection, userId, billingAddressId);

    const [orderResult] = await connection.query<ResultSetHeader>(
      `
      INSERT INTO orders (
        user_id,
        order_number,
        total_cents,
        payment_status,
        shipping_address_id,
        billing_address_id
      ) VALUES (?, ?, ?, 'pending_payment', ?, ?)
      `,
      [userId, orderNumber, totalCents, shippingAddressId, billingAddressId]
    );

    const orderId = Number(orderResult.insertId);

    for (const item of cartItems) {
      const lineTotalCents = item.pricecents * item.quantity;
      await connection.query(
        `
        INSERT INTO order_items (
          order_id,
          product_id,
          product_name,
          unit_price_cents,
          quantity,
          line_total_cents
        ) VALUES (?, ?, ?, ?, ?, ?)
        `,
        [orderId, item.productid, item.name, item.pricecents, item.quantity, lineTotalCents]
      );
    }

    await connection.query("DELETE FROM cart_items WHERE user_id = ?", [userId]);
    await connection.commit();

    return { orderId, orderNumber, totalCents, paymentStatus: "pending_payment" as const };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Simule un paiement validé en basculant l'état de la commande vers "paid".
export async function markOrderAsPaid(userId: number, orderId: number) {
  const [result] = await pool.query<ResultSetHeader>(
    `
    UPDATE orders
    SET payment_status = 'paid', updated_at = NOW()
    WHERE id = ? AND user_id = ? AND payment_status = 'pending_payment'
    `,
    [orderId, userId]
  );

  return result.affectedRows > 0;
}

// Simule une annulation de paiement pour garder un état métier explicite.
export async function markOrderAsCancelled(userId: number, orderId: number) {
  const [result] = await pool.query<ResultSetHeader>(
    `
    UPDATE orders
    SET payment_status = 'cancelled', updated_at = NOW()
    WHERE id = ? AND user_id = ? AND payment_status != 'paid'
    `,
    [orderId, userId]
  );

  return result.affectedRows > 0;
}

export async function getOrdersByUserId(userId: number): Promise<OrderSummary[]> {
  const [rows] = await pool.query<OrderRow[]>(
    `
    SELECT id, order_number, created_at, total_cents, payment_status
    FROM orders
    WHERE user_id = ?
    ORDER BY created_at DESC, id DESC
    `,
    [userId]
  );

  return rows.map((row) => ({
    id: Number(row.id),
    orderNumber: String(row.order_number),
    createdAt: String(row.created_at),
    totalCents: Number(row.total_cents),
    paymentStatus: row.payment_status,
  }));
}

export async function getOrderDetailById(userId: number, orderId: number): Promise<OrderDetail | null> {
  const [orders] = await pool.query<OrderDetailRow[]>(
    `
    SELECT id, order_number, created_at, total_cents, payment_status, shipping_address_id, billing_address_id
    FROM orders
    WHERE id = ? AND user_id = ?
    LIMIT 1
    `,
    [orderId, userId]
  );

  if (!orders.length) return null;

  const [items] = await pool.query<OrderItemRow[]>(
    `
    SELECT id, product_id, product_name, unit_price_cents, quantity, line_total_cents
    FROM order_items
    WHERE order_id = ?
    ORDER BY id ASC
    `,
    [orderId]
  );

  const order = orders[0];
  return {
    id: Number(order.id),
    orderNumber: String(order.order_number),
    createdAt: String(order.created_at),
    totalCents: Number(order.total_cents),
    paymentStatus: order.payment_status,
    shippingAddressId: Number(order.shipping_address_id),
    billingAddressId: Number(order.billing_address_id),
    items: items.map((item) => ({
      id: Number(item.id),
      productId: Number(item.product_id),
      productName: String(item.product_name),
      unitPriceCents: Number(item.unit_price_cents),
      quantity: Number(item.quantity),
      lineTotalCents: Number(item.line_total_cents),
    })),
  };
}

async function assertAddressOwnership(connection: PoolConnection, userId: number, addressId: number) {
  const [rows] = await connection.query<RowDataPacket[]>(
    "SELECT id FROM addresses WHERE id = ? AND user_id = ? LIMIT 1",
    [addressId, userId]
  );

  if (!rows.length) {
    throw new Error("ADRESSE_INVALIDE");
  }
}
