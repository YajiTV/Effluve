// src/app/api/cart/add/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import type { RowDataPacket } from "mysql2/promise";

type CartExistingRow = RowDataPacket & { id: number };

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;

  // Pour capturer sqlMessage/code sans any
  if (typeof err === "object" && err !== null) {
    const rec = err as Record<string, unknown>;
    const sqlMessage = rec["sqlMessage"];
    const message = rec["message"];
    if (typeof sqlMessage === "string") return sqlMessage;
    if (typeof message === "string") return message;
  }

  return "Erreur serveur";
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

    const body = (await req.json().catch(() => null)) as { productId?: number } | null;
    const productId = Number(body?.productId);
    if (!productId) return NextResponse.json({ error: "INVALID_PRODUCT" }, { status: 400 });

    const [existing] = await pool.query<CartExistingRow[]>(
      "SELECT id FROM cart_items WHERE user_id = ? AND product_id = ? LIMIT 1",
      [user.id, productId]
    );

    if (existing.length) {
      await pool.query("UPDATE cart_items SET quantity = quantity + 1 WHERE id = ?", [
        existing[0].id,
      ]);
    } else {
      await pool.query(
        "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, 1)",
        [user.id, productId]
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("CART_ADD_ERROR:", err);
    return NextResponse.json(
      { error: "CART_ADD_FAILED", message: errorMessage(err) },
      { status: 500 }
    );
  }
}
