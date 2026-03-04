import { redirect } from "next/navigation";
import AddressManager from "@/components/AddressManager";
import { getSessionUser } from "@/lib/auth";
import { getUserAddresses } from "@/lib/addresses";

export const dynamic = "force-dynamic";

export default async function AddressPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account/address");

  const addresses = await getUserAddresses(user.id);

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-[0.22em] text-neutral-500 uppercase">Compte</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">Mes adresses</h1>
          <p className="mt-2 text-neutral-600">Ajoute et gère tes adresses de livraison et de facturation.</p>
        </div>

        <AddressManager initialAddresses={addresses} />
      </div>
    </main>
  );
}
