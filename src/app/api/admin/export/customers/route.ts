import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user || (user.role !== "admin" && user.role !== "superadmin"))
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const customers = await prisma.user.findMany({
    where: { role: "customer" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      loyaltyPoints: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  const header = "ID,Nom,Email,Points fidélité,Commandes,Inscrit le\n";
  const rows = customers.map((c) => {
    const date = c.createdAt.toLocaleDateString("fr-FR");
    return [
      c.id,
      `"${c.fullName}"`,
      c.email,
      c.loyaltyPoints,
      c._count.orders,
      date,
    ].join(",");
  });

  const csv = header + rows.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="clients_${Date.now()}.csv"`,
    },
  });
}
