import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { estimateShippingCost } from "@/lib/shippo";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

    const body = (await req.json().catch(() => null)) as { addressId?: number; itemCount?: number } | null;
    const addressId = Number(body?.addressId);
    const itemCount = Number(body?.itemCount) || 1;

    if (!addressId) return NextResponse.json({ error: "INVALID_ADDRESS" }, { status: 400 });

    const estimate = await estimateShippingCost({ addressId, userId: user.id, itemCount });
    return NextResponse.json({ ok: true, ...estimate });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    console.error("[POST /api/shipping/estimate]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
