import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { eurFromCents } from "@/lib/money";
import { getOrderDetailById } from "@/lib/orders";
import type { OrderStatus } from "@/lib/orders";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

type TimelineStep = {
  label: string;
  reached: boolean;
};

function buildTimeline(status: OrderStatus): TimelineStep[] {
  const steps: { label: string; statuses: OrderStatus[] }[] = [
    { label: "Commande confirmée", statuses: ["paid", "preparing", "shipped", "delivered"] },
    { label: "En préparation", statuses: ["preparing", "shipped", "delivered"] },
    { label: "Expédiée", statuses: ["shipped", "delivered"] },
    { label: "Livrée", statuses: ["delivered"] },
  ];

  return steps.map((step) => ({
    label: step.label,
    reached: step.statuses.includes(status),
  }));
}

export default async function OrderDetailPage({ params }: Params) {
  const user = await getSessionUser();
  if (!user) redirect("/connexion?next=/compte/commandes");

  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isFinite(orderId) || orderId <= 0) notFound();

  const order = await getOrderDetailById(user.id, orderId);
  if (!order) notFound();

  const timeline = buildTimeline(order.paymentStatus);

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase">Commande</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">{order.orderNumber}</h1>
            <p className="mt-2 text-sm text-neutral-600">
              Créée le {new Date(order.createdAt).toLocaleDateString("fr-FR")} — Total :{" "}
              <span className="font-semibold text-neutral-900">{eurFromCents(order.totalCents)} €</span>
            </p>
          </div>
          <Link
            href="/compte/commandes"
            className="text-sm font-semibold text-neutral-900 underline underline-offset-4"
          >
            ← Mes commandes
          </Link>
        </div>

        {order.paymentStatus === "cancelled" ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-700">Commande annulée</p>
            <p className="mt-1 text-sm text-red-600">
              Cette commande a été annulée. Contacte-nous si tu as des questions.
            </p>
          </div>
        ) : order.paymentStatus === "pending_payment" ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="font-semibold text-amber-700">En attente de paiement</p>
            <p className="mt-1 text-sm text-amber-600">
              Le paiement est en attente de validation.
            </p>
          </div>
        ) : (
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Suivi de commande
            </h2>
            <ol className="mt-5 space-y-0">
              {timeline.map((step, index) => {
                const isLast = index === timeline.length - 1;
                return (
                  <li key={step.label} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={[
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                          step.reached
                            ? "border-black bg-black text-white"
                            : "border-neutral-300 bg-white text-neutral-400",
                        ].join(" ")}
                      >
                        {step.reached ? "✓" : "○"}
                      </div>
                      {!isLast && (
                        <div
                          className={[
                            "mt-1 w-0.5 flex-1 min-h-8",
                            step.reached ? "bg-black" : "bg-neutral-200",
                          ].join(" ")}
                        />
                      )}
                    </div>
                    <div className={["pb-6", isLast ? "" : ""].join(" ")}>
                      <p
                        className={[
                          "text-sm font-semibold leading-7",
                          step.reached ? "text-neutral-900" : "text-neutral-400",
                        ].join(" ")}
                      >
                        {step.label}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

            {order.trackingNumber && (
              <div className="mt-2 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 mb-1">
                  Numéro de suivi
                </p>
                <p className="text-sm text-neutral-900">
                  {order.carrierName && (
                    <span className="text-neutral-500 font-normal">{order.carrierName} — </span>
                  )}
                  <span className="font-mono font-semibold">{order.trackingNumber}</span>
                </p>
              </div>
            )}
          </section>
        )}

        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-neutral-500">Articles</h2>
          <div className="mt-4 space-y-3">
            {order.items.map((item) => (
              <article key={item.id} className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-neutral-900">{item.productName}</p>
                  <p className="text-sm text-neutral-700">{eurFromCents(item.lineTotalCents)} €</p>
                </div>
                <p className="mt-1 text-xs text-neutral-500">
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
        </section>

        {order.paymentStatus === "paid" && (
          <div className="flex flex-wrap gap-3">
            {order.stripeInvoiceUrl && (
              <a
                href={order.stripeInvoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-black px-5 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
              >
                Facture PDF
              </a>
            )}
            <Link
              href={`/compte/commandes/${order.id}/invoice`}
              className="inline-flex h-10 items-center rounded-xl border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-900 hover:border-neutral-900 transition-colors"
            >
              Voir la facture
            </Link>
            <Link
              href="/compte/retours"
              className="inline-flex h-10 items-center rounded-xl border border-neutral-200 bg-white px-5 text-sm font-semibold text-neutral-700 hover:border-neutral-400 transition-colors"
            >
              Demander un retour
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
