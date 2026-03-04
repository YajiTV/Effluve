import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";
import { markOrderAsPaid } from "@/lib/orders";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  if (!isStripeConfigured) return NextResponse.json({ error: "STRIPE_NOT_CONFIGURED" }, { status: 503 });
  const stripe = getStripeClient();

  const body = (await req.json().catch(() => null)) as { orderId?: number; sessionId?: string } | null;
  const orderId = Number(body?.orderId);
  const sessionId = String(body?.sessionId ?? "").trim();
  if (!orderId || !sessionId) return NextResponse.json({ error: "INVALID_DATA" }, { status: 400 });

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (!session || session.mode !== "payment") {
    return NextResponse.json({ error: "INVALID_SESSION" }, { status: 400 });
  }

  const metadataOrderId = Number(session.metadata?.orderId ?? 0);
  const metadataUserId = Number(session.metadata?.userId ?? 0);
  if (metadataOrderId !== orderId || metadataUserId !== user.id) {
    return NextResponse.json({ error: "SESSION_MISMATCH" }, { status: 403 });
  }

  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "PAYMENT_NOT_COMPLETED" }, { status: 400 });
  }

  const updated = await markOrderAsPaid(user.id, orderId);
  if (!updated) return NextResponse.json({ error: "PAYMENT_UPDATE_FAILED" }, { status: 400 });

  return NextResponse.json({ ok: true, paymentStatus: "paid" });
}
