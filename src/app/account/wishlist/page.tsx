// src/app/account/wishlist/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

import CartToast from "@/components/CartToast";

type WishlistItem = {
  id: number; // id de wishlist_items
  productId: number;
  name: string;
  description: string | null;
  priceCents: number;
  image: string | null;
  category: "homme" | "femme" | "accessoires" | string;
  inStock: boolean;
};

type ToastState =
  | null
  | {
      title: string;
      message: string;
      variant?: "success" | "info" | "danger";
    };

function eurFromCents(cents: number) {
  return (Number(cents) / 100).toFixed(2);
}

export default function WishlistPage() {
  const router = useRouter();

  const [favorites, setFavorites] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  const [addingProductId, setAddingProductId] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/wishlist", { cache: "no-store" });

        if (res.status === 401) {
          setIsGuest(true);
          return;
        }
        if (!res.ok) {
          console.error("Failed to load wishlist");
          return;
        }

        const data = (await res.json()) as WishlistItem[];
        setFavorites(data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const reloadWishlist = async () => {
    const res = await fetch("/api/wishlist", { cache: "no-store" }).catch(() => null);
    if (res?.ok) setFavorites((await res.json()) as WishlistItem[]);
  };

  const removeFavorite = async (id: number) => {
    // Optimiste
    const prev = favorites;
    setFavorites((p) => p.filter((item) => item.id !== id));

    const res = await fetch(`/api/wishlist/${id}`, { method: "DELETE" }).catch(() => null);

    if (!res) {
      setFavorites(prev);
      setToast({ title: "Erreur", message: "Suppression impossible (réseau).", variant: "danger" });
      return;
    }

    if (res.status === 401) {
      router.push("/login?next=/account/wishlist");
      return;
    }

    if (!res.ok) {
      setFavorites(prev);
      setToast({ title: "Erreur", message: "Suppression impossible.", variant: "danger" });
      await reloadWishlist();
      return;
    }

    setToast({ title: "Retiré des favoris", message: "Article supprimé.", variant: "info" });
  };

  const addToCart = async (product: WishlistItem) => {
    if (!product.inStock) return;

    try {
      setAddingProductId(product.productId);

      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.productId }),
      });

      if (res.status === 401) {
        router.push("/login?next=/account/wishlist");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setToast({
          title: "Erreur",
          message: data?.message ?? "Impossible d'ajouter au panier.",
          variant: "danger",
        });
        return;
      }

      setToast({ title: "Ajouté au panier", message: product.name, variant: "success" });
      router.refresh();
    } catch {
      setToast({ title: "Erreur", message: "Erreur réseau.", variant: "danger" });
    } finally {
      setAddingProductId(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-angora-white px-4 py-12 sm:px-6 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <h1 className="font-title text-4xl text-angora-black">Mes Favoris</h1>
            <p className="font-body text-angora-nero80 text-sm mt-2">
              Chargement de votre liste de souhaits…
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (isGuest) {
    return (
      <main className="min-h-screen bg-angora-white px-4 py-12 sm:px-6 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8">
            <h1 className="font-title text-4xl md:text-5xl text-angora-black mb-3">
              Mes Favoris
            </h1>
            <p className="font-body text-angora-nero">
              Connecte-toi ou crée un compte pour sauvegarder tes articles préférés.
            </p>
          </div>

          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-angora-vanilla/20">
            <Heart className="h-12 w-12 text-angora-vanilla" strokeWidth={1} />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/login?next=/account/wishlist"
              className="inline-flex items-center gap-2 px-8 py-3 bg-angora-black text-angora-white hover:bg-angora-vanilla hover:text-angora-nero transition-colors font-body text-xs uppercase tracking-[0.2em]"
            >
              Se connecter
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3 border border-angora-black text-angora-black hover:bg-angora-black hover:text-angora-white transition-colors font-body text-xs uppercase tracking-[0.2em]"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-angora-white px-4 py-12 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-title text-4xl md:text-5xl text-angora-black mb-1">
              Mes Favoris
            </h1>
            <p className="font-body text-angora-nero">
              {favorites.length} {favorites.length > 1 ? "articles" : "article"}
            </p>
          </div>

          <Link
            href="/cart"
            className="inline-flex items-center gap-2 rounded-full border border-angora-black px-4 py-2 text-xs font-body uppercase tracking-[0.18em] text-angora-black hover:bg-angora-black hover:text-angora-white transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            Voir le panier
          </Link>
        </div>

        {favorites.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-angora-vanilla/20">
              <Heart className="h-12 w-12 text-angora-vanilla" strokeWidth={1} />
            </div>

            <h2 className="mb-4 font-title text-2xl text-angora-black">
              Votre liste de favoris est vide
            </h2>
            <p className="mb-8 font-body text-lg text-angora-nero">
              Ajoutez des articles en cliquant sur le cœur ❤️
            </p>

            <Link
              href="/homme"
              className="inline-flex items-center gap-2 px-8 py-4 bg-angora-black text-angora-white hover:bg-angora-vanilla hover:text-angora-nero transition-colors font-body text-xs uppercase tracking-[0.2em]"
            >
              Découvrir la collection
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {favorites.map((item) => (
                <div
                  key={item.id}
                  className="group border border-gray-200 bg-white transition-colors hover:border-angora-vanilla"
                >
                  <Link href={`/${String(item.category).toLowerCase()}/${item.productId}`}>
                    <div className="relative overflow-hidden bg-neutral-100 aspect-[3/4]">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center px-4 text-center font-body text-xs uppercase tracking-wider text-neutral-400">
                          {item.name}
                        </div>
                      )}

                      {!item.inStock && (
                        <div className="absolute left-3 top-3 bg-red-600 px-3 py-1 text-[9px] font-body uppercase tracking-wider text-white">
                          Rupture de stock
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-6">
                    <p className="mb-2 font-body text-xs uppercase tracking-wider text-angora-nero/60">
                      {item.category}
                    </p>

                    <h3 className="mb-2 font-body text-base text-angora-black transition-colors group-hover:text-angora-vanilla">
                      <Link href={`/${String(item.category).toLowerCase()}/${item.productId}`}>
                        {item.name}
                      </Link>
                    </h3>

                    {item.description ? (
                      <p className="mb-3 line-clamp-2 font-body text-xs text-angora-nero/70">
                        {item.description}
                      </p>
                    ) : null}

                    <p className="mb-4 font-title text-xl text-angora-black">
                      {eurFromCents(item.priceCents)} €
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCart(item)}
                        disabled={!item.inStock || addingProductId === item.productId}
                        className="flex-1 py-3 font-body text-xs uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 bg-angora-black text-angora-white hover:bg-angora-vanilla hover:text-angora-nero"
                      >
                        {addingProductId === item.productId
                          ? "Ajout…"
                          : item.inStock
                            ? "Ajouter au panier"
                            : "Indisponible"}
                      </button>

                      <button
                        onClick={() => removeFavorite(item.id)}
                        className="groupdelete flex h-12 w-12 items-center justify-center border border-gray-300 transition-colors hover:border-red-600 hover:bg-red-50"
                        title="Retirer des favoris"
                      >
                        <Trash2
                          className="h-5 w-5 text-angora-nero group-hoverdelete:text-red-600"
                          strokeWidth={1.5}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Toast unique (même animation, même composant) */}
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
