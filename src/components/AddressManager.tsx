"use client";

import { useState } from "react";

type Address = {
  id: number;
  firstName: string;
  lastName: string;
  line1: string;
  line2: string | null;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
};

type FormState = {
  firstName: string;
  lastName: string;
  line1: string;
  line2: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
};

const initialForm: FormState = {
  firstName: "",
  lastName: "",
  line1: "",
  line2: "",
  postalCode: "",
  city: "",
  country: "France",
  phone: "",
  isDefaultShipping: false,
  isDefaultBilling: false,
};

export default function AddressManager({ initialAddresses }: { initialAddresses: Address[] }) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [form, setForm] = useState<FormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch("/api/address", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).catch(() => null);

    if (!res?.ok) {
      setSaving(false);
      setError("Impossible d'enregistrer l'adresse.");
      return;
    }

    const refreshed = await fetch("/api/address", { cache: "no-store" }).catch(() => null);
    if (refreshed?.ok) {
      const next = (await refreshed.json()) as Address[];
      setAddresses(next);
    }

    setForm(initialForm);
    setSaving(false);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
      <section className="space-y-3">
        {addresses.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="font-semibold text-neutral-900">Aucune adresse enregistrée.</p>
            <p className="mt-1 text-neutral-600">Ajoute une adresse de livraison et de facturation.</p>
          </div>
        ) : (
          addresses.map((address) => (
            <article key={address.id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-neutral-900">
                  {address.firstName} {address.lastName}
                </p>
                {address.isDefaultShipping ? (
                  <span className="rounded-full bg-neutral-900 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
                    Livraison par défaut
                  </span>
                ) : null}
                {address.isDefaultBilling ? (
                  <span className="rounded-full border border-neutral-300 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-700">
                    Facturation par défaut
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-sm text-neutral-700">{address.line1}</p>
              {address.line2 ? <p className="text-sm text-neutral-700">{address.line2}</p> : null}
              <p className="text-sm text-neutral-700">
                {address.postalCode} {address.city} - {address.country}
              </p>
              <p className="text-sm text-neutral-700">{address.phone}</p>
            </article>
          ))
        )}
      </section>

      <aside className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-neutral-900">Ajouter une adresse</h2>

        <form onSubmit={submit} className="mt-4 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              className="rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
              placeholder="Prénom"
              value={form.firstName}
              onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
              required
            />
            <input
              className="rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
              placeholder="Nom"
              value={form.lastName}
              onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
              required
            />
          </div>

          <input
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
            placeholder="Adresse ligne 1"
            value={form.line1}
            onChange={(e) => setForm((prev) => ({ ...prev, line1: e.target.value }))}
            required
          />

          <input
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
            placeholder="Adresse ligne 2 (optionnel)"
            value={form.line2}
            onChange={(e) => setForm((prev) => ({ ...prev, line2: e.target.value }))}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              className="rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
              placeholder="Code postal"
              value={form.postalCode}
              onChange={(e) => setForm((prev) => ({ ...prev, postalCode: e.target.value }))}
              required
            />
            <input
              className="rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
              placeholder="Ville"
              value={form.city}
              onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              className="rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
              placeholder="Pays"
              value={form.country}
              onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
              required
            />
            <input
              className="rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
              placeholder="Téléphone"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              required
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={form.isDefaultShipping}
              onChange={(e) => setForm((prev) => ({ ...prev, isDefaultShipping: e.target.checked }))}
            />
            Adresse de livraison par défaut
          </label>

          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={form.isDefaultBilling}
              onChange={(e) => setForm((prev) => ({ ...prev, isDefaultBilling: e.target.checked }))}
            />
            Adresse de facturation par défaut
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={saving}
            className="h-11 w-full rounded-xl bg-neutral-900 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
          >
            {saving ? "Enregistrement..." : "Enregistrer l'adresse"}
          </button>
        </form>
      </aside>
    </div>
  );
}
