import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getDashboardKPIs, getWeeklyRevenue, getRecentOrders } from "@/lib/admin";
import { getLowStockProducts } from "@/lib/products";
import { eurFromCents } from "@/lib/money";
import { TrendingUp, ShoppingBag, Users, ShoppingCart, AlertTriangle, Download } from "lucide-react";
import RevenueChart from "@/components/admin/RevenueChart";
import RecentOrdersTable from "@/components/admin/RecentOrdersTable";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/connexion?next=/admin");
  if (user.role !== "admin" && user.role !== "superadmin") redirect("/compte");

  const [kpis, weeklyRevenue, recentOrders, lowStock] = await Promise.all([
    getDashboardKPIs(),
    getWeeklyRevenue(),
    getRecentOrders(10),
    getLowStockProducts(),
  ]);

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-7xl space-y-8">

        <div>
          <h1 className="font-title text-4xl text-black">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500 capitalize">{today}</p>
        </div>

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

        <section>
          <p className="text-xs uppercase tracking-widest text-neutral-400 mb-4">Revenus — 7 derniers jours</p>
          <div className="bg-white border border-neutral-200 p-6">
            <RevenueChart data={weeklyRevenue} />
          </div>
        </section>

        {/* Alertes stock */}
        {lowStock.length > 0 && (
          <section>
            <p className="text-xs uppercase tracking-widest text-neutral-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
              Alertes stock ({lowStock.length})
            </p>
            <div className="bg-white border border-amber-200 divide-y divide-neutral-100">
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-black">{p.name}</p>
                    <p className="text-xs text-neutral-500 capitalize">{p.category}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${p.stock === 0 ? "text-red-600" : "text-amber-600"}`}>
                      {p.stock === 0 ? "Rupture" : `${p.stock} restant${p.stock > 1 ? "s" : ""}`}
                    </p>
                    <p className="text-xs text-neutral-400">Seuil : {p.stockAlert}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <p className="text-xs uppercase tracking-widest text-neutral-400 mb-4">Dernières commandes</p>
          <div className="bg-white border border-neutral-200">
            <RecentOrdersTable orders={recentOrders} />
          </div>
        </section>

        <div className="pt-4 border-t border-neutral-200 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-400 mb-4">Accès rapide</p>
            <div className="flex flex-wrap gap-3">
              <AdminLink href="/admin/products" label="Produits" />
              <AdminLink href="/admin/orders" label="Commandes" />
              <AdminLink href="/admin/returns" label="Retours" />
              <AdminLink href="/admin/newsletter" label="Newsletter" />
              <AdminLink href="/admin/promo" label="Codes promo" />
              <AdminLink href="/admin/stats" label="Statistiques" />
              <AdminLink href="/admin/logs" label="Logs" />
              {user.role === "superadmin" && (
                <AdminLink href="/admin/roles" label="Rôles" />
              )}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-400 mb-4">Exports CSV</p>
            <div className="flex flex-wrap gap-3">
              <ExportLink href="/api/admin/export/orders" label="Exporter commandes" />
              <ExportLink href="/api/admin/export/customers" label="Exporter clients" />
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

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

function ExportLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      download
      className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest border border-neutral-300 text-neutral-600 hover:bg-black hover:text-white hover:border-black transition-colors"
    >
      <Download className="w-3 h-3" strokeWidth={2} />
      {label}
    </a>
  );
}
