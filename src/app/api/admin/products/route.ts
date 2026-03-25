import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createProduct } from "@/lib/admin-products";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json();
  const product = await createProduct({
    name: body.name,
    description: body.description || null,
    priceCents: Number(body.priceCents),
    imageUrl: body.imageUrl || null,
    category: body.category,
    stock: Number(body.stock),
    isActive: Boolean(body.isActive),
  });

  return NextResponse.json(product, { status: 201 });
}
