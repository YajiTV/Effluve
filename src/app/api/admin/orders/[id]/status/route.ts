import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { updateOrderStatus, ORDER_STATUSES } from "@/lib/admin-orders";
import { getResendClient, getFromAddress } from "@/lib/resend";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";
import { createAdminLog } from "@/lib/admin-log";

type EmailContent = { subject: string; body: string };

function buildEmailHtml(params: {
  orderNumber: string;
  orderId: number;
  customerName: string;
  body: string;
  trackingNumber?: string | null;
  carrierName?: string | null;
}): string {
  const { orderNumber, orderId, customerName, body, trackingNumber, carrierName } = params;
  const trackingBlock =
    trackingNumber
      ? `<div style="margin:20px 0;padding:14px 16px;background:#f5f5f5;border-radius:8px;">
          <p style="margin:0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:#737373;">Numéro de suivi</p>
          <p style="margin:6px 0 0;font-size:14px;color:#171717;">
            ${carrierName ? `<span style="color:#737373;">${carrierName} — </span>` : ""}
            <span style="font-family:monospace;font-weight:600;">${trackingNumber}</span>
          </p>
        </div>`
      : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">
          <tr>
            <td style="padding:32px 36px 24px;border-bottom:1px solid #f5f5f5;">
              <p style="margin:0;font-size:22px;font-weight:700;letter-spacing:0.12em;color:#171717;text-transform:uppercase;">EFFLUVE</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 36px;">
              <p style="margin:0 0 12px;font-size:15px;color:#404040;">Bonjour ${customerName},</p>
              <p style="margin:0 0 20px;font-size:15px;color:#404040;line-height:1.6;">${body}</p>
              ${trackingBlock}
              <p style="margin:24px 0 0;font-size:14px;color:#737373;">
                Retrouve les détails de ta commande dans ton espace client :
              </p>
              <p style="margin:10px 0 0;">
                <a href="https://effluve.fr/account/orders/${orderId}" style="display:inline-block;padding:10px 20px;background:#171717;color:#ffffff;font-size:13px;font-weight:600;text-decoration:none;border-radius:8px;">
                  Voir la commande
                </a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 36px;border-top:1px solid #f5f5f5;background:#fafafa;">
              <p style="margin:0;font-size:12px;color:#a3a3a3;">
                Cet email a été envoyé automatiquement par EFFLUVE suite à la mise à jour de ta commande ${orderNumber}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function getEmailContent(
  status: PaymentStatus,
  orderNumber: string,
  trackingNumber?: string | null
): EmailContent | null {
  switch (status) {
    case "paid":
      return {
        subject: "Commande confirmée — EFFLUVE",
        body: `Merci pour ta commande ! Ton paiement pour la commande <strong>${orderNumber}</strong> a bien été confirmé. Nous préparons ta commande dans les plus brefs délais.`,
      };
    case "preparing":
      return {
        subject: "Votre commande est en préparation — EFFLUVE",
        body: `Bonne nouvelle ! Ta commande <strong>${orderNumber}</strong> est actuellement en cours de préparation dans notre atelier. Tu recevras un email dès qu'elle sera expédiée.`,
      };
    case "shipped":
      return {
        subject: "Votre commande a été expédiée — EFFLUVE",
        body: `Ta commande <strong>${orderNumber}</strong> vient d'être expédiée !${trackingNumber ? " Tu peux suivre ton colis grâce au numéro de suivi ci-dessous." : " Tu recevras ta livraison dans les prochains jours."}`,
      };
    case "delivered":
      return {
        subject: "Votre commande a été livrée — EFFLUVE",
        body: `Ta commande <strong>${orderNumber}</strong> a été livrée. Nous espérons que tu seras satisfait(e) de ton achat. N'hésite pas à nous contacter si tu as la moindre question.`,
      };
    case "cancelled":
      return {
        subject: "Commande annulée — EFFLUVE",
        body: `Nous t'informons que ta commande <strong>${orderNumber}</strong> a été annulée. Si tu penses qu'il s'agit d'une erreur ou si tu as des questions, contacte notre service client.`,
      };
    default:
      return null;
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin" && user.role !== "superadmin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { id } = await params;
  const orderId = parseInt(id, 10);
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  const body = await req.json();
  const status = body.status as PaymentStatus;

  if (!ORDER_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      orderNumber: true,
      trackingNumber: true,
      carrierName: true,
      user: { select: { email: true, fullName: true } },
    },
  });

  await updateOrderStatus(orderId, status);

  await createAdminLog({
    adminId: user.id,
    action: "order.status_changed",
    target: `order:${orderId}`,
    details: JSON.stringify({ status, orderNumber: order?.orderNumber }),
  });

  if (order && status !== "pending_payment") {
    const emailContent = getEmailContent(status, order.orderNumber, order.trackingNumber);

    if (emailContent) {
      const resend = getResendClient();
      const html = buildEmailHtml({
        orderNumber: order.orderNumber,
        orderId,
        customerName: order.user.fullName,
        body: emailContent.body,
        trackingNumber: status === "shipped" ? order.trackingNumber : null,
        carrierName: status === "shipped" ? order.carrierName : null,
      });

      const { error } = await resend.emails.send({
        from: getFromAddress(),
        to: order.user.email,
        subject: emailContent.subject,
        html,
      });

      if (error) {
        console.error(`[email] Échec envoi statut ${status} pour commande ${order.orderNumber}:`, error);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
