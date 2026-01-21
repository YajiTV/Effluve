// src/app/collection/page.tsx
import Link from "next/link";
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

function ProductGrid({ products }: { products: ProductRow[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="font-semibold text-neutral-900">Aucun produit.</p>
        <p className="mt-1 text-neutral-600">
          Ajoute des lignes dans la table{" "}
          <code className="font-mono">products</code> avec{" "}
          <code className="font-mono">category</code> et{" "}
          <code className="font-mono">isactive = 1</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <article
          key={p.id}
          className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition"
        >
          <div className="aspect-[4/5] w-full bg-neutral-100">
            {p.image_url ? (
              <img
                src={p.image_url}
                alt={p.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">
                Pas d’image
              </div>
            )}
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-neutral-900">
                  {p.name}
                </h2>
                <p className="mt-1 text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                  {p.category}
                </p>
              </div>

              <p className="text-sm font-semibold text-neutral-900 whitespace-nowrap">
                {eurFromCents(p.price_cents)} €
              </p>
            </div>

            {p.description ? (
              <p className="mt-2 line-clamp-2 text-sm text-neutral-600">
                {p.description}
              </p>
            ) : (
              <p className="mt-2 text-sm text-neutral-500">—</p>
            )}

            <div className="mt-4 flex items-center justify-end">
              <ProductActions productId={p.id} inStock={Boolean(p.is_active)} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default async function CollectionPage() {
  const [rows] = await pool.query<ProductRow[]>(
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
    WHERE category IN ('homme','femme') AND isactive = 1
    ORDER BY category ASC, id DESC
    `
  );

  const femme = rows.filter((p) => p.category === "femme");
  const homme = rows.filter((p) => p.category === "homme");

  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-200">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-b from-neutral-200/60 to-transparent blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-14">
          <p className="text-xs font-semibold tracking-[0.22em] text-neutral-500 uppercase">
            Collection
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Tous les articles
          </h1>
          <p className="mt-3 max-w-2xl text-neutral-600">
            Femme + Homme, au même endroit.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/femme"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-900 hover:border-neutral-400 transition"
            >
              Voir Femme
            </Link>
            <Link
              href="/homme"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-900 hover:border-neutral-400 transition"
            >
              Voir Homme
            </Link>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-xl font-semibold text-neutral-900">Femme</h2>
        <div className="mt-6">
          <ProductGrid products={femme} />
        </div>

        <div className="mt-14">
          <h2 className="text-xl font-semibold text-neutral-900">Homme</h2>
          <div className="mt-6">
            <ProductGrid products={homme} />
          </div>
        </div>
      </section>
    </main>
  );
}
