import { NextResponse } from "next/server";
import type { ReturnStatus } from "@prisma/client";
import { getSessionUser } from "@/lib/auth";
import { adminUpdateReturn } from "@/lib/returns";

type Context = { params: Promise<{ id: string }> };

const ALLOWED_STATUS: ReturnStatus[] = [
  "requested",
  "approved",
  "rejected",
  "received",
  "refunded",
  "cancelled",
];

export async function PATCH(req: Request, { params }: Context) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const { id } = await params;
  const returnId = Number(id);
  if (!Number.isFinite(returnId) || returnId <= 0) {
    return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as
    | { status?: ReturnStatus; refundCents?: number | null }
    | null;

  const status = body?.status;
  const refundCents =
    body?.refundCents === null || body?.refundCents === undefined ? null : Number(body.refundCents);

  if (!status || !ALLOWED_STATUS.includes(status)) {
    return NextResponse.json({ error: "INVALID_DATA" }, { status: 400 });
  }
  if (refundCents !== null && (!Number.isFinite(refundCents) || refundCents < 0)) {
    return NextResponse.json({ error: "INVALID_DATA" }, { status: 400 });
  }

  try {
    const updated = await adminUpdateReturn({ returnId, status, refundCents });
    return NextResponse.json({ ok: true, updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "RETURN_UPDATE_FAILED";
    if (message === "RETURN_NOT_FOUND") return NextResponse.json({ error: message }, { status: 404 });
    if (message === "RETURN_INVALID_TRANSITION" || message === "RETURN_REFUND_REQUIRED") {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    if (message === "RETURNS_TABLE_MISSING") {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    return NextResponse.json({ error: "RETURN_UPDATE_FAILED" }, { status: 500 });
  }
}
