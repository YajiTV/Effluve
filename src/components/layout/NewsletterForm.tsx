"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
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
  );
}
