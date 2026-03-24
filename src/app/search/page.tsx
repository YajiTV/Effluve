import Link from "next/link";
import type { Metadata } from "next";
import ProductGrid from "@/components/ProductGrid";
import { searchProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

function cleanQuery(value?: string) {
  return String(value ?? "")
    .replace(/[<>{}]/g, "")
    .trim()
    .slice(0, 80);
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const query = cleanQuery(q);
  return {
    title: query ? `Résultats pour "${query}"` : "Recherche",
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = cleanQuery(q);

  const products = await searchProducts(query, 48);

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

        <ProductGrid
          products={products}
          showCategory
          showLink
          emptyState={
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
          }
        />
      </section>
    </main>
  );
}
