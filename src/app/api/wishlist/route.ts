import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const rows = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      productId: r.productId,
      name: r.product.name,
      description: r.product.description,
      priceCents: r.product.priceCents,
      image: r.product.imageUrl,
      category: r.product.category,
      inStock: Boolean(r.product.isActive),
    }))
  );
}
