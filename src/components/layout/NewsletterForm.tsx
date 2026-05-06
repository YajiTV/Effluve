"use client";

import { useState } from "react";

const LS_KEY = "effluve_newsletter_subscribed";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [hidden] = useState(() => typeof window !== "undefined" && !!localStorage.getItem(LS_KEY));

  if (hidden) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        localStorage.setItem(LS_KEY, "1");
        setStatus("success");
        setTimeout(() => setHidden(true), 2000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl rounded-2xl border border-[#1f1f1f] bg-[#0d0d0d] p-6 sm:p-8">
      <p className="text-center text-[clamp(1.2rem,2.2vw,2rem)] font-semibold tracking-tight text-[#f2f2f2] blur-[0.35px]">
        Rejoins notre cercle privé
      </p>
      <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-[#a8a8a8]">
        Offres exclusives, nouveautés mode et sélections en avant-première.
      </p>

      <form onSubmit={handleSubmit} className="mx-auto mt-6 flex w-full max-w-3xl items-stretch gap-3">
        {status === "success" ? (
          <p className="text-sm text-[#a8a8a8] italic">Merci, tu es bien inscrit(e) !</p>
        ) : (
          <>
            <input
              type="email"
              placeholder="Ton e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === "loading"}
              className="h-12 flex-1 rounded-md border border-[#2a2a2a] bg-transparent px-4 text-sm text-[#efefef] outline-none placeholder:text-[#767676] focus:border-[#e4e4e4] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="h-12 rounded-md bg-[#ececec] px-6 text-sm font-semibold text-[#111111] transition hover:bg-white disabled:opacity-60"
            >
              {status === "loading" ? "..." : "S'inscrire"}
            </button>
          </>
        )}
        {status === "error" && (
          <p className="ml-2 self-center text-xs text-red-400">Une erreur est survenue.</p>
        )}
      </form>
    </div>
  );
}
