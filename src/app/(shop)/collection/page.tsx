import Link from "next/link";
import ProductGrid from "@/components/product/ProductGrid";
import { getProductsByCategories } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function CollectionPage() {
  const products = await getProductsByCategories(["femme", "homme"]);

  return (
    <main className="bg-white">
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
              href="/women"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-900 hover:border-neutral-400 transition"
            >
              Voir Femme
            </Link>
            <Link
              href="/men"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-900 hover:border-neutral-400 transition"
            >
              Voir Homme
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <ProductGrid
          products={products}
          showCategory
          showActions
          emptyState={
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="font-semibold text-neutral-900">Aucun produit.</p>
              <p className="mt-1 text-neutral-600">Ajoute des produits actifs dans MySQL.</p>
            </div>
          }
        />
      </section>
    </main>
  );
}
