import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createProduct } from "@/lib/admin-products";
import { createAdminLog } from "@/lib/admin-log";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin" && user.role !== "superadmin") {
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

  await createAdminLog({
    adminId: user.id,
    action: "product.created",
    target: `product:${product.id}`,
    details: JSON.stringify({ name: product.name, category: product.category }),
  });

  return NextResponse.json(product, { status: 201 });
}
