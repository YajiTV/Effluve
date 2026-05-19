import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";

function getBaseUrl(reqUrl: string): string {
  const { origin } = new URL(reqUrl);
  const basePath = process.env.NODE_ENV === "production" ? "/effluve" : "";
  return `${origin}${basePath}`;
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    if (!isStripeConfigured) return NextResponse.json({ error: "STRIPE_NOT_CONFIGURED" }, { status: 503 });

    const stripe = getStripeClient();
    const body = (await req.json().catch(() => null)) as { orderId?: number } | null;
    const orderId = Number(body?.orderId);
    if (!orderId) return NextResponse.json({ error: "INVALID_ORDER" }, { status: 400 });

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id, paymentStatus: "pending_payment" },
      include: {
        items: true,
        billingAddress: true,
      },
    });
    if (!order) return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });

    const baseUrl = getBaseUrl(req.url);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `Commande ${order.orderNumber} — EFFLUVE`,
          metadata: { orderId: String(order.id) },
          ...(order.billingAddress.company
            ? { custom_fields: [{ name: "Entreprise", value: order.billingAddress.company }] }
            : {}),
          ...(order.billingAddress.vatNumber
            ? {
                custom_fields: [
                  ...(order.billingAddress.company
                    ? [{ name: "Entreprise", value: order.billingAddress.company }]
                    : []),
                  { name: "N° TVA", value: order.billingAddress.vatNumber },
                ],
              }
            : {}),
        },
      },
      line_items: [
        ...order.items.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: "eur",
            unit_amount: item.unitPriceCents,
            product_data: { name: item.productName },
          },
        })),
        ...(order.shippingCostCents > 0
          ? [{
              quantity: 1,
              price_data: {
                currency: "eur",
                unit_amount: order.shippingCostCents,
                product_data: { name: "Frais de livraison" },
              },
            }]
          : []),
      ],
      metadata: {
        orderId: String(order.id),
        userId: String(user.id),
      },
      success_url: `${baseUrl}/checkout/success?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
    });

    if (!session.url) return NextResponse.json({ error: "STRIPE_SESSION_FAILED" }, { status: 500 });
    return NextResponse.json({ ok: true, url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("[POST /api/payment/stripe/session]", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
