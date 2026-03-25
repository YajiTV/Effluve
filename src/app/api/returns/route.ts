import { NextResponse } from "next/server";
import type { ReturnReason } from "@prisma/client";
import { getSessionUser } from "@/lib/auth";
import { createReturnRequest, getReturnsByUserId } from "@/lib/returns";

const ALLOWED_REASONS: ReturnReason[] = [
  "too_small",
  "too_large",
  "damaged",
  "not_as_described",
  "wrong_item",
  "changed_mind",
  "other",
];

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const rows = await getReturnsByUserId(user.id);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as
    | { orderId?: number; orderItemId?: number | null; reason?: ReturnReason; note?: string }
    | null;

  const orderId = Number(body?.orderId);
  const orderItemId =
    body?.orderItemId === null || body?.orderItemId === undefined ? null : Number(body?.orderItemId);
  const reason = body?.reason;
  const note = String(body?.note ?? "").trim();

  if (!orderId || !reason || !ALLOWED_REASONS.includes(reason)) {
    return NextResponse.json({ error: "INVALID_DATA" }, { status: 400 });
  }
  if (orderItemId !== null && (!Number.isFinite(orderItemId) || orderItemId <= 0)) {
    return NextResponse.json({ error: "INVALID_DATA" }, { status: 400 });
  }

  try {
    const id = await createReturnRequest({
      userId: user.id,
      orderId,
      orderItemId,
      reason,
      note,
    });
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "RETURN_CREATE_FAILED";
    if (message === "RETURNS_TABLE_MISSING") {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    if (message === "ORDER_NOT_RETURNABLE" || message === "ORDER_ITEM_INVALID") {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json({ error: "RETURN_CREATE_FAILED" }, { status: 500 });
  }
}
