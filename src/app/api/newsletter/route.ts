import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getResendClient, getFromAddress } from "@/lib/resend";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  const resend = getResendClient();
  const { error } = await resend.emails.send({
    from: `EFFLUVE <${getFromAddress()}>`,
    to: email,
    subject: "Bienvenue dans le cercle EFFLUVE",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#111">
        <h1 style="font-size:28px;font-weight:700;letter-spacing:-0.5px;margin-bottom:8px">EFFLUVE</h1>
        <p style="font-size:18px;font-weight:600;margin-bottom:16px">Tu fais maintenant partie du cercle.</p>
        <p style="color:#555;line-height:1.6">
          Merci de nous rejoindre. Tu seras parmi les premiers à découvrir nos nouvelles collections,
          nos offres exclusives et nos avant-premières.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:32px 0"/>
        <p style="font-size:12px;color:#999">
          Tu reçois cet email car tu t'es inscrit(e) sur effluve.fr.<br/>
          Pour te désinscrire, réponds à cet email.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("[newsletter/subscribe] Resend error:", error);
  }

  return NextResponse.json({ ok: true });
}
