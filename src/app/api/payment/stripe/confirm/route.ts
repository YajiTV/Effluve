import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";
import { markOrderAsPaid } from "@/lib/orders";
import { awardLoyaltyPoints } from "@/lib/loyalty";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    if (!isStripeConfigured) return NextResponse.json({ error: "STRIPE_NOT_CONFIGURED" }, { status: 503 });

    const stripe = getStripeClient();
    const body = (await req.json().catch(() => null)) as { orderId?: number; sessionId?: string } | null;
    const orderId = Number(body?.orderId);
    const sessionId = String(body?.sessionId ?? "").trim();

    if (!orderId || !sessionId) {
      return NextResponse.json({ error: "INVALID_DATA" }, { status: 400 });
    }

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

    // Récupère la facture Stripe si elle a été générée
    let stripeInvoiceId: string | undefined;
    let stripeInvoiceUrl: string | undefined;

    if (session.invoice) {
      try {
        const invoice = await stripe.invoices.retrieve(String(session.invoice));
        stripeInvoiceId = invoice.id;
        stripeInvoiceUrl = invoice.hosted_invoice_url ?? invoice.invoice_pdf ?? undefined;
      } catch (e) {
        console.warn("[stripe/confirm] Could not retrieve invoice:", e);
      }
    }

    const updated = await markOrderAsPaid(user.id, orderId, { stripeInvoiceId, stripeInvoiceUrl });
    if (!updated) return NextResponse.json({ error: "PAYMENT_UPDATE_FAILED" }, { status: 400 });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        totalCents: true,
        discountCents: true,
        orderNumber: true,
        createdAt: true,
        items: {
          select: {
            productName: true,
            quantity: true,
            unitPriceCents: true,
            lineTotalCents: true,
          },
        },
        shippingAddress: {
          select: {
            name: true,
            street: true,
            city: true,
            zipcode: true,
            country: true,
          },
        },
      },
    });

    if (order) {
      await awardLoyaltyPoints(user.id, order.totalCents);

      const orderDate = order.createdAt.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      await sendOrderConfirmationEmail({
        to: user.email,
        customerName: user.full_name,
        orderNumber: order.orderNumber,
        orderDate,
        items: order.items,
        totalCents: order.totalCents,
        discountCents: order.discountCents,
        shippingAddress: {
          name: order.shippingAddress.name,
          street: order.shippingAddress.street,
          city: order.shippingAddress.city,
          zipcode: order.shippingAddress.zipcode,
          country: order.shippingAddress.country ?? "France",
        },
      });
    }

    return NextResponse.json({ ok: true, paymentStatus: "paid", stripeInvoiceUrl: stripeInvoiceUrl ?? null });
  } catch (err) {
    console.error("[POST /api/payment/stripe/confirm]", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
