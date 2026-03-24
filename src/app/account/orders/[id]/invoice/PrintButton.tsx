"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex h-9 items-center rounded-lg bg-neutral-900 px-4 text-sm font-semibold text-white hover:bg-black transition-colors"
    >
      Imprimer / Enregistrer en PDF
    </button>
  );
}
