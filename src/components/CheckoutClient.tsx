"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Address = {
  id: number;
  firstName: string;
  lastName: string;
  line1: string;
  line2: string | null;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
};

type CartItem = {
  cartitemid: number;
  quantity: number;
  productid: number;
  name: string;
  pricecents: number;
  imageurl: string | null;
};

type CreatedOrder = {
  orderId: number;
  orderNumber: string;
  totalCents: number;
  paymentStatus: "pending_payment";
};

function eurFromCents(cents: number) {
  return (Number(cents) / 100).toFixed(2);
}

function defaultAddressId(addresses: Address[], key: "shipping" | "billing") {
  const found = addresses.find((address) =>
    key === "shipping" ? address.isDefaultShipping : address.isDefaultBilling
  );
  return found?.id ?? addresses[0]?.id ?? 0;
}

export default function CheckoutClient({
  addresses,
  cartItems,
}: {
  addresses: Address[];
  cartItems: CartItem[];
}) {
  const router = useRouter();
  const [shippingAddressId, setShippingAddressId] = useState(defaultAddressId(addresses, "shipping"));
  const [billingAddressId, setBillingAddressId] = useState(defaultAddressId(addresses, "billing"));
  const [creating, setCreating] = useState(false);
  const [paying, setPaying] = useState(false);
  const [stripePaying, setStripePaying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"pending_payment" | "paid" | "cancelled" | null>(null);

  const totalCents = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.pricecents * item.quantity, 0),
    [cartItems]
  );

  const createOrder = async () => {
    setError(null);
    setCreating(true);

    const res = await fetch("/api/checkout/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shippingAddressId, billingAddressId }),
    }).catch(() => null);

    setCreating(false);

    if (!res?.ok) {
      setError("Impossible de valider la commande.");
      return;
    }

    const data = (await res.json()) as { order: CreatedOrder };
    setCreatedOrder(data.order);
    setPaymentStatus("pending_payment");
    window.dispatchEvent(new Event("effluve:counts"));
  };

  const pay = async () => {
    if (!createdOrder) return;

    setError(null);
    setPaying(true);

    const res = await fetch("/api/payment/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: createdOrder.orderId }),
    }).catch(() => null);

    setPaying(false);

    if (!res?.ok) {
      setError("Paiement simulé impossible.");
      return;
    }

    setPaymentStatus("paid");
    router.push(`/account/orders/${createdOrder.orderId}`);
    router.refresh();
  };

  const payWithStripeTest = async () => {
    if (!createdOrder) return;
    setError(null);
    setStripePaying(true);

    const res = await fetch("/api/payment/stripe/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: createdOrder.orderId }),
    }).catch(() => null);

    setStripePaying(false);

    if (!res?.ok) {
      setError("Session Stripe test indisponible.");
      return;
    }

    const data = (await res.json()) as { url?: string };
    if (!data.url) {
      setError("URL Stripe invalide.");
      return;
    }

    window.location.href = data.url;
  };

  const cancel = async () => {
    if (!createdOrder) return;

    setError(null);
    setCancelling(true);

    const res = await fetch("/api/payment/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: createdOrder.orderId }),
    }).catch(() => null);

    setCancelling(false);

    if (!res?.ok) {
      setError("Annulation impossible.");
      return;
    }

    setPaymentStatus("cancelled");
  };

  if (!cartItems.length) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="font-semibold text-neutral-900">Ton panier est vide.</p>
        <p className="mt-1 text-neutral-600">Ajoute au moins un article avant de valider une commande.</p>
      </div>
    );
  }

  if (!addresses.length) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="font-semibold text-neutral-900">Aucune adresse disponible.</p>
        <p className="mt-1 text-neutral-600">Ajoute une adresse depuis /account/address pour continuer.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-neutral-900">Validation de commande</h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm text-neutral-700">
            Adresse de livraison
            <select
              value={shippingAddressId}
              onChange={(event) => setShippingAddressId(Number(event.target.value))}
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
            >
              {addresses.map((address) => (
                <option key={address.id} value={address.id}>
                  {address.firstName} {address.lastName} - {address.line1}, {address.city}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-neutral-700">
            Adresse de facturation
            <select
              value={billingAddressId}
              onChange={(event) => setBillingAddressId(Number(event.target.value))}
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
            >
              {addresses.map((address) => (
                <option key={address.id} value={address.id}>
                  {address.firstName} {address.lastName} - {address.line1}, {address.city}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="space-y-3">
          {cartItems.map((item) => (
            <article key={item.cartitemid} className="rounded-xl border border-neutral-200 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-neutral-900">{item.name}</p>
                <p className="text-sm text-neutral-700">{eurFromCents(item.pricecents * item.quantity)} €</p>
              </div>
              <p className="mt-1 text-xs text-neutral-600">
                {item.quantity} x {eurFromCents(item.pricecents)} €
              </p>
            </article>
          ))}
        </div>

        {!createdOrder ? (
          <button
            onClick={createOrder}
            disabled={creating}
            className="h-11 w-full rounded-xl bg-neutral-900 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
          >
            {creating ? "Validation..." : "Valider la commande"}
          </button>
        ) : (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-sm font-semibold text-neutral-900">Commande {createdOrder.orderNumber}</p>
            <p className="mt-1 text-sm text-neutral-600">
              Statut paiement: {paymentStatus === "pending_payment" ? "en attente de paiement" : paymentStatus}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={payWithStripeTest}
                disabled={stripePaying || paymentStatus !== "pending_payment"}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {stripePaying ? "Redirection Stripe..." : "Payer avec Stripe (test)"}
              </button>

              <button
                onClick={pay}
                disabled={paying || paymentStatus !== "pending_payment"}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-neutral-900 px-4 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
              >
                {paying ? "Paiement..." : "Paiement simulé"}
              </button>

              <button
                onClick={cancel}
                disabled={cancelling || paymentStatus !== "pending_payment"}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-900 hover:border-neutral-400 disabled:opacity-60"
              >
                {cancelling ? "Annulation..." : "Annuler"}
              </button>
            </div>
          </div>
        )}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </section>

      <aside className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm h-fit">
        <h2 className="text-base font-semibold text-neutral-900">Récapitulatif</h2>
        <div className="mt-3 space-y-2 text-sm text-neutral-700">
          <div className="flex items-center justify-between">
            <span>Sous-total</span>
            <span>{eurFromCents(totalCents)} €</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Livraison</span>
            <span>Offerte</span>
          </div>
        </div>

        <div className="my-4 h-px w-full bg-neutral-200" />

        <div className="flex items-center justify-between font-semibold text-neutral-900">
          <span>Total</span>
          <span>{eurFromCents(totalCents)} €</span>
        </div>
      </aside>
    </div>
  );
}
