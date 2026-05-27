import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { verifyResetToken, signSession, sessionCookie, resetCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`reset-pw:${ip}`, 5, 15 * 60 * 1000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans 15 minutes." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      );
    }

    const jar = await cookies();
    const resetToken = jar.get(resetCookie.name)?.value;
    if (!resetToken) {
      return NextResponse.json({ error: "SESSION_EXPIRED" }, { status: 401 });
    }

    const userId = await verifyResetToken(resetToken);
    if (!userId) {
      return NextResponse.json({ error: "SESSION_EXPIRED" }, { status: 401 });
    }

    const body: unknown = await req.json().catch(() => null);
    const { password, confirmPassword } = (body ?? {}) as {
      password?: string;
      confirmPassword?: string;
    };

    const safePassword = String(password ?? "").trim();
    const safeConfirm = String(confirmPassword ?? "").trim();

    if (!safePassword || !safeConfirm) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }
    if (safePassword !== safeConfirm) {
      return NextResponse.json(
        { error: "Les mots de passe ne correspondent pas." },
        { status: 400 }
      );
    }
    if (safePassword.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères." },
        { status: 400 }
      );
    }
    if (!/[A-Z]/.test(safePassword)) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins une majuscule." },
        { status: 400 }
      );
    }
    if (!/[0-9]/.test(safePassword)) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins un chiffre." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, fullName: true, role: true, mustResetPassword: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    // Guard: if flag was already cleared (e.g. concurrent request), bail out
    if (!user.mustResetPassword) {
      return NextResponse.json({ error: "Ce lien a déjà été utilisé." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(safePassword, 12);
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { passwordHash, mustResetPassword: false, tokenVersion: { increment: 1 } },
      select: { id: true, email: true, fullName: true, role: true, tokenVersion: true },
    });

    const sessionUser = {
      id: updated.id,
      email: updated.email,
      full_name: updated.fullName,
      role: updated.role,
    };
    const sessionToken = await signSession(sessionUser, updated.tokenVersion);

    const res = NextResponse.json({ ok: true });
    // Clear reset cookie
    res.cookies.set(resetCookie.name, "", { ...resetCookie.options, maxAge: 0 });
    // Set full session
    res.cookies.set(sessionCookie.name, sessionToken, sessionCookie.options);
    return res;
  } catch (err) {
    console.error("[POST /api/auth/set-new-password]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
