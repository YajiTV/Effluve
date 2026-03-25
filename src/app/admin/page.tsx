import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getDashboardKPIs } from "@/lib/admin";
import { eurFromCents } from "@/lib/money";
import { TrendingUp, ShoppingBag, Users, ShoppingCart } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/account");

  const kpis = await getDashboardKPIs();

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* En-tête */}
        <div>
          <h1 className="font-title text-4xl text-black">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500 capitalize">{today}</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Chiffre d'affaires"
            value={`${eurFromCents(kpis.revenueCents)} €`}
            icon={<TrendingUp className="w-5 h-5" strokeWidth={1.5} />}
          />
          <KpiCard
            label="Commandes"
            value={String(kpis.orderCount)}
            icon={<ShoppingBag className="w-5 h-5" strokeWidth={1.5} />}
          />
          <KpiCard
            label="Nouveaux clients"
            value={String(kpis.newCustomers)}
            icon={<Users className="w-5 h-5" strokeWidth={1.5} />}
          />
          <KpiCard
            label="Panier moyen"
            value={`${eurFromCents(kpis.averageBasketCents)} €`}
            icon={<ShoppingCart className="w-5 h-5" strokeWidth={1.5} />}
          />
        </div>

        {/* Liens rapides vers les autres sections admin */}
        <div className="pt-4 border-t border-neutral-200">
          <p className="text-xs uppercase tracking-widest text-neutral-400 mb-4">Accès rapide</p>
          <div className="flex flex-wrap gap-3">
            <AdminLink href="/admin/orders" label="Commandes" />
            <AdminLink href="/admin/returns" label="Retours" />
          </div>
        </div>

      </div>
    </main>
  );
}

// --- Composants locaux ---

function KpiCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-neutral-200 p-6 space-y-4">
      <div className="flex items-center justify-between text-neutral-400">
        <span className="text-xs uppercase tracking-widest">{label}</span>
        {icon}
      </div>
      <p className="font-title text-3xl text-black">{value}</p>
    </div>
  );
}

function AdminLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="px-4 py-2 text-xs uppercase tracking-widest border border-neutral-300 text-neutral-600 hover:bg-black hover:text-white hover:border-black transition-colors"
    >
      {label}
    </a>
  );
}
