import { RecentOrder } from "@/lib/admin";
import { eurFromCents } from "@/lib/money";

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "En attente",
  paid: "Payée",
  preparing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const STATUS_COLOR: Record<string, string> = {
  pending_payment: "bg-neutral-100 text-neutral-600",
  paid: "bg-orange-100 text-orange-700",
  preparing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function RecentOrdersTable({ orders }: { orders: RecentOrder[] }) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="px-6 py-3 text-left text-xs uppercase tracking-widest text-neutral-400 font-normal">
                Commande
              </th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-widest text-neutral-400 font-normal">
                Client
              </th>
              <th className="px-6 py-3 text-right text-xs uppercase tracking-widest text-neutral-400 font-normal">
                Montant
              </th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-widest text-neutral-400 font-normal">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-widest text-neutral-400 font-normal">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-neutral-500">
                  {order.orderNumber}
                </td>
                <td className="px-6 py-4 text-black">{order.customerName}</td>
                <td className="px-6 py-4 text-right text-black">
                  {eurFromCents(order.totalCents)} €
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs rounded ${
                      STATUS_COLOR[order.paymentStatus] ?? "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {STATUS_LABEL[order.paymentStatus] ?? order.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-neutral-500">{order.createdAt}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-neutral-400">
                  Aucune commande
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 border-t border-neutral-100">
        <a
          href="/admin/orders"
          className="text-xs uppercase tracking-widest text-neutral-400 hover:text-black transition-colors"
        >
          Voir toutes les commandes →
        </a>
      </div>
    </div>
  );
}
