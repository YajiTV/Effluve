import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import ProductGrid from "@/components/product/ProductGrid";
import SearchFilters from "@/components/search/SearchFilters";
import { searchProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

function cleanQuery(value?: string | null) {
  return String(value ?? "")
    .replace(/[<>{}]/g, "")
    .trim()
    .slice(0, 80);
}

function clampPrice(value?: string | null): number | undefined {
  if (!value || value.trim() === "") return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.round(n * 100);
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const query = cleanQuery(q);
  return { title: query ? `Résultats pour "${query}"` : "Recherche" };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const query = cleanQuery(sp.q);
  const category = ["homme", "femme", "accessoires"].includes(sp.category ?? "")
    ? (sp.category as "homme" | "femme" | "accessoires")
    : undefined;
  const sort = ["newest", "price_asc", "price_desc"].includes(sp.sort ?? "")
    ? (sp.sort as "newest" | "price_asc" | "price_desc")
    : "newest";

  const products = await searchProducts({
    query,
    category,
    minPriceCents: clampPrice(sp.minPrice),
    maxPriceCents: clampPrice(sp.maxPrice),
    size: sp.size || undefined,
    sort,
    limit: 96,
  });

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-[0.22em] text-neutral-500 uppercase">
            Recherche
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
            {query ? `Résultats pour "${query}"` : "Rechercher un produit"}
          </h1>
        </div>

        <Suspense>
          <SearchFilters total={products.length} />
        </Suspense>

        <ProductGrid
          products={products}
          showCategory
          showLink
          emptyState={
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="font-semibold text-neutral-900">Aucun résultat.</p>
              <p className="mt-1 text-neutral-600">
                Essaie un autre mot-clé, ou modifie les filtres.
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
