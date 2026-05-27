import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  if (user.role !== "admin" && user.role !== "superadmin") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const campaigns = await prisma.newsletterCampaign.findMany({
    select: { id: true, subject: true, sentCount: true, sentAt: true },
    orderBy: { sentAt: "desc" },
  });

  return NextResponse.json({ campaigns });
}
