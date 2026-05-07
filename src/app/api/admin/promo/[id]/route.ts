import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAdminLog } from "@/lib/admin-log";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  if (user.role !== "admin" && user.role !== "superadmin") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const { id } = await params;
  const promoId = Number(id);
  if (!promoId) return NextResponse.json({ error: "ID invalide." }, { status: 400 });

  const body = (await req.json().catch(() => null)) as { isActive?: boolean } | null;
  if (typeof body?.isActive !== "boolean") {
    return NextResponse.json({ error: "isActive requis." }, { status: 400 });
  }

  const promo = await prisma.promoCode.update({
    where: { id: promoId },
    data: { isActive: body.isActive },
  });

  await createAdminLog({
    adminId: user.id,
    action: "promo.toggled",
    target: `promo:${promoId}`,
    details: JSON.stringify({ isActive: body.isActive, code: promo.code }),
  });

  return NextResponse.json({ ok: true, promo });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  if (user.role !== "admin" && user.role !== "superadmin") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const { id } = await params;
  const promoId = Number(id);
  if (!promoId) return NextResponse.json({ error: "ID invalide." }, { status: 400 });

  const promo = await prisma.promoCode.findUnique({ where: { id: promoId }, select: { code: true } });
  await prisma.promoCode.delete({ where: { id: promoId } });

  await createAdminLog({
    adminId: user.id,
    action: "promo.deleted",
    target: `promo:${promoId}`,
    details: JSON.stringify({ code: promo?.code }),
  });

  return NextResponse.json({ ok: true });
}
