// src/app/api/cart/add/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import type { RowDataPacket } from "mysql2/promise";

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
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

    // Optionnel mais propre : vérifier que le produit existe
    const [prows] = await pool.query<RowDataPacket[]>(
      "SELECT 1 FROM products WHERE id = ? LIMIT 1",
      [productId]
    );
    if (!prows.length) return NextResponse.json({ error: "INVALID_PRODUCT" }, { status: 400 });

    await pool.query(
      `
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES (?, ?, 1)
      ON DUPLICATE KEY UPDATE quantity = quantity + 1
      `,
      [user.id, productId]
    );

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("CART_ADD_ERROR:", err);
    return NextResponse.json(
      { error: "CART_ADD_FAILED", message: errorMessage(err) },
      { status: 500 }
    );
  }
}
