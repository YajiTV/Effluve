import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signSession, sessionCookie } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`register:${ip}`, 3, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Trop de créations de compte. Réessayez dans 1 heure.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    );
  }

  const body: unknown = await req.json().catch(() => null);
  const { email, password, full_name } = (body ?? {}) as {
    email?: string;
    password?: string;
    full_name?: string;
  };

  const safeEmail = String(email ?? '').trim().toLowerCase();
  const safePassword = String(password ?? '');
  const safeName = String(full_name ?? '').trim();

  if (!safeEmail || !safePassword || !safeName) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  }
  if (safePassword.length < 8) {
    return NextResponse.json({ error: 'Mot de passe trop court (min 8)' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { email: safeEmail },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(safePassword, 12);

  const created = await prisma.user.create({
    data: {
      email: safeEmail,
      passwordHash,
      fullName: safeName,
      role: 'customer',
    },
    select: { id: true, email: true, fullName: true, role: true, tokenVersion: true },
  });

  const user = {
    id: created.id,
    email: created.email,
    full_name: created.fullName,
    role: created.role,
  };
  const token = await signSession(user, created.tokenVersion);

  const res = NextResponse.json({ ok: true, user });
  res.cookies.set(sessionCookie.name, token, sessionCookie.options);
  return res;
}
