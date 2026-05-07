import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user || (user.role !== "admin" && user.role !== "superadmin"))
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { fullName: true, email: true } } },
  });

  const header = "ID,Numéro,Client,Email,Total (€),Statut,Code promo,Date\n";
  const rows = orders.map((o) => {
    const total = (o.totalCents / 100).toFixed(2);
    const date = o.createdAt.toLocaleDateString("fr-FR");
    return [
      o.id,
      o.orderNumber,
      `"${o.user.fullName}"`,
      o.user.email,
      total,
      o.paymentStatus,
      o.promoCode ?? "",
      date,
    ].join(",");
  });

  const csv = header + rows.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="commandes_${Date.now()}.csv"`,
    },
  });
}
