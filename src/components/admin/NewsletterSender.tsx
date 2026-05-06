"use client";

import { useState } from "react";

export default function NewsletterSender({ subscriberCount }: { subscriberCount: number }) {
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; sent?: number; error?: string } | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !html.trim()) return;
    setSending(true);
    setResult(null);

    const res = await fetch("/api/admin/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, html }),
    }).catch(() => null);

    setSending(false);

    if (!res?.ok) {
      const data = await res?.json().catch(() => ({}));
      setResult({ ok: false, error: data?.error ?? "Erreur inconnue." });
      return;
    }

    const data = await res.json();
    setResult({ ok: true, sent: data.sent });
    setSubject("");
    setHtml("");
  }

  return (
    <form onSubmit={handleSend} className="space-y-5">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-5">

        <div>
          <label className="block text-sm font-semibold text-neutral-900 mb-1">Sujet</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Ex : Nouvelle collection Automne 2026"
            required
            className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-900 mb-1">
            Contenu <span className="font-normal text-neutral-400">(HTML accepté)</span>
          </label>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder={`<p>Bonjour,</p>\n<p>Notre nouvelle collection est disponible...</p>`}
            required
            rows={10}
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm font-mono outline-none focus:border-neutral-900 resize-y"
          />
        </div>

        <div className="flex items-center justify-between gap-4 pt-1">
          <p className="text-sm text-neutral-500">
            Sera envoyé à <span className="font-semibold text-neutral-900">{subscriberCount} inscrit{subscriberCount > 1 ? "s" : ""}</span>.
          </p>
          <button
            type="submit"
            disabled={sending || subscriberCount === 0}
            className="inline-flex h-11 items-center rounded-xl bg-neutral-900 px-6 text-sm font-semibold text-white hover:bg-black disabled:opacity-50"
          >
            {sending ? "Envoi en cours..." : "Envoyer la campagne"}
          </button>
        </div>
      </div>

      {result && (
        <div className={`rounded-2xl border p-4 text-sm font-semibold ${
          result.ok
            ? "border-green-200 bg-green-50 text-green-800"
            : "border-red-200 bg-red-50 text-red-800"
        }`}>
          {result.ok
            ? `✓ Campagne envoyée à ${result.sent} inscrit${(result.sent ?? 0) > 1 ? "s" : ""}.`
            : `Erreur : ${result.error}`}
        </div>
      )}
    </form>
  );
}
