// src/app/api/cart/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import type { RowDataPacket } from "mysql2/promise";

type CartRow = RowDataPacket & {
  cartitemid: number;
  quantity: number;
  productid: number;
  name: string;
  pricecents: number;
  imageurl: string | null;
};

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

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
    [user.id]
  );

  return NextResponse.json(rows);
}
