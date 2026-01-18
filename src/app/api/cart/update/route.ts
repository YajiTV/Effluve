// src/app/api/cart/update/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

    const body = (await req.json()) as { cartItemId: number; quantity: number };
    
    if (!body.cartItemId || body.quantity < 1) {
      return NextResponse.json({ error: "INVALID_DATA" }, { status: 400 });
    }

    await pool.query(
      "UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?",
      [body.quantity, body.cartItemId, user.id]
    );

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("CART_UPDATE_ERROR:", err);
    return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
  }
}
