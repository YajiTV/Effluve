import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import type { RowDataPacket } from "mysql2/promise";

type ExistsRow = RowDataPacket & { id: number };

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { productId?: number } | null;
  const productId = Number(body?.productId);
  if (!productId) return NextResponse.json({ error: "INVALID_PRODUCT" }, { status: 400 });

  const [rows] = await pool.query<ExistsRow[]>(
    "SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ? LIMIT 1",
    [user.id, productId]
  );

  if (rows.length) {
    await pool.query("DELETE FROM wishlist_items WHERE id = ?", [rows[0].id]);
    return NextResponse.json({ ok: true, wished: false });
  }

  await pool.query("INSERT INTO wishlist_items (user_id, product_id) VALUES (?, ?)", [
    user.id,
    productId,
  ]);
  return NextResponse.json({ ok: true, wished: true });
}
