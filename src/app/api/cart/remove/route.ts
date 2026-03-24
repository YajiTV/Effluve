import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

    const body = (await req.json()) as { cartItemId: number };

    if (!body.cartItemId) {
      return NextResponse.json({ error: "INVALID_DATA" }, { status: 400 });
    }

    await prisma.cartItem.deleteMany({
      where: { id: body.cartItemId, userId: user.id },
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("CART_REMOVE_ERROR:", err);
    return NextResponse.json({ error: "REMOVE_FAILED" }, { status: 500 });
  }
}
