import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? "contact@effluve.fr";

// Derive a clean site URL from NEXT_PUBLIC_API_URL (strip /api suffix) or fallback
function getSiteUrl(): string {
  const api = process.env.NEXT_PUBLIC_API_URL ?? "";
  if (api) {
    return api.replace(/\/api\/?$/, "");
  }
  return "https://effluve.fr";
}

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}

export interface OrderConfirmationParams {
  to: string;
  customerName: string;
  orderNumber: string;
  orderDate: string; // e.g. "7 mai 2026"
  items: {
    productName: string;
    quantity: number;
    unitPriceCents: number;
    lineTotalCents: number;
  }[];
  totalCents: number;
  discountCents: number;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    zipcode: string;
    country: string;
  };
}

function buildOrderConfirmationHtml(p: OrderConfirmationParams): string {
  const siteUrl = getSiteUrl();
  const subtotalCents = p.totalCents + p.discountCents;

  const itemRows = p.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 8px;border-bottom:1px solid #ede8df;font-size:14px;color:#1a1a1a;">${item.productName}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #ede8df;font-size:14px;color:#1a1a1a;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #ede8df;font-size:14px;color:#1a1a1a;text-align:right;">${formatCents(item.unitPriceCents)}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #ede8df;font-size:14px;color:#1a1a1a;text-align:right;">${formatCents(item.lineTotalCents)}</td>
      </tr>`
    )
    .join("");

  const discountRow =
    p.discountCents > 0
      ? `<tr>
          <td colspan="3" style="padding:8px;font-size:13px;color:#6b7280;text-align:right;">Réduction</td>
          <td style="padding:8px;font-size:13px;color:#16a34a;text-align:right;">- ${formatCents(p.discountCents)}</td>
        </tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirmation de commande — Effluve</title>
</head>
<body style="margin:0;padding:0;background:#f9f7f4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f7f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:4px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#1a1a1a;padding:32px 40px;text-align:center;">
              <a href="${siteUrl}" style="text-decoration:none;">
                <span style="font-size:28px;font-weight:300;letter-spacing:6px;color:#F5F0E8;text-transform:uppercase;">EFFLUVE</span>
              </a>
            </td>
          </tr>

          <!-- Confirmation banner -->
          <tr>
            <td style="background:#F5F0E8;padding:24px 40px;text-align:center;border-bottom:1px solid #ede8df;">
              <p style="margin:0 0 4px;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#8b7d6b;">Commande confirmée</p>
              <p style="margin:0;font-size:22px;font-weight:400;color:#1a1a1a;">Merci pour votre achat, ${p.customerName.split(" ")[0]}.</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">

              <p style="margin:0 0 24px;font-size:14px;color:#4b4b4b;line-height:1.6;">
                Votre commande est confirmée et en cours de préparation. Vous recevrez un email dès qu'elle sera expédiée.
              </p>

              <!-- Order meta -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;background:#f9f7f4;border-radius:4px;padding:16px;">
                <tr>
                  <td style="padding:6px 12px;">
                    <span style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#8b7d6b;">Numéro de commande</span><br/>
                    <span style="font-size:14px;color:#1a1a1a;font-weight:500;">${p.orderNumber}</span>
                  </td>
                  <td style="padding:6px 12px;text-align:right;">
                    <span style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#8b7d6b;">Date</span><br/>
                    <span style="font-size:14px;color:#1a1a1a;">${p.orderDate}</span>
                  </td>
                </tr>
              </table>

              <!-- Items table -->
              <p style="margin:0 0 12px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8b7d6b;">Articles commandés</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;">
                <thead>
                  <tr style="background:#F5F0E8;">
                    <th style="padding:10px 8px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#8b7d6b;text-align:left;font-weight:500;">Article</th>
                    <th style="padding:10px 8px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#8b7d6b;text-align:center;font-weight:500;">Qté</th>
                    <th style="padding:10px 8px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#8b7d6b;text-align:right;font-weight:500;">Prix unit.</th>
                    <th style="padding:10px 8px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#8b7d6b;text-align:right;font-weight:500;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                </tbody>
                <tfoot>
                  ${
                    p.discountCents > 0
                      ? `<tr>
                          <td colspan="3" style="padding:8px;font-size:13px;color:#6b7280;text-align:right;">Sous-total</td>
                          <td style="padding:8px;font-size:13px;color:#1a1a1a;text-align:right;">${formatCents(subtotalCents)}</td>
                        </tr>
                        ${discountRow}`
                      : ""
                  }
                  <tr style="background:#F5F0E8;">
                    <td colspan="3" style="padding:12px 8px;font-size:14px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#1a1a1a;text-align:right;">Total</td>
                    <td style="padding:12px 8px;font-size:16px;font-weight:600;color:#1a1a1a;text-align:right;">${formatCents(p.totalCents)}</td>
                  </tr>
                </tfoot>
              </table>

              <!-- Shipping address -->
              <p style="margin:0 0 12px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8b7d6b;">Adresse de livraison</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;background:#f9f7f4;border-radius:4px;padding:16px 20px;">
                <tr>
                  <td style="font-size:14px;color:#1a1a1a;line-height:1.7;">
                    ${p.shippingAddress.name}<br/>
                    ${p.shippingAddress.street}<br/>
                    ${p.shippingAddress.zipcode} ${p.shippingAddress.city}<br/>
                    ${p.shippingAddress.country}
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${siteUrl}/account/orders" style="display:inline-block;background:#1a1a1a;color:#F5F0E8;text-decoration:none;font-size:12px;letter-spacing:3px;text-transform:uppercase;padding:14px 32px;border-radius:2px;">
                      Suivre ma commande
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1a1a1a;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8b7d6b;">Effluve — Mode intemporelle</p>
              <p style="margin:0;font-size:11px;color:#6b6b6b;">
                <a href="${siteUrl}" style="color:#F5F0E8;text-decoration:none;">${siteUrl.replace(/^https?:\/\//, "")}</a>
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

export async function sendOrderConfirmationEmail(
  params: OrderConfirmationParams
): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: `Confirmation de commande ${params.orderNumber} — Effluve`,
      html: buildOrderConfirmationHtml(params),
    });
  } catch (err) {
    console.error("[email] sendOrderConfirmationEmail failed:", err);
    // Never throw — email failure must not break the payment response
  }
}
