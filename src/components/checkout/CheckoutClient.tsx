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

type AddressFormState = {
  firstName: string;
  lastName: string;
  line1: string;
  line2: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
};

const emptyForm: AddressFormState = {
  firstName: "",
  lastName: "",
  line1: "",
  line2: "",
  postalCode: "",
  city: "",
  country: "France",
  phone: "",
};

function eurFromCents(cents: number) {
  return (Number(cents) / 100).toFixed(2);
}

function defaultAddressId(addresses: Address[], key: "shipping" | "billing") {
  const found = addresses.find((a) =>
    key === "shipping" ? a.isDefaultShipping : a.isDefaultBilling
  );
  return found?.id ?? addresses[0]?.id ?? 0;
}

/* ─── Formulaire d'ajout d'adresse inline ─── */
function InlineAddressForm({
  onSaved,
}: {
  onSaved: (addresses: Address[]) => void;
}) {
  const [form, setForm] = useState<AddressFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof AddressFormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch("/api/address", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        isDefaultShipping: true,
        isDefaultBilling: true,
      }),
    }).catch(() => null);

    if (!res?.ok) {
      setSaving(false);
      setError("Impossible d'enregistrer l'adresse.");
      return;
    }

    const refreshed = await fetch("/api/address", { cache: "no-store" }).catch(() => null);
    if (refreshed?.ok) {
      const next = (await refreshed.json()) as Address[];
      onSaved(next);
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          className="rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          placeholder="Prénom *"
          value={form.firstName}
          onChange={(e) => set("firstName", e.target.value)}
          required
        />
        <input
          className="rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          placeholder="Nom *"
          value={form.lastName}
          onChange={(e) => set("lastName", e.target.value)}
          required
        />
      </div>
      <input
        className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
        placeholder="Adresse *"
        value={form.line1}
        onChange={(e) => set("line1", e.target.value)}
        required
      />
      <input
        className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
        placeholder="Complément d'adresse (optionnel)"
        value={form.line2}
        onChange={(e) => set("line2", e.target.value)}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          className="rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          placeholder="Code postal *"
          value={form.postalCode}
          onChange={(e) => set("postalCode", e.target.value)}
          required
        />
        <input
          className="rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          placeholder="Ville *"
          value={form.city}
          onChange={(e) => set("city", e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          className="rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          placeholder="Pays *"
          value={form.country}
          onChange={(e) => set("country", e.target.value)}
          required
        />
        <input
          className="rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          placeholder="Téléphone *"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          required
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="h-11 w-full rounded-xl bg-neutral-900 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
      >
        {saving ? "Enregistrement..." : "Enregistrer et continuer"}
      </button>
    </form>
  );
}

/* ─── Composant principal ─── */
export default function CheckoutClient({
  addresses: initialAddresses,
  cartItems,
}: {
  addresses: Address[];
  cartItems: CartItem[];
}) {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [showAddForm, setShowAddForm] = useState(initialAddresses.length === 0);

  const [shippingAddressId, setShippingAddressId] = useState(
    defaultAddressId(initialAddresses, "shipping")
  );
  const [billingAddressId, setBillingAddressId] = useState(
    defaultAddressId(initialAddresses, "billing")
  );

  const [creating, setCreating] = useState(false);
  const [paying, setPaying] = useState(false);
  const [simPaying, setSimPaying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    "pending_payment" | "paid" | "cancelled" | null
  >(null);

  const totalCents = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.pricecents * item.quantity, 0),
    [cartItems]
  );

  /* Après ajout d'adresse inline */
  const handleAddressSaved = (next: Address[]) => {
    setAddresses(next);
    const first = next[0];
    if (first) {
      setShippingAddressId(first.id);
      setBillingAddressId(first.id);
    }
    setShowAddForm(false);
  };

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

  const payWithStripe = async () => {
    if (!createdOrder) return;
    setError(null);
    setPaying(true);

    const res = await fetch("/api/payment/stripe/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: createdOrder.orderId }),
    }).catch(() => null);

    setPaying(false);

    if (!res?.ok) {
      const data = await res?.json().catch(() => null);
      setError(data?.error === "STRIPE_NOT_CONFIGURED"
        ? "Stripe n'est pas configuré. Vérifie ta clé API dans .env."
        : "Impossible d'initier le paiement.");
      return;
    }

    const data = (await res.json()) as { url?: string };
    if (!data.url) {
      setError("URL de paiement invalide.");
      return;
    }

    window.location.href = data.url;
  };

  const paySimulated = async () => {
    if (!createdOrder) return;
    setError(null);
    setSimPaying(true);

    const res = await fetch("/api/payment/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: createdOrder.orderId }),
    }).catch(() => null);

    setSimPaying(false);
    if (!res?.ok) { setError("Paiement simulé impossible."); return; }

    setPaymentStatus("paid");
    router.push(`/account/orders/${createdOrder.orderId}`);
    router.refresh();
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
    if (!res?.ok) { setError("Annulation impossible."); return; }
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

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      <section className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">

        {/* ── Adresse : form inline si aucune, sinon sélecteur ── */}
        {showAddForm ? (
          <div>
            <h2 className="mb-4 text-base font-semibold text-neutral-900">
              {addresses.length === 0 ? "Ajouter une adresse de livraison" : "Nouvelle adresse"}
            </h2>
            <InlineAddressForm onSaved={handleAddressSaved} />
            {addresses.length > 0 && (
              <button
                onClick={() => setShowAddForm(false)}
                className="mt-3 text-sm text-neutral-500 underline hover:text-neutral-900"
              >
                Annuler
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-neutral-900">Adresses</h2>
              <button
                onClick={() => setShowAddForm(true)}
                className="text-xs font-semibold text-neutral-500 underline hover:text-neutral-900"
              >
                + Nouvelle adresse
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="text-sm text-neutral-700">
                Livraison
                <select
                  value={shippingAddressId}
                  onChange={(e) => setShippingAddressId(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                >
                  {addresses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.firstName} {a.lastName} — {a.line1}, {a.city}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-neutral-700">
                Facturation
                <select
                  value={billingAddressId}
                  onChange={(e) => setBillingAddressId(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                >
                  {addresses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.firstName} {a.lastName} — {a.line1}, {a.city}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        )}

        {/* ── Articles ── */}
        {!showAddForm && (
          <>
            <div className="space-y-3">
              {cartItems.map((item) => (
                <article key={item.cartitemid} className="rounded-xl border border-neutral-200 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-neutral-900">{item.name}</p>
                    <p className="text-sm text-neutral-700">
                      {eurFromCents(item.pricecents * item.quantity)} €
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-neutral-600">
                    {item.quantity} × {eurFromCents(item.pricecents)} €
                  </p>
                </article>
              ))}
            </div>

            {/* ── Actions commande / paiement ── */}
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
                <p className="text-sm font-semibold text-neutral-900">
                  Commande {createdOrder.orderNumber}
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  {paymentStatus === "pending_payment" && "En attente de paiement"}
                  {paymentStatus === "paid" && "✓ Paiement reçu"}
                  {paymentStatus === "cancelled" && "Commande annulée"}
                </p>

                {paymentStatus === "pending_payment" && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={payWithStripe}
                      disabled={paying}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                      {paying ? "Redirection..." : "Payer par carte"}
                    </button>
                    <button
                      onClick={paySimulated}
                      disabled={simPaying}
                      className="inline-flex h-11 items-center justify-center rounded-xl bg-neutral-700 px-4 text-sm font-semibold text-white hover:bg-neutral-900 disabled:opacity-60"
                    >
                      {simPaying ? "Simulation..." : "Paiement simulé"}
                    </button>
                    <button
                      onClick={cancel}
                      disabled={cancelling}
                      className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-900 hover:border-neutral-400 disabled:opacity-60"
                    >
                      {cancelling ? "Annulation..." : "Annuler"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </section>

      {/* ── Récapitulatif ── */}
      <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
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
