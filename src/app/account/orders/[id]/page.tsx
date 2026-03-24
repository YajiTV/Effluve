import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { eurFromCents } from "@/lib/money";
import { getOrderDetailById } from "@/lib/orders";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

function labelForStatus(status: string) {
  if (status === "paid") return "Payé";
  if (status === "cancelled") return "Annulé";
  return "En attente de paiement";
}

export default async function OrderDetailPage({ params }: Params) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account/orders");

  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isFinite(orderId) || orderId <= 0) notFound();

  const order = await getOrderDetailById(user.id, orderId);
  if (!order) notFound();

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase">Commande</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">{order.orderNumber}</h1>
            <p className="mt-2 text-neutral-600">
              Créée le {new Date(order.createdAt).toLocaleDateString("fr-FR")} — {labelForStatus(order.paymentStatus)}
            </p>
          </div>
          <Link href="/account/orders" className="text-sm font-semibold text-neutral-900 underline underline-offset-4">
            Retour aux commandes
          </Link>
        </div>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-900">Articles</h2>
          <div className="mt-4 space-y-3">
            {order.items.map((item) => (
              <article key={item.id} className="rounded-xl border border-neutral-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-neutral-900">{item.productName}</p>
                  <p className="text-sm text-neutral-700">{eurFromCents(item.lineTotalCents)} €</p>
                </div>
                <p className="mt-1 text-xs text-neutral-600">
                  {item.quantity} × {eurFromCents(item.unitPriceCents)} €
                </p>
              </article>
            ))}
          </div>

          <div className="my-4 h-px w-full bg-neutral-200" />

          <div className="flex items-center justify-between">
            <p className="font-semibold text-neutral-900">Total</p>
            <p className="font-semibold text-neutral-900">{eurFromCents(order.totalCents)} €</p>
          </div>

          {order.paymentStatus === "paid" && (
            <div className="mt-6 flex flex-wrap gap-3">
              {/* Facture Stripe (si disponible) */}
              {order.stripeInvoiceUrl ? (
                <a
                  href={order.stripeInvoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                >
                  Facture Stripe (PDF)
                </a>
              ) : null}

              {/* Facture interne imprimable */}
              <Link
                href={`/account/orders/${order.id}/invoice`}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-900 hover:border-neutral-900 transition-colors"
              >
                Voir la facture
              </Link>

              <Link
                href="/account/returns"
                className="inline-flex h-10 items-center rounded-xl border border-neutral-200 bg-white px-5 text-sm font-semibold text-neutral-700 hover:border-neutral-400 transition-colors"
              >
                Demander un retour
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
