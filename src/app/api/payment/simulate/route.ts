import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { markOrderAsPaid } from "@/lib/orders";

// Simule un paiement réussi pour l'environnement de développement.
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { orderId?: number } | null;
  const orderId = Number(body?.orderId);

  if (!orderId) return NextResponse.json({ error: "INVALID_ORDER" }, { status: 400 });

  const updated = await markOrderAsPaid(user.id, orderId);
  if (!updated) return NextResponse.json({ error: "PAYMENT_UPDATE_FAILED" }, { status: 400 });

  return NextResponse.json({ ok: true, paymentStatus: "paid" });
}
