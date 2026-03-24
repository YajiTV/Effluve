import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Context) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const { id } = await params;
    const wishlistId = Number(id);

    if (!Number.isFinite(wishlistId) || wishlistId <= 0) {
      return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
    }

    const result = await prisma.wishlistItem.deleteMany({
      where: { id: wishlistId, userId: user.id },
    });

    if (result.count === 0) {
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
