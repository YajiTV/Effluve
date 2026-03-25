import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getAllOrdersForAdmin } from "@/lib/admin-orders";
import OrdersTable from "@/components/admin/OrdersTable";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin/orders");
  if (user.role !== "admin") redirect("/account");

  const orders = await getAllOrdersForAdmin();

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="font-title text-4xl text-black">Gestion des commandes</h1>
          <p className="mt-2 text-sm text-neutral-500">
            {orders.length} commande{orders.length > 1 ? "s" : ""} au total
          </p>
        </div>

        <div className="bg-white border border-neutral-200 p-6">
          <OrdersTable initialOrders={orders} />
        </div>
      </div>
    </main>
  );
}
