"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, ArrowLeft } from "lucide-react";
import Link from "next/link";

import type { Product } from "@/lib/products";
import { eurFromCents } from "@/lib/money";
import CartToast from "@/components/ui/CartToast";

type ToastState = { title: string; message: string; variant?: "success" | "info" | "danger" } | null;

function bumpCounts() {
  window.dispatchEvent(new Event("effluve:counts"));
}

export default function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const sizes = product.sizes ? product.sizes.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingWish, setLoadingWish] = useState(false);
  const [wished, setWished] = useState<boolean | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const backHref = product.category === "homme" ? "/homme" : product.category === "femme" ? "/femme" : "/collection";

  const addToCart = async () => {
    if (!product.stock) return;
    if (sizes.length > 0 && !selectedSize) {
      setToast({ title: "Taille requise", message: "Veuillez sélectionner une taille.", variant: "danger" });
      return;
    }

    setLoadingCart(true);
    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, size: selectedSize || undefined }),
      });

      if (res.status === 401) {
        router.push(`/connexion?next=/produits/${product.id}`);
        return;
      }

      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; message?: string } | null;
      if (!res.ok) {
        setToast({ title: "Erreur", message: data?.message ?? "Impossible d'ajouter au panier.", variant: "danger" });
        return;
      }

      setToast({ title: "Ajouté au panier", message: `${product.name}${selectedSize ? ` — taille ${selectedSize}` : ""}`, variant: "success" });
      bumpCounts();
      router.refresh();
    } finally {
      setLoadingCart(false);
    }
  };

  const toggleWish = async () => {
    if (loadingWish) return;
    setLoadingWish(true);
    try {
      const res = await fetch("/api/wishlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });

      if (res.status === 401) {
        router.push(`/connexion?next=/produits/${product.id}`);
        return;
      }

      const data = (await res.json().catch(() => null)) as { wished?: boolean } | null;
      if (!res.ok) {
        setToast({ title: "Erreur", message: "Impossible de modifier les favoris.", variant: "danger" });
        return;
      }

      const isWished = Boolean(data?.wished);
      setWished(isWished);
      setToast(
        isWished
          ? { title: "Ajouté aux favoris", message: product.name, variant: "success" }
          : { title: "Retiré des favoris", message: product.name, variant: "info" }
      );
      bumpCounts();
    } finally {
      setLoadingWish(false);
    }
  };

  return (
    <main className="min-h-screen bg-effluve-white">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 font-body text-xs uppercase tracking-[0.18em] text-effluve-nero/60 hover:text-effluve-nero transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Retour
        </Link>
      </div>

      {/* Product content */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Image */}
          <div className="relative overflow-hidden bg-neutral-100 aspect-[3/4]">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-body text-sm text-neutral-400">
                Pas d&apos;image
              </div>
            )}

            {!product.stock && (
              <div className="absolute left-4 top-4 bg-red-600 px-3 py-1 font-body text-[10px] uppercase tracking-wider text-white">
                Rupture de stock
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="font-body text-xs uppercase tracking-[0.22em] text-effluve-nero/50">
                {product.category}
              </p>
              <h1 className="mt-2 font-title text-3xl text-effluve-black">{product.name}</h1>
              <p className="mt-3 font-title text-2xl text-effluve-black">
                {eurFromCents(product.priceCents)} €
              </p>
            </div>

            {product.description && (
              <p className="font-body text-sm leading-relaxed text-effluve-nero/80">
                {product.description}
              </p>
            )}

            {/* Size selector */}
            {sizes.length > 0 && (
              <div>
                <p className="mb-3 font-body text-xs uppercase tracking-[0.18em] text-effluve-nero">
                  Taille
                  {selectedSize && (
                    <span className="ml-2 font-semibold text-effluve-black">{selectedSize}</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size === selectedSize ? "" : size)}
                      className={[
                        "h-10 min-w-[2.5rem] px-3 border font-body text-sm uppercase tracking-wider transition-colors",
                        selectedSize === size
                          ? "border-effluve-black bg-effluve-black text-effluve-white"
                          : "border-effluve-nero/30 bg-effluve-white text-effluve-nero hover:border-effluve-black",
                      ].join(" ")}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock info */}
            {product.stock > 0 && (
              <p className="font-body text-xs text-effluve-nero/60">
                {product.stock} article{product.stock > 1 ? "s" : ""} disponible{product.stock > 1 ? "s" : ""}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={addToCart}
                disabled={!product.stock || loadingCart}
                className="flex flex-1 items-center justify-center gap-2 py-3.5 font-body text-xs uppercase tracking-[0.18em] transition-colors
                           bg-effluve-black text-effluve-white hover:bg-effluve-vanilla hover:text-effluve-nero
                           disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
              >
                <ShoppingBag className="h-4 w-4" />
                {loadingCart ? "Ajout…" : !product.stock ? "Indisponible" : "Ajouter au panier"}
              </button>

              <button
                onClick={toggleWish}
                disabled={loadingWish}
                className="flex h-12 w-12 items-center justify-center border border-effluve-nero/30 bg-effluve-white text-effluve-nero
                           hover:border-effluve-black hover:bg-effluve-black hover:text-effluve-white transition-colors
                           disabled:opacity-50"
                title="Ajouter aux favoris"
              >
                <Heart
                  className="h-5 w-5"
                  strokeWidth={1.5}
                  fill={wished ? "currentColor" : "none"}
                />
              </button>
            </div>

            {/* Size guide link */}
            <Link
              href="/guide-des-tailles"
              className="font-body text-xs underline underline-offset-2 text-effluve-nero/60 hover:text-effluve-nero transition-colors w-fit"
            >
              Guide des tailles
            </Link>
          </div>
        </div>
      </section>

      {toast && (
        <CartToast
          title={toast.title}
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  );
}
