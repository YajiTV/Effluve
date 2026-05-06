"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminReturnSummary } from "@/lib/returns";

const STATUS_OPTIONS = [
  { value: "requested", label: "Demandé" },
  { value: "approved", label: "Accepté" },
  { value: "rejected", label: "Refusé" },
  { value: "received", label: "Reçu" },
  { value: "refunded", label: "Remboursé" },
  { value: "cancelled", label: "Annulé" },
  { value: "answer_waiting", label: "En attente de réponse" },
] as const;

type StatusValue = (typeof STATUS_OPTIONS)[number]["value"];

export default function AdminReturnsTable({ rows }: { rows: AdminReturnSummary[] }) {
  const router = useRouter();
  const [items, setItems] = useState(rows);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function updateStatus(returnId: number, status: StatusValue, refundCents?: number) {
    setError(null);
    setOk(null);
    setBusyId(returnId);

    const res = await fetch(`/api/admin/returns/${returnId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        refundCents: status === "refunded" ? Math.max(0, Number(refundCents ?? 0)) : null,
      }),
    }).catch(() => null);

    setBusyId(null);

    if (!res?.ok) {
      const data = (await res?.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ? `Mise à jour refusée: ${data.error}` : "Mise à jour impossible.");
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === returnId
          ? {
              ...item,
              status,
              refundCents: status === "refunded" ? Math.max(0, Number(refundCents ?? 0)) : null,
            }
          : item
      )
    );
    setOk("Statut mis à jour.");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {ok ? <p className="text-sm text-green-700">{ok}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead className="bg-neutral-50 text-xs uppercase tracking-[0.16em] text-neutral-500">
            <tr>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Commande</th>
              <th className="px-4 py-3">Article</th>
              <th className="px-4 py-3">Motif</th>
              <th className="px-4 py-3">Note</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr className="border-t border-neutral-200 text-sm text-neutral-700">
                <td className="px-4 py-4" colSpan={7}>
                  Aucun retour.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <AdminReturnsRow key={item.id} item={item} busy={busyId === item.id} onSubmit={updateStatus} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminReturnsRow({
  item,
  busy,
  onSubmit,
}: {
  item: AdminReturnSummary;
  busy: boolean;
  onSubmit: (returnId: number, status: StatusValue, refundCents?: number) => Promise<void>;
}) {
  const [status, setStatus] = useState<StatusValue>(item.status);
  const [refundInput, setRefundInput] = useState(item.refundCents != null ? String(item.refundCents) : "");

  return (
    <tr className="border-t border-neutral-200 text-sm text-neutral-800">
      <td className="px-4 py-3">
        <p className="font-semibold">{item.userName}</p>
        <p className="text-xs text-neutral-600">{item.userEmail}</p>
      </td>
      <td className="px-4 py-3">{item.orderNumber}</td>
      <td className="px-4 py-3">{item.productName ?? "Commande complète"}</td>
      <td className="px-4 py-3">{item.reason}</td>
      <td className="px-4 py-3">{item.note ?? "-"}</td>
      <td className="px-4 py-3">{item.status}</td>
      <td className="px-4 py-3">
        <div className="flex min-w-[280px] items-center gap-2">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as StatusValue)}
            className="rounded-lg border border-neutral-300 px-2 py-1"
          >
            {STATUS_OPTIONS.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </select>

          {status === "refunded" ? (
            <input
              type="number"
              min={0}
              step={1}
              value={refundInput}
              onChange={(event) => setRefundInput(event.target.value)}
              placeholder="Montant cents"
              className="w-36 rounded-lg border border-neutral-300 px-2 py-1"
            />
          ) : null}

          <button
            onClick={() =>
              onSubmit(
                item.id,
                status,
                status === "refunded" ? Number(refundInput || "0") : undefined
              )
            }
            disabled={busy}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-neutral-900 px-3 text-xs font-semibold text-white hover:bg-black disabled:opacity-60"
          >
            {busy ? "..." : "Appliquer"}
          </button>
        </div>
      </td>
    </tr>
  );
}
