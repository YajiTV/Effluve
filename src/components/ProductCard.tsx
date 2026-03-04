import Link from "next/link";
import ProductActions from "@/app/homme/ProductActions";
import type { Product } from "@/lib/products";
import { eurFromCents } from "@/lib/money";

type ProductCardProps = {
  product: Product;
  showCategory?: boolean;
  showActions?: boolean;
  linkTo?: string;
};

export default function ProductCard({
  product,
  showCategory = false,
  showActions = false,
  linkTo,
}: ProductCardProps) {
  const image = product.imageUrl ? (
    <img
      src={product.imageUrl}
      alt={product.name}
      className="h-full w-full object-cover"
      loading="lazy"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">
      Pas d’image
    </div>
  );

  const imageBlock = linkTo ? <Link href={linkTo}>{image}</Link> : image;

  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition">
      <div className="aspect-[4/5] w-full bg-neutral-100">{imageBlock}</div>

      <div className="p-4">
        {showCategory ? (
          <p className="text-xs font-semibold tracking-[0.22em] text-neutral-500 uppercase">
            {product.category}
          </p>
        ) : null}

        <h2 className="mt-2 text-base font-semibold text-neutral-900">
          {product.name}
        </h2>

        <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
          {product.description ?? "—"}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-neutral-900">
            {eurFromCents(product.priceCents)} €
          </p>

          {showActions ? (
            <ProductActions productId={product.id} inStock={Boolean(product.isActive)} />
          ) : linkTo ? (
            <Link
              href={linkTo}
              className="text-sm font-semibold text-neutral-900 underline underline-offset-4 hover:text-neutral-700"
            >
              Voir
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
