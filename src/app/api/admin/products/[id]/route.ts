import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { updateProduct, deleteProduct } from "@/lib/admin-products";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const updated = await updateProduct(Number(id), {
    name: body.name,
    description: body.description ?? undefined,
    priceCents: body.priceCents !== undefined ? Number(body.priceCents) : undefined,
    imageUrl: body.imageUrl ?? undefined,
    category: body.category,
    stock: body.stock !== undefined ? Number(body.stock) : undefined,
    isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { id } = await params;
  await deleteProduct(Number(id));
  return NextResponse.json({ ok: true });
}
