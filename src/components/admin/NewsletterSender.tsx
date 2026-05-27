"use client";

import { useState, useEffect } from "react";

type Campaign = {
  id: number;
  subject: string;
  sentCount: number;
  sentAt: string;
};

type Tab = "compose" | "history";

export default function NewsletterSender({ subscriberCount }: { subscriberCount: number }) {
  const [tab, setTab] = useState<Tab>("compose");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [sending, setSending] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; sent?: number; error?: string } | null>(null);
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  useEffect(() => {
    if (tab === "history") fetchCampaigns();
  }, [tab]);

  async function fetchCampaigns() {
    setLoadingCampaigns(true);
    const res = await fetch("/api/admin/newsletter/campaigns").catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      setCampaigns(data.campaigns ?? []);
    }
    setLoadingCampaigns(false);
  }

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

  async function handleTest() {
    if (!subject.trim() || !html.trim()) return;
    setTesting(true);
    setTestResult(null);

    const res = await fetch("/api/admin/newsletter/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, html }),
    }).catch(() => null);

    setTesting(false);

    if (!res?.ok) {
      const data = await res?.json().catch(() => ({}));
      setTestResult({ ok: false, error: data?.error ?? "Erreur inconnue." });
      return;
    }

    setTestResult({ ok: true });
  }

  return (
    <div className="space-y-5">
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => setTab("compose")}
          className={`px-5 py-3 text-sm font-semibold transition-colors ${
            tab === "compose"
              ? "border-b-2 border-neutral-900 text-neutral-900"
              : "text-neutral-400 hover:text-neutral-700"
          }`}
        >
          Rédiger
        </button>
        <button
          onClick={() => setTab("history")}
          className={`px-5 py-3 text-sm font-semibold transition-colors ${
            tab === "history"
              ? "border-b-2 border-neutral-900 text-neutral-900"
              : "text-neutral-400 hover:text-neutral-700"
          }`}
        >
          Historique
        </button>
      </div>

      {tab === "compose" && (
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-semibold text-neutral-900">
                  Contenu <span className="font-normal text-neutral-400">(HTML accepté)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPreview((v) => !v)}
                  className="text-xs text-neutral-500 underline hover:text-neutral-900 sm:hidden"
                >
                  {showPreview ? "Masquer la prévisualisation" : "Prévisualiser"}
                </button>
              </div>

              <div className="flex gap-4">
                <div className={`flex-1 ${showPreview ? "hidden sm:block" : ""}`}>
                  <textarea
                    value={html}
                    onChange={(e) => setHtml(e.target.value)}
                    placeholder={`<p>Bonjour,</p>\n<p>Notre nouvelle collection est disponible...</p>`}
                    required
                    rows={14}
                    className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm font-mono outline-none focus:border-neutral-900 resize-y"
                  />
                </div>

                <div className={`flex-1 ${!showPreview ? "hidden sm:block" : ""}`}>
                  <div className="h-full min-h-[14rem] rounded-xl border border-neutral-200 overflow-hidden">
                    <iframe
                      srcDoc={html || "<p style='color:#999;font-family:sans-serif;padding:16px;font-size:13px'>La prévisualisation apparaîtra ici.</p>"}
                      sandbox="allow-same-origin"
                      className="w-full h-full min-h-[14rem]"
                      title="Prévisualisation email"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="text-sm text-neutral-500">
                Sera envoyé à{" "}
                <span className="font-semibold text-neutral-900">
                  {subscriberCount} inscrit{subscriberCount > 1 ? "s" : ""}
                </span>
                .
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={testing || !subject.trim() || !html.trim()}
                  className="inline-flex h-11 items-center rounded-xl border border-neutral-300 px-5 text-sm font-semibold text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 disabled:opacity-50"
                >
                  {testing ? "Envoi test..." : "Envoyer un test à mon email"}
                </button>
                <button
                  type="submit"
                  disabled={sending || subscriberCount === 0}
                  className="inline-flex h-11 items-center rounded-xl bg-neutral-900 px-6 text-sm font-semibold text-white hover:bg-black disabled:opacity-50"
                >
                  {sending ? "Envoi en cours..." : "Envoyer la campagne"}
                </button>
              </div>
            </div>
          </div>

          {testResult && (
            <div
              className={`rounded-2xl border p-4 text-sm font-semibold ${
                testResult.ok
                  ? "border-blue-200 bg-blue-50 text-blue-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {testResult.ok ? "Email de test envoyé." : `Erreur : ${testResult.error}`}
            </div>
          )}

          {result && (
            <div
              className={`rounded-2xl border p-4 text-sm font-semibold ${
                result.ok
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {result.ok
                ? `Campagne envoyée à ${result.sent} inscrit${(result.sent ?? 0) > 1 ? "s" : ""}.`
                : `Erreur : ${result.error}`}
            </div>
          )}
        </form>
      )}

      {tab === "history" && (
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          {loadingCampaigns ? (
            <p className="p-6 text-sm text-neutral-400">Chargement...</p>
          ) : campaigns.length === 0 ? (
            <p className="p-6 text-sm text-neutral-400">Aucune campagne envoyée.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    Sujet
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    Envoyés
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50">
                    <td className="px-5 py-3 text-neutral-500 whitespace-nowrap">
                      {new Date(c.sentAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3 text-neutral-900 font-medium max-w-xs truncate">
                      {c.subject}
                    </td>
                    <td className="px-5 py-3 text-right text-neutral-900 font-semibold">
                      {c.sentCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
