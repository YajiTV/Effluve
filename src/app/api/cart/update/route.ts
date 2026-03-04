import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

    const body = (await req.json()) as { cartItemId: number; quantity: number };

    if (!body.cartItemId || body.quantity < 1) {
      return NextResponse.json({ error: "INVALID_DATA" }, { status: 400 });
    }

    await prisma.cartItem.updateMany({
      where: { id: body.cartItemId, userId: user.id },
      data: { quantity: body.quantity },
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("CART_UPDATE_ERROR:", err);
    return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
  }
}
