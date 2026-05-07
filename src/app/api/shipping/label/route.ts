import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { generateLabel } from "@/lib/shippo";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    if (user.role !== "admin" && user.role !== "superadmin") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

    const body = (await req.json().catch(() => null)) as { orderId?: number } | null;
    const orderId = Number(body?.orderId);
    if (!orderId || orderId <= 0) return NextResponse.json({ error: "INVALID_ORDER" }, { status: 400 });

    const result = await generateLabel(orderId);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    console.error("[POST /api/shipping/label]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
