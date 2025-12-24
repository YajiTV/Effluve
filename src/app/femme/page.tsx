// src/app/femme/page.tsx
import Link from "next/link";
import Image from "next/image";
import { pool } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";
import ProductActions from "../homme/ProductActions";

export const dynamic = "force-dynamic";

type ProductRow = RowDataPacket & {
  id: number;
  name: string;
  description: string | null;
  price_cents: number;
  image_url: string | null;
  category: "homme" | "femme" | "accessoires";
  is_active: 0 | 1;
};

function eurFromCents(cents: number) {
  return (Number(cents) / 100).toFixed(2);
}

export default async function FemmePage() {
  const [products] = await pool.query<ProductRow[]>(
  `
  SELECT
    id,
    name,
    description,
    pricecents AS price_cents,
    imageurl   AS image_url,
    category,
    isactive   AS is_active
  FROM products
  WHERE category = 'homme' AND isactive = 1
  ORDER BY id DESC
  `
);

  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-200">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-linear-to-b from-neutral-200/60 to-transparent blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-14">
          <p className="text-xs font-semibold tracking-[0.22em] text-neutral-500 uppercase">
            Collection
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Femme
          </h1>
          <p className="mt-3 max-w-2xl text-neutral-600">
            Silhouettes élégantes, matières premium et finitions nettes.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/collection"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white hover:bg-black transition"
            >
              Voir toute la collection
            </Link>

            <Link
              href="/cart"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-900 hover:border-neutral-400 transition"
            >
              Mon panier
            </Link>

            <Link
              href="/wishlist"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-900 hover:border-neutral-400 transition"
            >
              Mes favoris
            </Link>
          </div>
        </div>
      </section>

      {/* Grid produits */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        {products.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="font-semibold text-neutral-900">
              Aucun produit femme pour le moment.
            </p>
            <p className="mt-1 text-neutral-600">
              Ajoute un produit dans la table{" "}
              <code className="font-mono">products</code> avec{" "}
              <code className="font-mono">category=&apos;femme&apos;</code>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <article
                key={p.id}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition"
              >
                <div className="aspect-4/5 w-full bg-neutral-100">
                  {p.image_url ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={p.image_url}
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">
                      Pas d’image
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h2 className="text-base font-semibold text-neutral-900">{p.name}</h2>

                  {p.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
                      {p.description}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-neutral-500">—</p>
                  )}

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-neutral-900">
                      {eurFromCents(p.price_cents)} €
                    </p>

                    <ProductActions productId={p.id} inStock={Boolean(p.is_active)} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
