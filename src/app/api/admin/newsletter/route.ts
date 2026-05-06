import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getResendClient, getFromAddress } from "@/lib/resend";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as { subject?: string; html?: string } | null;
  const subject = String(body?.subject ?? "").trim();
  const html = String(body?.html ?? "").trim();

  if (!subject || !html) {
    return NextResponse.json({ error: "Sujet et contenu obligatoires." }, { status: 400 });
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    select: { email: true },
  });

  if (subscribers.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const resend = getResendClient();
  const from = `EFFLUVE <${getFromAddress()}>`;
  let sent = 0;
  const failures: string[] = [];

  for (const { email } of subscribers) {
    const { data, error } = await resend.emails.send({
      from,
      to: email,
      subject,
      html,
    });

    if (error) {
      console.error(`[newsletter] Échec envoi à ${email}:`, error);
      failures.push(`${email}: ${error.message}`);
    } else {
      console.log(`[newsletter] Envoyé à ${email} — id: ${data?.id}`);
      sent++;
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    failed: failures.length,
    ...(failures.length > 0 ? { failures } : {}),
  });
}
