"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

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

function eurFromCents(cents: number) {
  return (Number(cents) / 100).toFixed(2);
}

export default function WishlistPage() {
  const [favorites, setFavorites] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

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
        const data: WishlistItem[] = await res.json();
        setFavorites(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const removeFavorite = async (id: number) => {
    // Optimiste
    setFavorites((prev) => prev.filter((item) => item.id !== id));
    await fetch(`/api/wishlist/${id}`, { method: "DELETE" }).catch(() => {
      // En cas d’erreur, tu pourrais recharger la liste via /api/wishlist
    });
  };

  const addToCart = (product: WishlistItem) => {
    // TODO: brancher sur ton endpoint /api/cart
    alert(`🛒 ${product.name} ajouté au panier (simulation)`);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-angora-white px-4 py-12 sm:px-6 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <h1 className="font-title text-4xl text-angora-black">Mes Favoris</h1>
            <p className="font-body text-angora-nero/80 text-sm mt-2">
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
              href="/login?next=/wishlist"
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
        {/* Header */}
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

        {/* Liste vide */}
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
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {favorites.map((item) => (
              <div
                key={item.id}
                className="group border border-gray-200 bg-white transition-colors hover:border-angora-vanilla"
              >
                {/* Image */}
                <Link href={`/${item.category.toLowerCase()}/${item.productId}`}>
                  <div className="relative overflow-hidden bg-neutral-100 aspect-[3/4]">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
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

                {/* Infos */}
                <div className="p-6">
                  <Link href={`/${item.category.toLowerCase()}/${item.productId}`}>
                    <p className="mb-2 font-body text-xs uppercase tracking-wider text-angora-nero/60">
                      {item.category}
                    </p>
                    <h3 className="mb-2 font-body text-base text-angora-black transition-colors group-hover:text-angora-vanilla">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="mb-3 line-clamp-2 font-body text-xs text-angora-nero/70">
                        {item.description}
                      </p>
                    )}
                  </Link>

                  <p className="mb-4 font-title text-xl text-angora-black">
                    {eurFromCents(item.priceCents)} €
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(item)}
                      disabled={!item.inStock}
                      className="flex-1 py-3 font-body text-xs uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 bg-angora-black text-angora-white hover:bg-angora-vanilla hover:text-angora-nero"
                    >
                      {item.inStock ? "Ajouter au panier" : "Indisponible"}
                    </button>

                    <button
                      onClick={() => removeFavorite(item.id)}
                      className="group/delete flex h-12 w-12 items-center justify-center border border-gray-300 transition-colors hover:border-red-600 hover:bg-red-50"
                      title="Retirer des favoris"
                    >
                      <Trash2
                        className="h-5 w-5 text-angora-nero group-hover/delete:text-red-600"
                        strokeWidth={1.5}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Suggestions */}
        {favorites.length > 0 && (
          <div className="mt-16 border-t border-gray-200 pt-12">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-title text-2xl text-angora-black">Vous aimerez aussi</h2>
              <Link
                href="/homme"
                className="font-body text-sm uppercase tracking-wider text-angora-nero transition-colors hover:text-angora-black"
              >
                Voir tout →
              </Link>
            </div>
            <p className="font-body text-angora-nero">
              Continuez votre shopping sur notre collection Homme.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
