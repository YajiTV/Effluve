import { redirect } from "next/navigation";
import CheckoutClient from "@/components/checkout/CheckoutClient";
import { getSessionUser } from "@/lib/auth";
import { getUserAddresses } from "@/lib/addresses";
import { getCartItemsByUserId } from "@/lib/cart";
import { getPendingOrdersByUserId } from "@/lib/orders";
import { getLoyaltyPoints } from "@/lib/loyalty";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/checkout");

  const [addresses, cartItems, pendingOrders, loyaltyPoints] = await Promise.all([
    getUserAddresses(user.id),
    getCartItemsByUserId(user.id),
    getPendingOrdersByUserId(user.id),
    getLoyaltyPoints(user.id),
  ]);

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-[0.22em] text-neutral-500 uppercase">Commande</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
            Validation et paiement
          </h1>
          <p className="mt-2 text-neutral-600">
            Vérifie ton panier, choisis ton adresse et finalise ton paiement.
          </p>
        </div>

        <CheckoutClient addresses={addresses} cartItems={cartItems} pendingOrders={pendingOrders} loyaltyPoints={loyaltyPoints} />
      </div>
    </main>
  );
}
