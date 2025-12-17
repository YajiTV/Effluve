// src/app/homme/ProductActions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Une erreur est survenue";
}

function bumpCounts() {
  window.dispatchEvent(new Event("angora:counts"));
}

export default function ProductActions({
  productId,
  inStock,
}: {
  productId: number;
  inStock: boolean;
}) {
  const router = useRouter();
  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingWish, setLoadingWish] = useState(false);

  const addToCart = async () => {
    setLoadingCart(true);
    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (res.status === 401) {
        toast.error("Connecte-toi pour ajouter au panier.");
        router.push("/login?next=/homme");
        return;
      }

      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string; message?: string }
        | null;

      if (!res.ok) throw new Error(data?.message ?? data?.error ?? "Impossible d'ajouter au panier.");

      toast.success("Ajouté au panier.");
      bumpCounts();
    } catch (err: unknown) {
      toast.error(errorMessage(err));
    } finally {
      setLoadingCart(false);
    }
  };

  const toggleWish = async () => {
    setLoadingWish(true);
    try {
      const res = await fetch("/api/wishlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (res.status === 401) {
        toast.error("Connecte-toi pour ajouter en favoris.");
        router.push("/login?next=/homme");
        return;
      }

      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; wished?: boolean; error?: string; message?: string }
        | null;

      if (!res.ok) throw new Error(data?.message ?? data?.error ?? "Impossible de modifier les favoris.");

      toast.success(data?.wished ? "Ajouté aux favoris." : "Retiré des favoris.");
      bumpCounts();
    } catch (err: unknown) {
      toast.error(errorMessage(err));
    } finally {
      setLoadingWish(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={addToCart}
        disabled={!inStock || loadingCart}
        className="h-10 rounded-xl bg-neutral-900 px-4 text-sm font-semibold text-white hover:bg-black disabled:opacity-50"
      >
        {loadingCart ? "Ajout..." : inStock ? "Ajouter" : "Indispo"}
      </button>

      <button
        onClick={toggleWish}
        disabled={loadingWish}
        className="h-10 w-12 rounded-xl border border-neutral-300 bg-white text-sm font-semibold text-neutral-900 hover:border-neutral-400 disabled:opacity-50"
        title="Favoris"
      >
        {loadingWish ? "…" : "♥"}
      </button>
    </div>
  );
}
