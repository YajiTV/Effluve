import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  if (user.role !== "admin" && user.role !== "superadmin") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const subscribers = await prisma.newsletterSubscriber.findMany({
    select: { email: true, subscribedAt: true },
    orderBy: { subscribedAt: "desc" },
  });

  const rows = subscribers.map(
    (s) => `${s.email},${s.subscribedAt.toISOString()}`
  );
  const csv = ["email,subscribed_at", ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
