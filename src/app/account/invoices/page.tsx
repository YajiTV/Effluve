import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { eurFromCents } from "@/lib/money";
import { getOrdersByUserId } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account/invoices");

  const allOrders = await getOrdersByUserId(user.id);
  const invoices = allOrders.filter((o) => o.paymentStatus === "paid");

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-neutral-500 uppercase">Compte</p>
          <h1 className="mt-2 font-title text-4xl text-black">Mes factures</h1>
          <p className="mt-2 text-neutral-600">Retrouve ici toutes tes factures pour les commandes payées.</p>
        </div>

        {invoices.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
            <p className="font-semibold text-neutral-900">Aucune facture disponible.</p>
            <p className="mt-1 text-neutral-600">
              Les factures apparaissent ici une fois ta commande payée.
            </p>
            <Link
              href="/account/orders"
              className="mt-4 inline-block font-semibold text-neutral-900 underline underline-offset-4"
            >
              Voir mes commandes
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <table className="w-full border-collapse text-left">
              <thead className="bg-neutral-50 text-xs uppercase tracking-[0.16em] text-neutral-500">
                <tr>
                  <th className="px-4 py-3">N° Facture</th>
                  <th className="px-4 py-3">Commande</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Montant TTC</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((order) => (
                  <tr key={order.id} className="border-t border-neutral-200 text-sm text-neutral-800">
                    <td className="px-4 py-3 font-semibold">FAC-{order.orderNumber}</td>
                    <td className="px-4 py-3 text-neutral-500">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 font-semibold">{eurFromCents(order.totalCents)} €</td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                        Payée
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/account/orders/${order.id}/invoice`}
                        className="font-semibold text-indigo-600 underline underline-offset-4 hover:text-indigo-800"
                      >
                        Voir la facture
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="font-semibold text-neutral-900">Besoin d&apos;un détail de commande ?</p>
          <p className="mt-1 text-neutral-600">Consulte le suivi complet de tes commandes.</p>
          <Link
            href="/account/orders"
            className="mt-3 inline-block font-semibold text-neutral-900 underline underline-offset-4"
          >
            Voir mes commandes
          </Link>
        </div>
      </div>
    </main>
  );
}
