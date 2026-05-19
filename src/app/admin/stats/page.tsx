import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getProductStats } from "@/lib/admin";
import { eurFromCents } from "@/lib/money";
import BackButton from "@/components/admin/BackButton";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/connexion?next=/admin/stats");
  if (user.role !== "admin" && user.role !== "superadmin") redirect("/compte");

  const stats = await getProductStats();

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <BackButton />
          <h1 className="mt-4 font-title text-4xl text-black">Statistiques produits</h1>
          <p className="mt-1 text-sm text-neutral-500">Ventes et taux de retour par article</p>
        </div>

        <div className="bg-white border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                {["Produit", "Unités vendues", "Chiffre d'affaires", "Retours", "Taux de retour"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-widest text-neutral-400 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                    Aucune donnée pour le moment.
                  </td>
                </tr>
              )}
              {stats.map((s) => (
                <tr key={s.productId} className="border-b border-neutral-50 hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-black">{s.productName}</td>
                  <td className="px-4 py-3 text-neutral-600">{s.unitsSold}</td>
                  <td className="px-4 py-3 text-neutral-600">{eurFromCents(s.revenueCents)} €</td>
                  <td className="px-4 py-3 text-neutral-600">{s.returnCount}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-sm font-medium ${
                      s.returnRate >= 20
                        ? "bg-red-100 text-red-700"
                        : s.returnRate >= 10
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {s.returnRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
