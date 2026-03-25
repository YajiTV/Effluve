import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createOrderFromCart } from "@/lib/orders";

// Gère la création d'une nouvelle commande à partir du panier de l'utilisateur.
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as
    | {
        shippingAddressId?: number;
        billingAddressId?: number;
      }
    | null;

  const shippingAddressId = Number(body?.shippingAddressId);
  const billingAddressId = Number(body?.billingAddressId);

  if (!shippingAddressId || !billingAddressId) {
    return NextResponse.json({ error: "INVALID_ADDRESSES" }, { status: 400 });
  }

  try {
    const order = await createOrderFromCart({
      userId: user.id,
      shippingAddressId,
      billingAddressId,
    });

    return NextResponse.json({ ok: true, order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ORDER_CREATE_FAILED";

    if (message === "PANIER_VIDE") {
      return NextResponse.json({ error: "PANIER_VIDE" }, { status: 400 });
    }

    if (message === "ADRESSE_INVALIDE") {
      return NextResponse.json({ error: "ADRESSE_INVALIDE" }, { status: 400 });
    }

    if (message.startsWith("STOCK_INSUFFISANT:")) {
      const products = message.replace("STOCK_INSUFFISANT:", "");
      return NextResponse.json({ error: "STOCK_INSUFFISANT", products }, { status: 400 });
    }

    return NextResponse.json({ error: "ORDER_CREATE_FAILED" }, { status: 500 });
  }
}
