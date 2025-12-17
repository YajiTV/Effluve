import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { pool } from '@/lib/db';
import { signSession, sessionCookie } from '@/lib/auth';
import type { RowDataPacket } from 'mysql2/promise';

type UserRow = RowDataPacket & {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'customer' | 'admin';
};

export async function POST(req: Request) {
  const body: unknown = await req.json().catch(() => null);
  const { email, password } = (body ?? {}) as { email?: string; password?: string };

  const safeEmail = String(email ?? '').trim().toLowerCase();
  const safePassword = String(password ?? '');

  if (!safeEmail || !safePassword) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  }

  const [rows] = await pool.query<UserRow[]>(
    'SELECT id, email, password_hash, full_name, role FROM users WHERE email = ? LIMIT 1',
    [safeEmail]
  );

  if (!rows.length) {
    return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
  }

  const u = rows[0];
  const ok = await bcrypt.compare(safePassword, u.password_hash);
  if (!ok) {
    return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
  }

  const user = { id: u.id, email: u.email, full_name: u.full_name, role: u.role };
  const token = await signSession(user);

  const res = NextResponse.json({ ok: true, user });
  res.cookies.set(sessionCookie.name, token, sessionCookie.options);
  return res;
}
