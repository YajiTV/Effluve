import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import type { RowDataPacket } from "mysql2/promise";

type WishlistRow = RowDataPacket & {
  wishlist_item_id: number;
  product_id: number;
  name: string;
  description: string | null;
  price_cents: number;
  image_url: string | null;
  category: "homme" | "femme" | "accessoires";
  in_stock: 0 | 1;
};

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const [rows] = await pool.query<WishlistRow[]>(
  `
  SELECT
    w.id           AS wishlist_item_id,
    p.id           AS product_id,
    p.name,
    p.description,
    p.pricecents   AS price_cents,
    p.imageurl     AS image_url,
    p.category,
    p.isactive     AS in_stock
  FROM wishlist_items w
  JOIN products p ON p.id = w.product_id
  WHERE w.user_id = ?
  ORDER BY w.created_at DESC
  `,
  [user.id]
);


  return NextResponse.json(
    rows.map((r) => ({
      id: r.wishlist_item_id,
      productId: r.product_id,
      name: r.name,
      description: r.description,
      priceCents: Number(r.price_cents),
      image: r.image_url,
      category: r.category,
      inStock: Boolean(r.in_stock),
    }))
  );
}
