import { notFound } from "next/navigation";
import { getProductById, getSuggestedProducts } from "@/lib/products";
import ProductDetail from "@/components/product/ProductDetail";
import ProductGrid from "@/components/product/ProductGrid";

type Props = { params: Promise<{ id: string }> };

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(Number(id));

  if (!product) notFound();

  const suggestedProducts = await getSuggestedProducts(product.id, product.category);

  return (
    <>
      <ProductDetail product={product} />
      {suggestedProducts.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 mt-16 border-t border-neutral-200 pt-12 pb-16">
          <h2 className="font-title text-2xl text-black mb-8">Vous aimerez aussi</h2>
          <ProductGrid
            products={suggestedProducts}
            emptyState={null}
            showLink
            showActions
          />
        </section>
      )}
    </>
  );
}
