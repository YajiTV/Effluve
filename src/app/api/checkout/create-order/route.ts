import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createOrderFromCart } from "@/lib/orders";
import { validatePromoCode } from "@/lib/promo";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as {
    shippingAddressId?: number;
    billingAddressId?: number;
    promoCode?: string;
    useLoyalty?: boolean;
  } | null;

  const shippingAddressId = Number(body?.shippingAddressId);
  const billingAddressId = Number(body?.billingAddressId);

  if (!shippingAddressId || !billingAddressId) {
    return NextResponse.json({ error: "INVALID_ADDRESSES" }, { status: 400 });
  }

  let discountCents = 0;
  let validatedPromoCode: string | undefined;

  if (body?.promoCode) {
    const { prisma } = await import("@/lib/prisma");
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: { select: { priceCents: true } } },
    });
    const subTotal = cartItems.reduce((sum, item) => sum + item.product.priceCents * item.quantity, 0);

    const promoResult = await validatePromoCode(body.promoCode.trim().toUpperCase(), subTotal);
    if (promoResult.valid) {
      discountCents = promoResult.discountCents;
      validatedPromoCode = promoResult.code;
    }
  }

  try {
    const order = await createOrderFromCart({
      userId: user.id,
      shippingAddressId,
      billingAddressId,
      promoCode: validatedPromoCode,
      discountCents,
      useLoyaltyPalier: body?.useLoyalty === true,
    });

    if (validatedPromoCode) {
      const { applyPromoCode } = await import("@/lib/promo");
      await applyPromoCode(validatedPromoCode).catch(() => null);
    }

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
