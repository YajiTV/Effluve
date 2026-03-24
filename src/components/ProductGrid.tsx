import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/products";

type ProductGridProps = {
  products: Product[];
  emptyState: React.ReactNode;
  showCategory?: boolean;
  showActions?: boolean;
  showLink?: boolean;
};

export default function ProductGrid({
  products,
  emptyState,
  showCategory = false,
  showActions = false,
  showLink = false,
}: ProductGridProps) {
  if (products.length === 0) return <>{emptyState}</>;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => {
        const linkTo = showLink ? `/${product.category}/${product.id}` : undefined;
        return (
          <ProductCard
            key={product.id}
            product={product}
            showCategory={showCategory}
            showActions={showActions}
            linkTo={linkTo}
          />
        );
      })}
    </div>
  );
}
