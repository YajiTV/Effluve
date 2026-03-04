import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";

export type CartItem = {
  cartitemid: number;
  quantity: number;
  productid: number;
  name: string;
  pricecents: number;
  imageurl: string | null;
};

type CartRow = RowDataPacket & CartItem;

export async function getCartItemsByUserId(userId: number): Promise<CartItem[]> {
  const [rows] = await pool.query<CartRow[]>(
    `
    SELECT
      ci.id        AS cartitemid,
      ci.quantity  AS quantity,
      p.id         AS productid,
      p.name       AS name,
      p.pricecents AS pricecents,
      p.imageurl   AS imageurl
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = ?
    ORDER BY ci.id DESC
    `,
    [userId]
  );

  return rows.map((row) => ({
    cartitemid: Number(row.cartitemid),
    quantity: Number(row.quantity),
    productid: Number(row.productid),
    name: String(row.name),
    pricecents: Number(row.pricecents),
    imageurl: row.imageurl ?? null,
  }));
}

export async function getCartTotalCents(userId: number): Promise<number> {
  const items = await getCartItemsByUserId(userId);
  return items.reduce((sum, item) => sum + item.pricecents * item.quantity, 0);
}
