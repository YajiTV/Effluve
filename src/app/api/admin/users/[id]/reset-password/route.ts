import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAdminLog } from "@/lib/admin-log";

function generateTempPassword(): string {
  // 16 chars: letters + digits, URL-safe
  return randomBytes(12).toString("base64url").slice(0, 16);
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getSessionUser();
  if (!me || me.role !== "superadmin") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id: rawId } = await params;
  const targetId = parseInt(rawId, 10);
  if (!Number.isFinite(targetId) || targetId <= 0) {
    return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
  }

  if (targetId === me.id) {
    return NextResponse.json({ error: "CANNOT_RESET_OWN_PASSWORD" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, email: true, fullName: true, role: true },
  });

  if (!target) {
    return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  await prisma.user.update({
    where: { id: targetId },
    data: { passwordHash, mustResetPassword: true, tokenVersion: { increment: 1 } },
  });

  await createAdminLog({
    adminId: me.id,
    action: "user.password_reset",
    target: `user:${targetId}`,
    details: JSON.stringify({ email: target.email }),
  });

  return NextResponse.json({ ok: true, tempPassword });
}
