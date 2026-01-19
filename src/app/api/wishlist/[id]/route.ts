// src/app/api/wishlist/[id]/route.ts
import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2/promise";

import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

type Context = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Context) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const { id } = await params; // ✅ Next.js 16: params est une Promise [web:278]
    const wishlistId = Number(id);

    if (!Number.isFinite(wishlistId) || wishlistId <= 0) {
      return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
    }

    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM wishlist_items WHERE id = ? AND user_id = ?",
      [wishlistId, user.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Article introuvable dans tes favoris." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("WISHLIST_DELETE_ERROR:", err);
    return NextResponse.json(
      { error: "WISHLIST_DELETE_FAILED", message: "Erreur serveur." },
      { status: 500 }
    );
  }
}
