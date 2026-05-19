import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getAdminLogs } from "@/lib/admin-log";
import BackButton from "@/components/admin/BackButton";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  "return.status_changed": "Retour mis à jour",
  "order.status_changed": "Commande mise à jour",
  "product.created": "Produit créé",
  "product.edited": "Produit modifié",
  "product.deleted": "Produit supprimé",
  "promo.created": "Code promo créé",
  "promo.toggled": "Code promo activé/désactivé",
  "promo.deleted": "Code promo supprimé",
  "newsletter.sent": "Newsletter envoyée",
  "role.changed": "Rôle modifié",
};

export default async function LogsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/connexion?next=/admin/logs");
  if (user.role !== "admin" && user.role !== "superadmin") redirect("/compte");

  const logs = await getAdminLogs(200);

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <BackButton />
          <h1 className="mt-4 font-title text-4xl text-black">Logs d'activité</h1>
          <p className="mt-1 text-sm text-neutral-500">Actions effectuées par les administrateurs</p>
        </div>

        <div className="bg-white border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                {["Date", "Admin", "Action", "Cible", "Détails"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-widest text-neutral-400 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                    Aucune activité enregistrée.
                  </td>
                </tr>
              )}
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                  <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">
                    {log.createdAt.toLocaleString("fr-FR")}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-black">{log.admin.fullName}</p>
                    <p className="text-xs text-neutral-500">{log.admin.email}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    {ACTION_LABELS[log.action] ?? log.action}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{log.target ?? "-"}</td>
                  <td className="px-4 py-3 text-neutral-400 text-xs font-mono truncate max-w-[200px]">
                    {log.details ?? "-"}
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
