"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const CATEGORIES = [
  { value: "", label: "Toutes" },
  { value: "femme", label: "Femme" },
  { value: "homme", label: "Homme" },
  { value: "accessoires", label: "Accessoires" },
];

const SORTS = [
  { value: "newest", label: "Plus récents" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function SearchFilters({ total }: { total: number }) {
  const router = useRouter();
  const params = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      router.push(`/recherche?${next.toString()}`);
    },
    [router, params]
  );

  const category = params.get("category") ?? "";
  const sort = params.get("sort") ?? "newest";
  const size = params.get("size") ?? "";
  const minPrice = params.get("minPrice") ?? "";
  const maxPrice = params.get("maxPrice") ?? "";

  const hasFilters = category || size || minPrice || maxPrice || sort !== "newest";

  function reset() {
    const next = new URLSearchParams();
    const q = params.get("q");
    if (q) next.set("q", q);
    router.push(`/recherche?${next.toString()}`);
  }

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        {/* Catégorie */}
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-widest text-neutral-400">Catégorie</label>
          <select
            value={category}
            onChange={(e) => update("category", e.target.value)}
            className="border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-black"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Taille */}
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-widest text-neutral-400">Taille</label>
          <select
            value={size}
            onChange={(e) => update("size", e.target.value)}
            className="border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-black"
          >
            <option value="">Toutes</option>
            {SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Prix min */}
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-widest text-neutral-400">Prix min (€)</label>
          <input
            type="number"
            min={0}
            value={minPrice}
            placeholder="0"
            onChange={(e) => update("minPrice", e.target.value)}
            className="w-24 border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
          />
        </div>

        {/* Prix max */}
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-widest text-neutral-400">Prix max (€)</label>
          <input
            type="number"
            min={0}
            value={maxPrice}
            placeholder="∞"
            onChange={(e) => update("maxPrice", e.target.value)}
            className="w-24 border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
          />
        </div>

        {/* Tri */}
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-widest text-neutral-400">Trier par</label>
          <select
            value={sort}
            onChange={(e) => update("sort", e.target.value)}
            className="border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-black"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <button
            onClick={reset}
            className="px-4 py-2 text-xs uppercase tracking-widest border border-neutral-300 text-neutral-500 hover:border-black hover:text-black transition-colors"
          >
            Réinitialiser
          </button>
        )}
      </div>

      <p className="text-sm text-neutral-500">
        {total} résultat{total > 1 ? "s" : ""}
      </p>
    </div>
  );
}
