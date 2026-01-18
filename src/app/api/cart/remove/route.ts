// src/app/api/cart/remove/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

    const body = (await req.json()) as { cartItemId: number };
    
    if (!body.cartItemId) {
      return NextResponse.json({ error: "INVALID_DATA" }, { status: 400 });
    }

    await pool.query(
      "DELETE FROM cart_items WHERE id = ? AND user_id = ?",
      [body.cartItemId, user.id]
    );

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("CART_REMOVE_ERROR:", err);
    return NextResponse.json({ error: "REMOVE_FAILED" }, { status: 500 });
  }
}
