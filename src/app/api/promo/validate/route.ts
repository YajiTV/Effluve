import { NextResponse } from "next/server";
import { validatePromoCode } from "@/lib/promo";

export async function POST(req: Request) {
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
