"use client";

import { useState } from "react";

type PromoCode = {
  id: number;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderCents: number;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
};

type FormState = {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: string;
  minOrderEur: string;
  maxUses: string;
  expiresAt: string;
};

const emptyForm: FormState = {
  code: "",
  discountType: "percent",
  discountValue: "",
  minOrderEur: "",
  maxUses: "",
  expiresAt: "",
};

export default function PromoManager({ initialPromos }: { initialPromos: PromoCode[] }) {
  const [promos, setPromos] = useState<PromoCode[]>(initialPromos);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const set = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreating(true);

    const body = {
      code: form.code.trim().toUpperCase(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minOrderCents: form.minOrderEur ? Math.round(parseFloat(form.minOrderEur) * 100) : 0,
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      expiresAt: form.expiresAt || null,
    };

    const res = await fetch("/api/admin/promo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null);

    setCreating(false);

    if (!res?.ok) {
      const data = await res?.json().catch(() => null);
      setError(data?.error ?? "Impossible de créer le code promo.");
      return;
    }

    const data = (await res.json()) as { promo: PromoCode };
    setPromos((prev) => [data.promo, ...prev]);
    setForm(emptyForm);
  };

  const toggleActive = async (promo: PromoCode) => {
    setTogglingId(promo.id);
    const res = await fetch(`/api/admin/promo/${promo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !promo.isActive }),
    }).catch(() => null);

    setTogglingId(null);

    if (!res?.ok) return;
    const data = (await res.json()) as { promo: PromoCode };
    setPromos((prev) => prev.map((p) => (p.id === promo.id ? data.promo : p)));
  };

  return (
    <div className="space-y-10">
      {/* Formulaire de création */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-base font-semibold text-neutral-900">Nouveau code promo</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-widest text-neutral-500">
                Code
              </label>
              <input
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm uppercase outline-none focus:border-neutral-900"
                placeholder="BIENVENUE10"
                value={form.code}
                onChange={(e) => set("code", e.target.value.toUpperCase())}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-widest text-neutral-500">
                Type
              </label>
              <select
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                value={form.discountType}
                onChange={(e) => set("discountType", e.target.value)}
              >
                <option value="percent">Pourcentage (%)</option>
                <option value="fixed">Montant fixe (€)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-widest text-neutral-500">
                Valeur {form.discountType === "percent" ? "(%)" : "(€)"}
              </label>
              <input
                type="number"
                min="1"
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                placeholder={form.discountType === "percent" ? "10" : "5"}
                value={form.discountValue}
                onChange={(e) => set("discountValue", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-widest text-neutral-500">
                Commande minimum (€)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                placeholder="0"
                value={form.minOrderEur}
                onChange={(e) => set("minOrderEur", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-widest text-neutral-500">
                Utilisations max (optionnel)
              </label>
              <input
                type="number"
                min="1"
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                placeholder="Illimité"
                value={form.maxUses}
                onChange={(e) => set("maxUses", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-widest text-neutral-500">
                Date d&apos;expiration (optionnel)
              </label>
              <input
                type="datetime-local"
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                value={form.expiresAt}
                onChange={(e) => set("expiresAt", e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={creating}
            className="h-11 rounded-xl bg-neutral-900 px-6 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
          >
            {creating ? "Création..." : "Créer le code"}
          </button>
        </form>
      </div>

      {/* Table des codes */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-base font-semibold text-neutral-900">Codes promo ({promos.length})</h2>
        </div>

        {promos.length === 0 ? (
          <p className="px-6 py-8 text-sm text-neutral-500">Aucun code promo pour l&apos;instant.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-neutral-500">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-neutral-500">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-neutral-500">
                    Valeur
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-neutral-500">
                    Min. commande
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-neutral-500">
                    Utilisations
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-neutral-500">
                    Expire
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-neutral-500">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-neutral-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {promos.map((promo) => (
                  <tr
                    key={promo.id}
                    className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-neutral-900">
                      {promo.code}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {promo.discountType === "percent" ? "%" : "Fixe"}
                    </td>
                    <td className="px-4 py-3 text-neutral-900 font-semibold">
                      {promo.discountType === "percent"
                        ? `${promo.discountValue} %`
                        : `${(promo.discountValue / 100).toFixed(2).replace(".", ",")} €`}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {promo.minOrderCents > 0
                        ? `${(promo.minOrderCents / 100).toFixed(2).replace(".", ",")} €`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {promo.usedCount}
                      {promo.maxUses !== null ? ` / ${promo.maxUses}` : ""}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {promo.expiresAt
                        ? new Date(promo.expiresAt).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          promo.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        {promo.isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(promo)}
                        disabled={togglingId === promo.id}
                        className="text-xs font-semibold text-neutral-600 underline hover:text-neutral-900 disabled:opacity-50"
                      >
                        {togglingId === promo.id
                          ? "..."
                          : promo.isActive
                          ? "Désactiver"
                          : "Activer"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
