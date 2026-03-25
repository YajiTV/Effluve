"use client";

import { useState } from "react";
import { AdminProduct } from "@/lib/admin-products";
import { eurFromCents } from "@/lib/money";
import { ProductCategory } from "@prisma/client";
import { Pencil, Trash2, Plus, X, Check } from "lucide-react";

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  homme: "Homme",
  femme: "Femme",
  accessoires: "Accessoires",
};

const EMPTY_FORM = {
  name: "",
  description: "",
  priceCents: "",
  imageUrl: "",
  category: "femme" as ProductCategory,
  stock: "0",
  sizes: "",
  isActive: true,
};

type FormState = typeof EMPTY_FORM;

export default function ProductsManager({ initialProducts }: { initialProducts: AdminProduct[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Ouvre le formulaire en mode création
  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  // Ouvre le formulaire en mode édition
  function openEdit(product: AdminProduct) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description ?? "",
      priceCents: String(product.priceCents),
      imageUrl: product.imageUrl ?? "",
      category: product.category,
      stock: String(product.stock),
      sizes: product.sizes ?? "",
      isActive: product.isActive,
    });
    setShowForm(true);
  }

  // Sauvegarde (création ou modification)
  async function handleSave() {
    setSaving(true);

    const payload = {
      name: form.name,
      description: form.description || null,
      priceCents: Math.round(parseFloat(form.priceCents) * 100), // l'admin saisit en euros
      imageUrl: form.imageUrl || null,
      category: form.category,
      stock: parseInt(form.stock, 10),
      sizes: form.sizes || null,
      isActive: form.isActive,
    };

    if (editingId) {
      // Modification
      const res = await fetch(`/api/admin/products/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
      }
    } else {
      // Création
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        setProducts((prev) => [created, ...prev]);
      }
    }

    setSaving(false);
    setShowForm(false);
  }

  // Suppression
  async function handleDelete(id: number) {
    if (!confirm("Supprimer ce produit ?")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  }

  // Toggle actif/inactif rapide
  async function handleToggleActive(product: AdminProduct) {
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !product.isActive }),
    });
    if (res.ok) {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isActive: !p.isActive } : p))
      );
    }
  }

  return (
    <div className="space-y-6">

      {/* Bouton ajouter */}
      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          Ajouter un produit
        </button>
      </div>

      {/* Formulaire création / édition */}
      {showForm && (
        <div className="bg-white border border-neutral-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-title text-xl text-black">
              {editingId ? "Modifier le produit" : "Nouveau produit"}
            </h2>
            <button onClick={() => setShowForm(false)}>
              <X className="w-5 h-5 text-neutral-400 hover:text-black" strokeWidth={1.5} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nom">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                placeholder="Nom du produit"
              />
            </Field>

            <Field label="Catégorie">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
                className="input"
              >
                {Object.entries(CATEGORY_LABEL).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </Field>

            <Field label="Prix (€)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.priceCents}
                onChange={(e) => setForm({ ...form, priceCents: e.target.value })}
                className="input"
                placeholder="49.90"
              />
            </Field>

            <Field label="Stock">
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="input"
              />
            </Field>

            <Field label="Tailles disponibles (ex: XS,S,M,L,XL)" className="sm:col-span-2">
              <input
                type="text"
                value={form.sizes}
                onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                className="input"
                placeholder="XS,S,M,L,XL — laisser vide si sans taille"
              />
            </Field>

            <Field label="URL de l'image" className="sm:col-span-2">
              <input
                type="text"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="input"
                placeholder="https://..."
              />
            </Field>

            <Field label="Description" className="sm:col-span-2">
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input resize-none"
                placeholder="Description du produit"
              />
            </Field>

            <Field label="Statut">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="font-body text-sm text-neutral-700">Produit actif (visible sur le site)</span>
              </label>
            </Field>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2 text-xs uppercase tracking-widest border border-neutral-300 text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name}
              className="flex items-center gap-2 px-5 py-2 bg-black text-white text-xs uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-50 transition-colors"
            >
              <Check className="w-4 h-4" strokeWidth={1.5} />
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      )}

      {/* Tableau des produits */}
      <div className="bg-white border border-neutral-200 p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 text-left">
                {["Produit", "Catégorie", "Prix", "Stock", "Statut", "Actions"].map((h) => (
                  <th key={h} className="pb-3 pr-4 font-body text-xs uppercase tracking-widest text-neutral-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      {product.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.imageUrl} alt="" className="w-10 h-10 object-cover bg-neutral-100" />
                      )}
                      <span className="font-body text-sm text-black">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-4 pr-4 font-body text-sm text-neutral-600">
                    {CATEGORY_LABEL[product.category]}
                  </td>
                  <td className="py-4 pr-4 font-body text-sm font-medium text-black">
                    {eurFromCents(product.priceCents)} €
                  </td>
                  <td className="py-4 pr-4">
                    <span className={`font-body text-sm ${product.stock < 5 ? "text-red-600 font-medium" : "text-neutral-600"}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    <button
                      onClick={() => handleToggleActive(product)}
                      className={`px-3 py-1 text-xs rounded-full font-body ${
                        product.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {product.isActive ? "Actif" : "Inactif"}
                    </button>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEdit(product)}
                        className="text-neutral-400 hover:text-black transition-colors"
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-neutral-400 hover:text-red-600 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <p className="py-12 text-center font-body text-sm text-neutral-400">Aucun produit.</p>
          )}
        </div>
      </div>

      {/* Styles inline pour les inputs (évite de dupliquer les classes Tailwind) */}
      <style>{`
        .input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #e5e5e5;
          font-size: 0.875rem;
          outline: none;
          background: white;
        }
        .input:focus {
          border-color: black;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="font-body text-xs uppercase tracking-widest text-neutral-500">{label}</label>
      {children}
    </div>
  );
}
