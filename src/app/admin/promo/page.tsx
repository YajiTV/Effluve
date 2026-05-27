import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PromoManager from "@/components/admin/PromoManager";
import BackButton from "@/components/admin/BackButton";

export const dynamic = "force-dynamic";

export default async function AdminPromoPage() {
  const user = await getSessionUser();
  if (!user) redirect("/connexion?next=/admin/promo");
  if (user.role !== "admin" && user.role !== "superadmin") redirect("/compte");

  const promos = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serialized = promos.map((p) => ({
    id: p.id,
    code: p.code,
    discountType: p.discountType,
    discountValue: p.discountValue,
    minOrderCents: p.minOrderCents,
    maxUses: p.maxUses,
    usedCount: p.usedCount,
    isActive: p.isActive,
    expiresAt: p.expiresAt ? p.expiresAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <BackButton />
          <h1 className="mt-4 font-title text-4xl text-black">Codes promo</h1>
        </div>
        <PromoManager initialPromos={serialized} />
      </div>
    </main>
  );
}
