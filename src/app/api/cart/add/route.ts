import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null) {
    const rec = err as Record<string, unknown>;
    const message = rec["message"];
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

    const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
    if (!product) return NextResponse.json({ error: "INVALID_PRODUCT" }, { status: 400 });

    await prisma.cartItem.upsert({
      where: { userId_productId: { userId: user.id, productId } },
      create: { userId: user.id, productId, quantity: 1 },
      update: { quantity: { increment: 1 } },
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("CART_ADD_ERROR:", err);
    return NextResponse.json(
      { error: "CART_ADD_FAILED", message: errorMessage(err) },
      { status: 500 }
    );
  }
}
