import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { updateOrderStatus, ORDER_STATUSES } from "@/lib/admin-orders";
import { PaymentStatus } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { id } = await params;
  const orderId = parseInt(id, 10);
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  const body = await req.json();
  const status = body.status as PaymentStatus;

  if (!ORDER_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  await updateOrderStatus(orderId, status);
  return NextResponse.json({ ok: true });
}
