"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

import CartToast from "@/components/ui/CartToast";

type ToastState =
  | null
  | {
      title: string;
      message: string;
      variant?: "success" | "info" | "danger";
    };

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Une erreur est survenue";
}

function bumpCounts() {
  window.dispatchEvent(new Event("effluve:counts"));
}

export default function ProductActions({
  productId,
  inStock,
  sizes,
  linkTo,
}: {
  productId: number;
  inStock: boolean;
  sizes?: string | null;
  linkTo?: string;
}) {
  const router = useRouter();

  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingWish, setLoadingWish] = useState(false);

  // Optionnel: permet d'afficher un coeur "rempli" après interaction
  const [wished, setWished] = useState<boolean | null>(null);

  // Toast unique (même style que Wishlist)
  const [toastState, setToastState] = useState<ToastState>(null);

  const hasSizes = Boolean(sizes?.trim());

  const addToCart = async () => {
    if (!inStock || loadingCart) return;

    // Si le produit a des tailles, on redirige vers la page produit pour choisir
    if (hasSizes) {
      router.push(linkTo ?? `/produits/${productId}`);
      return;
    }

    setLoadingCart(true);
    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (res.status === 401) {
        setToastState({
          title: "Connexion requise",
          message: "Connecte-toi pour ajouter au panier.",
          variant: "danger",
        });
        router.push("/connexion?next=/homme");
        return;
      }

      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string; message?: string }
        | null;

      if (!res.ok) throw new Error(data?.message ?? data?.error ?? "Impossible d'ajouter au panier.");

      setToastState({ title: "Ajouté au panier", message: "Article ajouté.", variant: "success" });
      bumpCounts();
      router.refresh();
    } catch (err: unknown) {
      setToastState({ title: "Erreur", message: errorMessage(err), variant: "danger" });
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
        body: JSON.stringify({ productId }),
      });

      if (res.status === 401) {
        setToastState({
          title: "Connexion requise",
          message: "Connecte-toi pour gérer tes favoris.",
          variant: "danger",
        });
        router.push("/connexion?next=/homme");
        return;
      }

      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; wished?: boolean; error?: string; message?: string }
        | null;

      if (!res.ok) throw new Error(data?.message ?? data?.error ?? "Impossible de modifier les favoris.");

      const isWished = Boolean(data?.wished);
      setWished(isWished);

      setToastState(
        isWished
          ? { title: "Ajouté aux favoris", message: "Article sauvegardé.", variant: "success" }
          : { title: "Retiré des favoris", message: "Article supprimé.", variant: "danger" }
      );

      bumpCounts();
      router.refresh();
    } catch (err: unknown) {
      setToastState({ title: "Erreur", message: errorMessage(err), variant: "danger" });
    } finally {
      setLoadingWish(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={addToCart}
          disabled={!inStock || loadingCart}
          className="h-10 rounded-xl bg-effluve-black px-4 text-xs font-body uppercase tracking-[0.18em] text-effluve-white
                     hover:bg-effluve-vanilla hover:text-effluve-nero transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingCart ? "Ajout…" : !inStock ? "Indispo" : hasSizes ? "Choisir" : "Ajouter"}
        </button>

        <button
          onClick={toggleWish}
          disabled={loadingWish}
          className="h-10 w-12 rounded-xl border border-effluve-black bg-effluve-white text-effluve-black
                     hover:bg-effluve-black hover:text-effluve-white transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          title="Favoris"
          aria-label="Favoris"
        >
          <Heart
            className="h-5 w-5"
            strokeWidth={1.5}
            // coeur rempli si wished === true (après la 1ère action)
            fill={wished ? "currentColor" : "none"}
          />
        </button>
      </div>

      {toastState && (
        <CartToast
          title={toastState.title}
          message={toastState.message}
          variant={toastState.variant}
          onClose={() => setToastState(null)}
        />
      )}
    </>
  );
}
