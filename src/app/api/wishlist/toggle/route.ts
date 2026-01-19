import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import type { RowDataPacket } from "mysql2/promise";

type ExistingRow = RowDataPacket & { id: number };

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

    const [prows] = await pool.query<RowDataPacket[]>(
      "SELECT 1 FROM products WHERE id = ? LIMIT 1",
      [productId]
    );
    if (!prows.length) return NextResponse.json({ error: "INVALID_PRODUCT" }, { status: 400 });

    const [rows] = await pool.query<ExistingRow[]>(
      "SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ? LIMIT 1",
      [user.id, productId]
    );

    if (rows.length) {
      await pool.query("DELETE FROM wishlist_items WHERE id = ? AND user_id = ?", [rows[0].id, user.id]);
      return NextResponse.json({ ok: true, wished: false });
    }

    await pool.query(
      "INSERT INTO wishlist_items (user_id, product_id) VALUES (?, ?)",
      [user.id, productId]
    );

    return NextResponse.json({ ok: true, wished: true });
  } catch (err: unknown) {
    console.error("WISHLIST_TOGGLE_ERROR:", err);
    return NextResponse.json(
      { error: "WISHLIST_TOGGLE_FAILED", message: errorMessage(err) },
      { status: 500 }
    );
  }
}
