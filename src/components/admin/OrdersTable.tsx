"use client";

import { useState } from "react";
import { AdminOrder, ORDER_STATUSES } from "@/lib/admin-orders";
import { eurFromCents } from "@/lib/money";
import { PaymentStatus } from "@prisma/client";

const STATUS_LABEL: Record<PaymentStatus, string> = {
  pending_payment: "En attente de paiement",
  paid: "Payée",
  preparing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const STATUS_COLOR: Record<PaymentStatus, string> = {
  pending_payment: "bg-neutral-100 text-neutral-600",
  paid: "bg-orange-100 text-orange-700",
  preparing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrdersTable({ initialOrders }: { initialOrders: AdminOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [loadingStatus, setLoadingStatus] = useState<number | null>(null);
  const [loadingLabel, setLoadingLabel] = useState<number | null>(null);
  const [labelError, setLabelError] = useState<{ id: number; msg: string } | null>(null);

  async function handleStatusChange(orderId: number, newStatus: PaymentStatus) {
    setLoadingStatus(orderId);
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: newStatus } : o))
      );
    }
    setLoadingStatus(null);
  }

  async function handleGenerateLabel(orderId: number) {
    setLoadingLabel(orderId);
    setLabelError(null);

    const res = await fetch("/api/shipping/label", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });

    const data = await res.json().catch(() => ({}));
    setLoadingLabel(null);

    if (!res.ok) {
      setLabelError({ id: orderId, msg: data.error ?? "Erreur inconnue" });
      return;
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              trackingNumber: data.trackingNumber,
              labelUrl: data.labelUrl,
              carrierName: data.carrierName,
              paymentStatus: "preparing" as PaymentStatus,
            }
          : o
      )
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-neutral-200 text-left">
            <th className="pb-3 pr-4 font-body text-xs uppercase tracking-widest text-neutral-400">Commande</th>
            <th className="pb-3 pr-4 font-body text-xs uppercase tracking-widest text-neutral-400">Client</th>
            <th className="pb-3 pr-4 font-body text-xs uppercase tracking-widest text-neutral-400">Date</th>
            <th className="pb-3 pr-4 font-body text-xs uppercase tracking-widest text-neutral-400">Articles</th>
            <th className="pb-3 pr-4 font-body text-xs uppercase tracking-widest text-neutral-400">Total</th>
            <th className="pb-3 pr-4 font-body text-xs uppercase tracking-widest text-neutral-400">Statut</th>
            <th className="pb-3 font-body text-xs uppercase tracking-widest text-neutral-400">Livraison</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
              <td className="py-4 pr-4 font-mono text-xs text-neutral-500">{order.orderNumber}</td>
              <td className="py-4 pr-4">
                <p className="font-body text-sm text-black">{order.customerName}</p>
                <p className="font-body text-xs text-neutral-400">{order.customerEmail}</p>
              </td>
              <td className="py-4 pr-4 font-body text-sm text-neutral-600">
                {new Date(order.createdAt).toLocaleDateString("fr-FR")}
              </td>
              <td className="py-4 pr-4 font-body text-sm text-neutral-600 text-center">
                {order.itemCount}
              </td>
              <td className="py-4 pr-4 font-body text-sm font-medium text-black">
                {eurFromCents(order.totalCents)} €
              </td>
              <td className="py-4 pr-4">
                <select
                  value={order.paymentStatus}
                  disabled={loadingStatus === order.id}
                  onChange={(e) => handleStatusChange(order.id, e.target.value as PaymentStatus)}
                  className={`px-3 py-1.5 text-xs font-body rounded-full border-0 cursor-pointer disabled:opacity-50 ${STATUS_COLOR[order.paymentStatus]}`}
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABEL[status]}
                    </option>
                  ))}
                </select>
              </td>
              <td className="py-4">
                {order.trackingNumber ? (
                  <div className="space-y-1">
                    <p className="text-xs text-neutral-500">
                      {order.carrierName} — <span className="font-mono">{order.trackingNumber}</span>
                    </p>
                    {order.labelUrl && (
                      <a
                        href={order.labelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
                      >
                        Télécharger l'étiquette
                      </a>
                    )}
                  </div>
                ) : order.paymentStatus === "paid" || order.paymentStatus === "preparing" ? (
                  <div className="space-y-1">
                    <button
                      onClick={() => handleGenerateLabel(order.id)}
                      disabled={loadingLabel === order.id}
                      className="inline-flex h-8 items-center rounded-lg bg-neutral-900 px-3 text-xs font-semibold text-white hover:bg-black disabled:opacity-50"
                    >
                      {loadingLabel === order.id ? "Génération..." : "Générer l'étiquette"}
                    </button>
                    {labelError?.id === order.id && (
                      <p className="text-xs text-red-600">{labelError.msg}</p>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-neutral-300">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {orders.length === 0 && (
        <p className="py-12 text-center font-body text-sm text-neutral-400">Aucune commande.</p>
      )}
    </div>
  );
}
