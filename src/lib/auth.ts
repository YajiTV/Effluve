import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { ReactNode } from 'react';

export type SessionUser = {
  id: number;
  email: string;
  full_name: string;
  role: 'customer' | 'admin';
  admin: boolean;
};

const COOKIE_NAME = 'angora_session';

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error('AUTH_SECRET manquant dans .env.local');
  return new TextEncoder().encode(s);
}

export async function signSession(user: SessionUser) {
  return new SignJWT({
    email: user.email,
    full_name: user.full_name,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret());
}

export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    const id = Number(payload.sub);
    if (!id) return null;

    return {
    id,
    email: String(payload.email ?? ''),
    full_name: String(payload.full_name ?? ''),
    role: (payload.role as SessionUser['role']) ?? 'customer',
    admin: ((payload.role as string) === 'admin'),
  };

  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export const sessionCookie = {
  name: COOKIE_NAME,
  options: {
    httpOnly: true as const,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  },
};
