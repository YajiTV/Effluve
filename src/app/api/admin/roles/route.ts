import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAdminLog } from "@/lib/admin-log";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "superadmin")
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const users = await prisma.user.findMany({
    select: { id: true, email: true, fullName: true, role: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "superadmin")
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const body = await req.json();
  const { email, role } = body as { email: string; role: string };

  if (!email || !["customer", "admin", "superadmin"].includes(role))
    return NextResponse.json({ error: "INVALID_PAYLOAD" }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { email } });
  if (!target)
    return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });

  if (target.id === user.id)
    return NextResponse.json({ error: "CANNOT_CHANGE_OWN_ROLE" }, { status: 400 });

  const updated = await prisma.user.update({
    where: { email },
    data: { role: role as "customer" | "admin" | "superadmin" },
    select: { id: true, email: true, fullName: true, role: true },
  });

  await createAdminLog({
    adminId: user.id,
    action: "role.changed",
    target: `user:${updated.id}`,
    details: JSON.stringify({ email: updated.email, role: updated.role }),
  });

  return NextResponse.json(updated);
}
