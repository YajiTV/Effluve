import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { markOrderAsPaid } from "@/lib/orders";
import { awardLoyaltyPoints } from "@/lib/loyalty";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";

// Simule un paiement réussi pour l'environnement de développement.
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { orderId?: number } | null;
  const orderId = Number(body?.orderId);

  if (!orderId) return NextResponse.json({ error: "INVALID_ORDER" }, { status: 400 });

  const updated = await markOrderAsPaid(user.id, orderId);
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
      customerName: user.full_name ?? user.email,
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

  return NextResponse.json({ ok: true, paymentStatus: "paid" });
}
