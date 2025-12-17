// app/cart/page.tsx
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { pool } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

export const dynamic = "force-dynamic";

type CartRow = RowDataPacket & {
  cart_item_id: number;
  quantity: number;
  product_id: number;
  name: string;
  price_cents: number;
  image_url: string | null;
};

function eurFromCents(cents: number) {
  return (Number(cents) / 100).toFixed(2);
}

function GuestGate() {
  return (
    <main className="min-h-[70vh] bg-linear-to-b from-neutral-50 to-white px-4 py-14">
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
              href="/login?next=/cart"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white hover:bg-black transition"
            >
              Se connecter
            </Link>
            <Link
              href="/register"
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

  // ⚠️ Hypothèse: cart_items(id, user_id, product_id, quantity) + products(id, name, price_cents, image_url)
  const [rows] = await pool.query<CartRow[]>(
    `
    SELECT
      ci.id AS cart_item_id,
      ci.quantity,
      p.id AS product_id,
      p.name,
      p.price_cents,
      p.image_url
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = ?
    ORDER BY ci.id DESC
    `,
    [user.id]
  );

  const totalCents = rows.reduce(
    (sum, r) => sum + Number(r.price_cents) * Number(r.quantity),
    0
  );

  return (
    <main className="min-h-[70vh] bg-linear-to-b from-neutral-50 to-white px-4 py-14">
      <section className="mx-auto w-full max-w-5xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-neutral-500 uppercase">
              Panier
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
              Mon panier
            </h1>
            <p className="mt-2 text-neutral-600">
              Connecté en tant que{" "}
              <span className="font-semibold text-neutral-900">{user.full_name}</span>
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 shadow-sm">
            <span className="text-sm text-neutral-600">Total</span>
            <span className="text-sm font-semibold text-neutral-900">
              {eurFromCents(totalCents)} €
            </span>
          </div>
        </header>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
          {/* Liste */}
          <div className="space-y-3">
            {rows.length === 0 ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <p className="text-neutral-900 font-medium">Ton panier est vide.</p>
                <p className="mt-1 text-neutral-600">
                  Ajoute un article depuis la collection pour le retrouver ici.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/collection"
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white hover:bg-black transition"
                  >
                    Découvrir la collection
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-900 hover:border-neutral-400 transition"
                  >
                    Retour accueil
                  </Link>
                </div>
              </div>
            ) : (
              rows.map((item) => {
                const unit = eurFromCents(item.price_cents);
                const subtotal = eurFromCents(item.price_cents * item.quantity);

                return (
                  <article
                    key={item.cart_item_id}
                    className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr]">
                      <div className="bg-neutral-100">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="h-40 w-full object-cover sm:h-full"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-40 items-center justify-center text-sm text-neutral-500 sm:h-full">
                            Pas d’image
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="text-base font-semibold text-neutral-900">
                              {item.name}
                            </h3>
                            <p className="mt-1 text-sm text-neutral-600">
                              Prix: <span className="font-semibold text-neutral-900">{unit} €</span>{" "}
                              • Quantité:{" "}
                              <span className="font-semibold text-neutral-900">{item.quantity}</span>
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="text-lg font-semibold text-neutral-900">
                              {subtotal} €
                            </div>
                            <div className="text-xs text-neutral-500">Sous-total</div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {/* TODO: brancher sur tes routes /api/cart (update qty / delete) */}
                          <button
                            disabled
                            className="h-9 w-10 rounded-xl border border-neutral-300 bg-white text-neutral-900 opacity-60"
                          >
                            −
                          </button>
                          <button
                            disabled
                            className="h-9 w-10 rounded-xl border border-neutral-300 bg-white text-neutral-900 opacity-60"
                          >
                            +
                          </button>
                          <button
                            disabled
                            className="ml-auto text-sm font-semibold text-neutral-900 underline opacity-60"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* Récap */}
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-neutral-900">Récapitulatif</h2>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Sous-total</span>
                  <span className="font-semibold text-neutral-900">
                    {eurFromCents(totalCents)} €
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Livraison</span>
                  <span className="text-neutral-500">—</span>
                </div>
              </div>

              <div className="my-4 h-px w-full bg-neutral-200" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-900">Total</span>
                <span className="text-lg font-semibold text-neutral-900">
                  {eurFromCents(totalCents)} €
                </span>
              </div>

              <button
                disabled
                className="mt-4 h-11 w-full rounded-xl bg-neutral-900 text-sm font-semibold text-white opacity-60"
              >
                Passer au paiement
              </button>

            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
