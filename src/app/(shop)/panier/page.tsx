import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import CartClient from "@/components/cart/CartClient";
import { getCartItemsByUserId } from "@/lib/cart";

export const dynamic = "force-dynamic";

function GuestGate() {
  return (
    <main className="min-h-[70vh] bg-gradient-to-b from-neutral-50 to-white px-4 py-14">
      <section className="mx-auto w-full max-w-3xl">
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-[0.22em] text-neutral-500 uppercase">
            Panier
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
            Mon panier
          </h1>
          <p className="mt-2 text-neutral-600">
            Tu dois être connecté pour ajouter des articles au panier et accéder à cette page.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-1">
            <p className="text-neutral-900 font-medium">Accès réservé</p>
            <p className="text-neutral-600">
              Connecte-toi ou crée un compte pour voir ton panier.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/connexion?next=/cart"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white hover:bg-black transition"
            >
              Se connecter
            </Link>
            <Link
              href="/inscription"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-900 hover:border-neutral-400 transition"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default async function CartPage() {
  const user = await getSessionUser();
  if (!user) return <GuestGate />;

  const items = await getCartItemsByUserId(user.id);
  return <CartClient initialItems={items} userFullName={user.full_name} />;
}
