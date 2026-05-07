import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signSession, sessionCookie, signResetToken, resetCookie } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    if (!rateLimit(`login:${ip}`, 10, 15 * 60 * 1000)) {
      return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans 15 minutes.' }, { status: 429 });
    }

    const body: unknown = await req.json().catch(() => null);
    const { email, password } = (body ?? {}) as { email?: string; password?: string };

    const safeEmail = String(email ?? '').trim().toLowerCase();
    const safePassword = String(password ?? '');

    if (!safeEmail || !safePassword) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    }

    const u = await prisma.user.findUnique({
      where: { email: safeEmail },
      select: { id: true, email: true, passwordHash: true, fullName: true, role: true, mustResetPassword: true, tokenVersion: true },
    });

    if (!u) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
    }

    const ok = await bcrypt.compare(safePassword, u.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
    }

    if (u.mustResetPassword) {
      const resetToken = await signResetToken(u.id);
      const res = NextResponse.json({ mustResetPassword: true });
      res.cookies.set(resetCookie.name, resetToken, resetCookie.options);
      return res;
    }

    const user = { id: u.id, email: u.email, full_name: u.fullName, role: u.role };
    const token = await signSession(user, u.tokenVersion);

    const res = NextResponse.json({ ok: true, user });
    res.cookies.set(sessionCookie.name, token, sessionCookie.options);
    return res;
  } catch (err) {
    console.error('[POST /api/auth/login]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
