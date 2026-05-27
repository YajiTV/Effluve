import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getResendClient, getFromAddress } from "@/lib/resend";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  if (user.role !== "admin" && user.role !== "superadmin") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as { subject?: string; html?: string } | null;
  const subject = String(body?.subject ?? "").trim();
  const html = String(body?.html ?? "").trim();

  if (!subject || !html) {
    return NextResponse.json({ error: "Sujet et contenu obligatoires." }, { status: 400 });
  }

  const resend = getResendClient();
  const { error } = await resend.emails.send({
    from: `EFFLUVE <${getFromAddress()}>`,
    to: user.email,
    subject: `[TEST] ${subject}`,
    html,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
