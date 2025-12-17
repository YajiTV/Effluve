import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

type Params = { params: { id: string } };

export async function DELETE(_req: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const wishlistId = Number(params.id);
  if (!wishlistId) {
    return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
  }

  await pool.query(
    "DELETE FROM wishlist_items WHERE id = ? AND user_id = ?",
    [wishlistId, user.id]
  );

  return NextResponse.json({ ok: true });
}
