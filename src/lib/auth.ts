// src/lib/auth.ts
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export type SessionUser = {
  id: number;
  email: string;
  full_name: string;
  role: "customer" | "admin";
};

const COOKIE_NAME = "effluve_session";

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET manquant dans .env");
  return new TextEncoder().encode(s);
}

export async function signSession(user: SessionUser) {
  return new SignJWT({
    // Ces champs sont pratiques, mais on ne leur fait pas confiance côté serveur.
    email: user.email,
    full_name: user.full_name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

async function verifySessionId(token: string): Promise<number | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    const id = Number(payload.sub);
    if (!Number.isFinite(id) || id <= 0) return null;
    return id;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  const id = await verifySessionId(token);
  if (!id) return null;

  const row = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, fullName: true, role: true },
  });
  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    full_name: row.fullName,
    role: row.role,
  };
}

export const sessionCookie = {
  name: COOKIE_NAME,
  options: {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  },
};
