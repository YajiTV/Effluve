import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ cartCount: 0, wishlistCount: 0 });

  const [cartAgg, wishlistCount] = await Promise.all([
    prisma.cartItem.aggregate({
      where: { userId: user.id },
      _sum: { quantity: true },
    }),
    prisma.wishlistItem.count({
      where: { userId: user.id },
    }),
  ]);

  return NextResponse.json({
    cartCount: cartAgg._sum.quantity ?? 0,
    wishlistCount,
  });
}
