import Link from "next/link";
import Image from "next/image";
import ProductActions from "@/components/product/ProductActions";
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
    <Image
      src={product.imageUrl}
      alt={product.name}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      className="object-cover transition-transform duration-500 group-hover:scale-105"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400 font-body">
      Pas d&apos;image
    </div>
  );

  const imageBlock = linkTo ? <Link href={linkTo}>{image}</Link> : image;

  return (
    <article className="group overflow-hidden border border-neutral-200 bg-effluve-white hover:border-effluve-nero transition-colors duration-300">
      <div className="relative aspect-[4/5] w-full bg-neutral-100 overflow-hidden">
        {imageBlock}
      </div>

      <div className="p-4 border-t border-neutral-200">
        {showCategory && (
          <p className="font-body text-[10px] uppercase tracking-[0.25em] text-effluve-vanilla mb-2">
            {product.category}
          </p>
        )}

        <h2 className="font-body text-sm font-medium text-effluve-black">
          {linkTo ? (
            <Link href={linkTo} className="hover:text-effluve-nero transition-colors">
              {product.name}
            </Link>
          ) : (
            product.name
          )}
        </h2>

        {product.description && (
          <p className="font-body mt-1 line-clamp-1 text-xs text-neutral-500">
            {product.description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <p className="font-body text-sm text-effluve-black">
            {eurFromCents(product.priceCents)} €
          </p>

          {showActions ? (
            <ProductActions
              productId={product.id}
              inStock={Boolean(product.isActive)}
              sizes={product.sizes}
              linkTo={linkTo}
            />
          ) : linkTo ? (
            <Link
              href={linkTo}
              className="font-body text-xs uppercase tracking-[0.15em] text-effluve-nero underline underline-offset-4 hover:text-effluve-black transition-colors"
            >
              Voir
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
