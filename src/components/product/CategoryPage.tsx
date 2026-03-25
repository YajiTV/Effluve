import Link from "next/link";
import ProductGrid from "@/components/product/ProductGrid";
import { getProductsByCategory } from "@/lib/products";

type CategoryPageProps = {
  title: string;
  description: string;
  category: "homme" | "femme";
  emptyTitle: string;
  emptyHint: React.ReactNode;
  glowClassName: string;
};

export default async function CategoryPage({
  title,
  description,
  category,
  emptyTitle,
  emptyHint,
  glowClassName,
}: CategoryPageProps) {
  const products = await getProductsByCategory(category);

  const emptyState = (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <p className="font-semibold text-neutral-900">{emptyTitle}</p>
      <p className="mt-1 text-neutral-600">{emptyHint}</p>
    </div>
  );

  return (
    <main className="bg-white">
      <section className="relative overflow-hidden border-b border-neutral-200">
        <div className="pointer-events-none absolute inset-0">
          <div className={glowClassName} />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-14">
          <p className="text-xs font-semibold tracking-[0.22em] text-neutral-500 uppercase">
            Collection
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-neutral-600">{description}</p>

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
              href="/account/wishlist"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-900 hover:border-neutral-400 transition"
            >
              Mes favoris
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <ProductGrid products={products} emptyState={emptyState} showActions />
      </section>
    </main>
  );
}
