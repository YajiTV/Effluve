import { NextResponse } from "next/server";
import { validatePromoCode } from "@/lib/promo";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`promo:${ip}`, 10, 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { valid: false, error: "Trop de tentatives. Réessayez dans 1 minute." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  const body = (await req.json().catch(() => null)) as
    | { code?: string; orderTotalCents?: number }
    | null;

  const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
  const orderTotalCents = Number(body?.orderTotalCents);

  if (!code) {
    return NextResponse.json({ valid: false, error: "Code manquant." }, { status: 400 });
  }

  if (!orderTotalCents || orderTotalCents < 0) {
    return NextResponse.json({ valid: false, error: "Montant de commande invalide." }, { status: 400 });
  }

  const result = await validatePromoCode(code, orderTotalCents);
  return NextResponse.json(result);
}
