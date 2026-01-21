import Link from "next/link";
import { pool } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

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

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const like = `%${query}%`;

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
    WHERE isactive = 1
      AND (
        ? = '' OR
        name LIKE ? OR
        description LIKE ?
      )
    ORDER BY id DESC
    LIMIT 48
    `,
    [query, like, like]
  );

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-[0.22em] text-neutral-500 uppercase">
            Recherche
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
            {query ? `Résultats pour “${query}”` : "Rechercher un produit"}
          </h1>
          <p className="mt-2 text-neutral-600">
            {products.length} résultat{products.length > 1 ? "s" : ""}.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="font-semibold text-neutral-900">Aucun résultat.</p>
            <p className="mt-1 text-neutral-600">
              Essaie un autre mot-clé ou explore la collection.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/collection"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white hover:bg-black transition"
              >
                Voir la collection
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <article
                key={p.id}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition"
              >
                <Link href={`/${p.category}/${p.id}`}>
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
                </Link>

                <div className="p-4">
                  <p className="text-xs font-semibold tracking-[0.22em] text-neutral-500 uppercase">
                    {p.category}
                  </p>
                  <h2 className="mt-2 text-base font-semibold text-neutral-900">
                    {p.name}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
                    {p.description ?? "—"}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm font-semibold text-neutral-900">
                      {eurFromCents(p.price_cents)} €
                    </p>
                    <Link
                      href={`/${p.category}/${p.id}`}
                      className="text-sm font-semibold text-neutral-900 underline underline-offset-4 hover:text-neutral-700"
                    >
                      Voir
                    </Link>
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
