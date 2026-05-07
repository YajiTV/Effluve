import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAdminLog } from "@/lib/admin-log";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  if (user.role !== "admin" && user.role !== "superadmin") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const promos = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ promos });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  if (user.role !== "admin" && user.role !== "superadmin") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as {
    code?: string;
    discountType?: string;
    discountValue?: number;
    minOrderCents?: number;
    maxUses?: number | null;
    expiresAt?: string | null;
  } | null;

  const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
  const discountType = body?.discountType;
  const discountValue = Number(body?.discountValue);

  if (!code) {
    return NextResponse.json({ error: "Code manquant." }, { status: 400 });
  }

  if (discountType !== "percent" && discountType !== "fixed") {
    return NextResponse.json({ error: "Type de remise invalide." }, { status: 400 });
  }

  if (!discountValue || discountValue <= 0) {
    return NextResponse.json({ error: "Valeur de remise invalide." }, { status: 400 });
  }

  const existing = await prisma.promoCode.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.json({ error: "Ce code existe déjà." }, { status: 409 });
  }

  const promo = await prisma.promoCode.create({
    data: {
      code,
      discountType,
      discountValue,
      minOrderCents: Number(body?.minOrderCents ?? 0),
      maxUses: body?.maxUses ? Number(body.maxUses) : null,
      expiresAt: body?.expiresAt ? new Date(body.expiresAt) : null,
      isActive: true,
    },
  });

  await createAdminLog({
    adminId: user.id,
    action: "promo.created",
    target: `promo:${promo.id}`,
    details: JSON.stringify({ code: promo.code, discountType: promo.discountType, discountValue: promo.discountValue }),
  });

  return NextResponse.json({ ok: true, promo }, { status: 201 });
}
