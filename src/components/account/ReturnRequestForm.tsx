"use client";

import { useMemo, useState } from "react";

type PaidOrder = {
  id: number;
  orderNumber: string;
  items: { id: number; productName: string }[];
};

const REASONS = [
  { value: "too_small", label: "Taille trop petite" },
  { value: "too_large", label: "Taille trop grande" },
  { value: "damaged", label: "Article endommagé" },
  { value: "not_as_described", label: "Non conforme" },
  { value: "wrong_item", label: "Mauvais article" },
  { value: "changed_mind", label: "Changement d'avis" },
  { value: "other", label: "Autre" },
] as const;

export default function ReturnRequestForm({ paidOrders }: { paidOrders: PaidOrder[] }) {
  const [orderId, setOrderId] = useState<number>(paidOrders[0]?.id ?? 0);
  const [orderItemId, setOrderItemId] = useState<number | "all">("all");
  const [reason, setReason] = useState<(typeof REASONS)[number]["value"]>("changed_mind");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const selectedOrder = useMemo(
    () => paidOrders.find((order) => order.id === orderId) ?? null,
    [paidOrders, orderId]
  );

  async function submit() {
    setError(null);
    setOk(null);
    if (!orderId || !selectedOrder) {
      setError("Commande invalide.");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/returns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        orderItemId: orderItemId === "all" ? null : orderItemId,
        reason,
        note,
      }),
    }).catch(() => null);
    setSubmitting(false);

    if (!res?.ok) {
      setError("Impossible de créer la demande de retour.");
      return;
    }

    setOk("Demande de retour créée.");
    setNote("");
    setOrderItemId("all");
  }

  if (!paidOrders.length) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <p className="font-semibold text-neutral-900">Aucune commande éligible.</p>
        <p className="mt-1 text-neutral-600">Seules les commandes payées peuvent faire l&apos;objet d&apos;un retour.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-neutral-900">Nouveau retour</h2>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="text-sm text-neutral-700">
          Commande
          <select
            value={orderId}
            onChange={(event) => setOrderId(Number(event.target.value))}
            className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
          >
            {paidOrders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.orderNumber}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-neutral-700">
          Article
          <select
            value={orderItemId}
            onChange={(event) =>
              setOrderItemId(event.target.value === "all" ? "all" : Number(event.target.value))
            }
            className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="all">Commande complète</option>
            {(selectedOrder?.items ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.productName}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-neutral-700 md:col-span-2">
          Motif
          <select
            value={reason}
            onChange={(event) => setReason(event.target.value as (typeof REASONS)[number]["value"])}
            className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
          >
            {REASONS.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-neutral-700 md:col-span-2">
          Détail (optionnel)
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={submit}
          disabled={submitting}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-neutral-900 px-4 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {submitting ? "Envoi..." : "Créer la demande"}
        </button>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {ok ? <p className="text-sm text-green-700">{ok}</p> : null}
      </div>
    </div>
  );
}
