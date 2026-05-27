import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getResendClient, getFromAddress } from "@/lib/resend";
import { createAdminLog } from "@/lib/admin-log";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  if (user.role !== "admin" && user.role !== "superadmin") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const rl = rateLimit(`newsletter:${user.id}`, 1, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Un envoi est déjà en cours ou vient d'être effectué. Réessayez dans 10 minutes." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  const body = (await req.json().catch(() => null)) as { subject?: string; html?: string } | null;
  const subject = String(body?.subject ?? "").trim();
  const html = String(body?.html ?? "").trim();

  if (!subject || !html) {
    return NextResponse.json({ error: "Sujet et contenu obligatoires." }, { status: 400 });
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    select: { email: true, unsubscribeToken: true },
  });

  if (subscribers.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const subscribersWithTokens = await Promise.all(
    subscribers.map(async (sub) => {
      if (sub.unsubscribeToken) return sub;
      const token = crypto.randomUUID();
      await prisma.newsletterSubscriber.update({
        where: { email: sub.email },
        data: { unsubscribeToken: token },
      });
      return { ...sub, unsubscribeToken: token };
    })
  );

  const resend = getResendClient();
  const from = `EFFLUVE <${getFromAddress()}>`;
  let sent = 0;
  const failures: string[] = [];

  for (const { email, unsubscribeToken } of subscribersWithTokens) {
    const unsubscribeUrl = `https://effluve.fr/api/newsletter/unsubscribe?token=${unsubscribeToken}`;
    const emailHtml = `
      ${html}
      <div style="margin-top:40px;padding-top:24px;border-top:1px solid #eee;font-size:12px;color:#999;font-family:sans-serif">
        Tu reçois cet email car tu t'es inscrit(e) sur effluve.fr.<br/>
        <a href="${unsubscribeUrl}" style="color:#999">Se désinscrire</a>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from,
      to: email,
      subject,
      html: emailHtml,
    });

    if (error) {
      console.error(`[newsletter] Échec envoi à ${email}:`, error);
      failures.push(`${email}: ${error.message}`);
    } else {
      console.log(`[newsletter] Envoyé à ${email} — id: ${data?.id}`);
      sent++;
    }
  }

  await prisma.newsletterCampaign.create({
    data: { subject, html, sentCount: sent },
  });

  await createAdminLog({
    adminId: user.id,
    action: "newsletter.sent",
    details: JSON.stringify({ subject, sent, failed: failures.length }),
  });

  return NextResponse.json({
    ok: true,
    sent,
    failed: failures.length,
    ...(failures.length > 0 ? { failures } : {}),
  });
}
