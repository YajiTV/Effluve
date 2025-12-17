import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { pool } from '@/lib/db';
import { signSession, sessionCookie } from '@/lib/auth';
import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

type ExistingRow = RowDataPacket & { id: number };

export async function POST(req: Request) {
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

  const [existing] = await pool.query<ExistingRow[]>(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [safeEmail]
  );

  if (existing.length) {
    return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 409 });
  }

  const password_hash = await bcrypt.hash(safePassword, 12);

  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
    [safeEmail, password_hash, safeName, 'customer']
  );

  const user = { id: Number(result.insertId), email: safeEmail, full_name: safeName, role: 'customer' as const };
  const token = await signSession(user);

  const res = NextResponse.json({ ok: true, user });
  res.cookies.set(sessionCookie.name, token, sessionCookie.options);
  return res;
}
