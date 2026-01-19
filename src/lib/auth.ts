// src/lib/auth.ts
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";

export type SessionUser = {
  id: number;
  email: string;
  full_name: string;
  role: "customer" | "admin";
};

const COOKIE_NAME = "angora_session";

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET manquant dans .env.local");
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

  // On valide l’existence en DB pour éviter les FK errors (session stale).
  const [rows] = await pool.query<(RowDataPacket & SessionUser)[]>(
    "SELECT id, email, full_name, role FROM users WHERE id = ? LIMIT 1",
    [id]
  );

  if (!rows.length) return null;
  return {
    id: Number(rows[0].id),
    email: String(rows[0].email),
    full_name: String(rows[0].full_name),
    role: (rows[0].role as SessionUser["role"]) ?? "customer",
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
