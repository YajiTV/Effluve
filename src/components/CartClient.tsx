"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type CartItem = {
  cartitemid: number;
  quantity: number;
  productid: number;
  name: string;
  pricecents: number;
  imageurl: string | null;
};

function eurFromCents(cents: number) {
  return (Number(cents) / 100).toFixed(2);
}

async function reloadCart(): Promise<CartItem[]> {
  const res = await fetch("/api/cart", { cache: "no-store" });
  if (!res.ok) return [];
  return (await res.json()) as CartItem[];
}

export default function CartClient({
  initialItems,
  userFullName,
}: {
  initialItems: CartItem[];
  userFullName: string;
}) {
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [busyCartItemId, setBusyCartItemId] = useState<number | null>(null);

  const totalCents = useMemo(
    () => items.reduce((sum, r) => sum + Number(r.pricecents) * Number(r.quantity), 0),
    [items]
  );

  const addOne = async (productId: number) => {
    await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setItems(await reloadCart());
  };

  const setQty = async (cartItemId: number, quantity: number) => {
    await fetch("/api/cart/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartItemId, quantity }),
    });
    setItems(await reloadCart());
  };

  const removeItem = async (cartItemId: number) => {
    await fetch("/api/cart/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartItemId }),
    });
    setItems(await reloadCart());
  };

  return (
    <main className="min-h-[70vh] bg-gradient-to-b from-neutral-50 to-white px-4 py-14">
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
              <span className="font-semibold text-neutral-900">{userFullName}</span>
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
          <div className="space-y-3">
            {items.length === 0 ? (
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
                </div>
              </div>
            ) : (
              items.map((item) => {
                const unit = eurFromCents(item.pricecents);
                const subtotal = eurFromCents(item.pricecents * item.quantity);
                const busy = busyCartItemId === item.cartitemid;

                return (
                  <article
                    key={item.cartitemid}
                    className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr]">
                      <div className="bg-neutral-100">
                        {item.imageurl ? (
                          <img
                            src={item.imageurl}
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
                            <h3 className="text-base font-semibold text-neutral-900">{item.name}</h3>
                            <p className="mt-1 text-sm text-neutral-600">
                              Prix: <span className="font-semibold text-neutral-900">{unit} €</span>{" "}
                              • Quantité:{" "}
                              <span className="font-semibold text-neutral-900">{item.quantity}</span>
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="text-lg font-semibold text-neutral-900">{subtotal} €</div>
                            <div className="text-xs text-neutral-500">Sous-total</div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <button
                            onClick={async () => {
                              setBusyCartItemId(item.cartitemid);
                              try {
                                if (item.quantity <= 1) await removeItem(item.cartitemid);
                                else await setQty(item.cartitemid, item.quantity - 1);
                              } finally {
                                setBusyCartItemId(null);
                              }
                            }}
                            disabled={busy}
                            className="h-9 w-10 rounded-xl border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50 disabled:opacity-60"
                          >
                            −
                          </button>

                          <button
                            onClick={async () => {
                              setBusyCartItemId(item.cartitemid);
                              try {
                                await addOne(item.productid);
                              } finally {
                                setBusyCartItemId(null);
                              }
                            }}
                            disabled={busy}
                            className="h-9 w-10 rounded-xl border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50 disabled:opacity-60"
                          >
                            +
                          </button>

                          <button
                            onClick={async () => {
                              setBusyCartItemId(item.cartitemid);
                              try {
                                await removeItem(item.cartitemid);
                              } finally {
                                setBusyCartItemId(null);
                              }
                            }}
                            disabled={busy}
                            className="ml-auto text-sm font-semibold text-neutral-900 underline hover:opacity-80 disabled:opacity-60"
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

          <aside className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-neutral-900">Récapitulatif</h2>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Sous-total</span>
                  <span className="font-semibold text-neutral-900">{eurFromCents(totalCents)} €</span>
                </div>
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Livraison</span>
                  <span className="text-neutral-500">—</span>
                </div>
              </div>

              <div className="my-4 h-px w-full bg-neutral-200" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-900">Total</span>
                <span className="text-lg font-semibold text-neutral-900">{eurFromCents(totalCents)} €</span>
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
