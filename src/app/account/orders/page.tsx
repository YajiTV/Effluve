import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { eurFromCents } from "@/lib/money";
import { getOrdersByUserId } from "@/lib/orders";
import { getLatestReturnStatusByOrderIds } from "@/lib/returns";

export const dynamic = "force-dynamic";

function labelForStatus(status: string) {
  if (status === "paid") return "Payé";
  if (status === "cancelled") return "Annulé";
  return "En attente de paiement";
}

function labelForReturnStatus(status: string | undefined) {
  if (!status) return "Aucun";
  if (status === "approved") return "Accepté";
  if (status === "rejected") return "Refusé";
  if (status === "received") return "Reçu";
  if (status === "refunded") return "Remboursé";
  if (status === "cancelled") return "Annulé";
  return "Demandé";
}

export default async function OrdersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account/orders");

  const orders = await getOrdersByUserId(user.id);
  const returnStatusByOrder = await getLatestReturnStatusByOrderIds(
    user.id,
    orders.map((order) => order.id)
  );

  const hasAnyReturn = orders.some((o) => returnStatusByOrder.get(o.id) !== undefined);

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="font-title text-4xl text-black">Mes commandes</h1>
          <p className="mt-2 text-neutral-600">Historique des commandes associées à ton compte.</p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="font-semibold text-neutral-900">Aucune commande pour le moment.</p>
            <p className="mt-1 text-neutral-600">Ton historique apparaîtra ici après validation.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <table className="w-full border-collapse text-left">
              <thead className="bg-neutral-50 text-xs uppercase tracking-[0.16em] text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Commande</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Montant</th>
                  <th className="px-4 py-3">Paiement</th>
                  {hasAnyReturn && <th className="px-4 py-3">Retour</th>}
                  <th className="px-4 py-3">Détail</th>
                  <th className="px-4 py-3">Facture PDF</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-neutral-200 text-sm text-neutral-800">
                    <td className="px-4 py-3 font-semibold">{order.orderNumber}</td>
                    <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td className="px-4 py-3">{eurFromCents(order.totalCents)} €</td>
                    <td className="px-4 py-3">{labelForStatus(order.paymentStatus)}</td>
                    {hasAnyReturn && (
                      <td className="px-4 py-3">
                        {returnStatusByOrder.get(order.id) !== undefined
                          ? labelForReturnStatus(returnStatusByOrder.get(order.id))
                          : <span className="text-neutral-400">—</span>}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="font-semibold text-neutral-900 underline underline-offset-4"
                      >
                        Voir
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {order.paymentStatus === "paid" && order.stripeInvoiceUrl ? (
                        <a
                          href={order.stripeInvoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-indigo-600 underline underline-offset-4 hover:text-indigo-800"
                        >
                          PDF
                        </a>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="font-semibold text-neutral-900">Besoin d&apos;un retour ?</p>
          <p className="mt-1 text-neutral-600">Crée une demande depuis ton espace retours.</p>
          <Link href="/account/returns" className="mt-3 inline-block font-semibold text-neutral-900 underline underline-offset-4">
            Gérer mes retours
          </Link>
        </div>
      </div>
    </main>
  );
}
