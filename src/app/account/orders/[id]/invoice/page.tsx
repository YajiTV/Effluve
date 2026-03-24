import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getOrderInvoiceData } from "@/lib/orders";
import { eurFromCents } from "@/lib/money";
import PrintButton from "./PrintButton";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function InvoicePage({ params }: Params) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isFinite(orderId) || orderId <= 0) notFound();

  const order = await getOrderInvoiceData(user.id, orderId);
  if (!order) notFound();

  const invoiceNumber = `FAC-${order.orderNumber}`;
  const invoiceDate = new Date(order.createdAt).toLocaleDateString("fr-FR");
  const tva = order.billingAddress.vatNumber;
  const company = order.billingAddress.company;

  return (
    <>
      {/* Barre d'actions (masquée à l'impression) */}
      <div className="print:hidden flex items-center gap-4 px-6 py-4 bg-neutral-50 border-b border-neutral-200">
        <Link
          href={`/account/orders/${order.id}`}
          className="text-sm text-neutral-600 hover:text-neutral-900 underline underline-offset-2"
        >
          ← Retour à la commande
        </Link>
        <PrintButton />
        {order.stripeInvoiceUrl && (
          <a
            href={order.stripeInvoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex h-9 items-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Facture Stripe (PDF officiel)
          </a>
        )}
      </div>

      {/* Corps de la facture */}
      <main className="min-h-screen bg-white px-8 py-12 print:p-0">
        <div className="mx-auto max-w-3xl print:max-w-none">

          {/* En-tête */}
          <div className="flex items-start justify-between mb-10">
            <div>
              <p className="text-2xl font-bold tracking-tight text-neutral-900">EFFLUVE</p>
              <p className="mt-1 text-xs text-neutral-500">12 rue du Faubourg Saint-Honoré</p>
              <p className="text-xs text-neutral-500">75008 Paris — France</p>
              <p className="text-xs text-neutral-500">contact@effluve.fr</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-semibold text-neutral-900">Facture</p>
              <p className="mt-1 text-sm text-neutral-600">{invoiceNumber}</p>
              <p className="text-sm text-neutral-600">Date : {invoiceDate}</p>
              <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                Payée
              </span>
            </div>
          </div>

          <div className="h-px w-full bg-neutral-200 mb-8" />

          {/* Adresses */}
          <div className="grid grid-cols-2 gap-8 mb-10 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400 mb-2">
                Adresse de livraison
              </p>
              {order.shippingAddress.company && (
                <p className="font-semibold text-neutral-900">{order.shippingAddress.company}</p>
              )}
              <p className="text-neutral-800">{order.shippingAddress.name}</p>
              <p className="text-neutral-600">{order.shippingAddress.street}</p>
              <p className="text-neutral-600">
                {order.shippingAddress.zipcode} {order.shippingAddress.city}
              </p>
              <p className="text-neutral-600">{order.shippingAddress.country}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400 mb-2">
                Adresse de facturation
              </p>
              {company && <p className="font-semibold text-neutral-900">{company}</p>}
              <p className="text-neutral-800">{order.billingAddress.name}</p>
              <p className="text-neutral-600">{order.billingAddress.street}</p>
              <p className="text-neutral-600">
                {order.billingAddress.zipcode} {order.billingAddress.city}
              </p>
              <p className="text-neutral-600">{order.billingAddress.country}</p>
              {tva && <p className="mt-1 text-xs text-neutral-500">N° TVA : {tva}</p>}
            </div>
          </div>

          {/* Tableau des articles */}
          <table className="w-full border-collapse text-sm mb-6">
            <thead>
              <tr className="border-b-2 border-neutral-900">
                <th className="py-2 text-left font-semibold text-neutral-900">Article</th>
                <th className="py-2 text-right font-semibold text-neutral-900 w-20">Qté</th>
                <th className="py-2 text-right font-semibold text-neutral-900 w-28">Prix unitaire</th>
                <th className="py-2 text-right font-semibold text-neutral-900 w-28">Total HT</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} className="border-b border-neutral-100">
                  <td className="py-3 text-neutral-800">{item.productName}</td>
                  <td className="py-3 text-right text-neutral-700">{item.quantity}</td>
                  <td className="py-3 text-right text-neutral-700">{eurFromCents(item.unitPriceCents)} €</td>
                  <td className="py-3 text-right text-neutral-700">{eurFromCents(item.lineTotalCents)} €</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totaux */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Sous-total HT</span>
                <span>{eurFromCents(order.totalCents)} €</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>TVA (0 %)</span>
                <span>0,00 €</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Livraison</span>
                <span>Offerte</span>
              </div>
              <div className="h-px bg-neutral-200" />
              <div className="flex justify-between font-semibold text-neutral-900 text-base">
                <span>Total TTC</span>
                <span>{eurFromCents(order.totalCents)} €</span>
              </div>
            </div>
          </div>

          {/* Pied de page */}
          <div className="mt-16 border-t border-neutral-100 pt-6 text-xs text-neutral-400 text-center">
            <p>EFFLUVE SAS — SIRET 000 000 000 00000 — TVA FR00000000000</p>
            <p className="mt-1">Paiement reçu le {invoiceDate} — Commande {order.orderNumber}</p>
          </div>
        </div>
      </main>
    </>
  );
}
