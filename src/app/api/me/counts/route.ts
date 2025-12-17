// src/app/api/me/counts/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import type { RowDataPacket } from "mysql2/promise";

type Row = RowDataPacket & { count: number };

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ cartCount: 0, wishlistCount: 0 });

  const [[cart]] = await pool.query<Row[]>(
    "SELECT COALESCE(SUM(quantity), 0) AS count FROM cart_items WHERE user_id = ?",
    [user.id]
  );
  const [[wish]] = await pool.query<Row[]>(
    "SELECT COUNT(*) AS count FROM wishlist_items WHERE user_id = ?",
    [user.id]
  );

  return NextResponse.json({ cartCount: Number(cart.count), wishlistCount: Number(wish.count) });
}
