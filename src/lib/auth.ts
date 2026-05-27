// src/lib/auth.ts
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export type SessionUser = {
  id: number;
  email: string;
  full_name: string;
  role: "customer" | "admin" | "superadmin";
};

export function isAdmin(role: SessionUser["role"]) {
  return role === "admin" || role === "superadmin";
}

const COOKIE_NAME = "effluve_session";

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET manquant dans .env");
  return new TextEncoder().encode(s);
}

export async function signSession(user: SessionUser, tokenVersion: number) {
  return new SignJWT({
    // Ces champs sont pratiques, mais on ne leur fait pas confiance côté serveur.
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    tokenVersion,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

type SessionPayload = { id: number; tokenVersion: number } | null;

async function verifySessionPayload(token: string): Promise<SessionPayload> {
  try {
    const { payload } = await jwtVerify(token, secret());
    const id = Number(payload.sub);
    if (!Number.isFinite(id) || id <= 0) return null;
    const tokenVersion = Number(payload.tokenVersion);
    if (!Number.isFinite(tokenVersion) || tokenVersion <= 0) return null;
    return { id, tokenVersion };
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  const parsed = await verifySessionPayload(token);
  if (!parsed) return null;

  const row = await prisma.user.findUnique({
    where: { id: parsed.id },
    select: { id: true, email: true, fullName: true, role: true, tokenVersion: true, mustResetPassword: true },
  });
  if (!row) return null;

  // Invalidate if tokenVersion has been rotated (e.g. password reset by admin)
  if (row.tokenVersion !== parsed.tokenVersion) return null;

  // Invalidate sessions for users who must reset their password
  if (row.mustResetPassword) return null;

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

const RESET_COOKIE_NAME = "effluve_reset";

export async function signResetToken(userId: number) {
  return new SignJWT({ purpose: "password_reset" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret());
}

export async function verifyResetToken(token: string): Promise<number | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.purpose !== "password_reset") return null;
    const id = Number(payload.sub);
    if (!Number.isFinite(id) || id <= 0) return null;
    return id;
  } catch {
    return null;
  }
}

export const resetCookie = {
  name: RESET_COOKIE_NAME,
  options: {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 15,
  },
};
