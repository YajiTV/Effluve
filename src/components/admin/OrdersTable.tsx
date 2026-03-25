"use client";

import { useState } from "react";
import { AdminOrder, ORDER_STATUSES } from "@/lib/admin-orders";
import { eurFromCents } from "@/lib/money";
import { PaymentStatus } from "@prisma/client";

// Libellés et couleurs pour chaque statut
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
  const [loading, setLoading] = useState<number | null>(null); // id de la commande en cours de mise à jour

  async function handleStatusChange(orderId: number, newStatus: PaymentStatus) {
    setLoading(orderId);

    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      // Mise à jour locale sans recharger la page
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: newStatus } : o))
      );
    }

    setLoading(null);
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
            <th className="pb-3 font-body text-xs uppercase tracking-widest text-neutral-400">Statut</th>
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
              <td className="py-4">
                <select
                  value={order.paymentStatus}
                  disabled={loading === order.id}
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
