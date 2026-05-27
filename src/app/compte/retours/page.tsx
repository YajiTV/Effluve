import { redirect } from "next/navigation";
import ReturnRequestForm from "@/components/account/ReturnRequestForm";
import { getSessionUser } from "@/lib/auth";
import { eurFromCents } from "@/lib/money";
import { getPaidOrdersWithItemsByUserId } from "@/lib/orders";
import { getReturnsByUserId } from "@/lib/returns";

export const dynamic = "force-dynamic";

function labelForStatus(status: string) {
  if (status === "approved") return "Accepté";
  if (status === "rejected") return "Refusé";
  if (status === "received") return "Reçu";
  if (status === "refunded") return "Remboursé";
  if (status === "cancelled") return "Annulé";
  return "Demandé";
}

function labelForReason(reason: string) {
  if (reason === "too_small") return "Taille trop petite";
  if (reason === "too_large") return "Taille trop grande";
  if (reason === "damaged") return "Endommagé";
  if (reason === "not_as_described") return "Non conforme";
  if (reason === "wrong_item") return "Mauvais article";
  if (reason === "changed_mind") return "Changement d'avis";
  return "Autre";
}

export default async function ReturnsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/connexion?next=/compte/retours");

  const [returns, paidOrders] = await Promise.all([
    getReturnsByUserId(user.id),
    getPaidOrdersWithItemsByUserId(user.id),
  ]);

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="font-title text-4xl text-black">Mes retours</h1>
          <p className="mt-2 text-neutral-600">Crée et suis tes demandes de retour.</p>
        </div>

        <ReturnRequestForm paidOrders={paidOrders} />

        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-left">
            <thead className="bg-neutral-50 text-xs uppercase tracking-[0.16em] text-neutral-500">
              <tr>
                <th className="px-4 py-3">Commande</th>
                <th className="px-4 py-3">Article</th>
                <th className="px-4 py-3">Motif</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Remboursement</th>
              </tr>
            </thead>
            <tbody>
              {returns.length === 0 ? (
                <tr className="border-t border-neutral-200 text-sm text-neutral-700">
                  <td className="px-4 py-4" colSpan={5}>
                    Aucun retour pour le moment.
                  </td>
                </tr>
              ) : (
                returns.map((item) => (
                  <tr key={item.id} className="border-t border-neutral-200 text-sm text-neutral-800">
                    <td className="px-4 py-3">{item.orderNumber}</td>
                    <td className="px-4 py-3">{item.productName ?? "Commande complète"}</td>
                    <td className="px-4 py-3">{labelForReason(item.reason)}</td>
                    <td className="px-4 py-3">{labelForStatus(item.status)}</td>
                    <td className="px-4 py-3">
                      {item.refundCents != null ? `${eurFromCents(item.refundCents)} €` : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
