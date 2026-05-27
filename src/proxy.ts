import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "effluve_session";
const RESET_COOKIE = "effluve_reset";

function getSecret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET);
}

async function verifySession(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const id = Number(payload.sub);
    return Number.isFinite(id) && id > 0;
  } catch {
    return false;
  }
}

async function verifyReset(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.purpose !== "password_reset") return false;
    const id = Number(payload.sub);
    return Number.isFinite(id) && id > 0;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const sessionToken = req.cookies.get(SESSION_COOKIE)?.value;
  const resetToken = req.cookies.get(RESET_COOKIE)?.value;

  const sessionValid = sessionToken ? await verifySession(sessionToken) : false;
  const resetValid = resetToken ? await verifyReset(resetToken) : false;

  if (pathname === "/reinitialisation") {
    if (sessionValid) {
      return NextResponse.redirect(new URL("/compte", req.url));
    }
    if (!resetValid) {
      return NextResponse.redirect(new URL("/connexion?error=reset_expired", req.url));
    }
    return NextResponse.next();
  }

  const isProtected =
    pathname.startsWith("/compte") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/cart") ||
    pathname.startsWith("/api/checkout") ||
    pathname.startsWith("/api/wishlist") ||
    pathname === "/api/me" ||
    pathname.startsWith("/api/payment");

  if (isProtected && resetValid) {
    return NextResponse.redirect(new URL("/reinitialisation", req.url));
  }

  if (pathname.startsWith("/admin") && !sessionValid) {
    return NextResponse.redirect(new URL(`/connexion?next=${encodeURIComponent(pathname)}`, req.url));
  }

  if (pathname.startsWith("/compte") && !sessionValid) {
    return NextResponse.redirect(new URL(`/connexion?next=${encodeURIComponent(pathname)}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml).*)",
  ],
};
