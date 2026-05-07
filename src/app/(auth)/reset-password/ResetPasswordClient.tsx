"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordClient() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/set-new-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, confirmPassword }),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok) {
      if (res.status === 401 || data?.error === "SESSION_EXPIRED") {
        setError("Votre lien de réinitialisation a expiré. Veuillez vous reconnecter.");
        setTimeout(() => router.push("/login"), 3000);
        return;
      }
      setError(data?.error ?? "Une erreur est survenue.");
      return;
    }

    router.push("/account");
    router.refresh();
  }

  const strength = (() => {
    if (!password) return null;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2) return { label: "Faible", color: "bg-red-400" };
    if (score <= 3) return { label: "Moyen", color: "bg-yellow-400" };
    return { label: "Fort", color: "bg-green-500" };
  })();

  return (
    <main className="min-h-screen bg-effluve-white px-6 lg:px-12 py-16">
      <div className="max-w-md mx-auto border border-gray-200 p-8">
        <div className="mb-6">
          <h1 className="font-title text-4xl text-effluve-black mb-2">
            Nouveau mot de passe
          </h1>
          <p className="font-body text-sm text-effluve-nero">
            Un administrateur a réinitialisé votre mot de passe. Vous devez en
            définir un nouveau pour continuer.
          </p>
        </div>

        {error && (
          <p className="font-body text-sm text-red-600 mb-4">{error}</p>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block font-body text-sm text-effluve-nero mb-2">
              Nouveau mot de passe
            </label>
            <input
              className="w-full border border-gray-300 px-4 py-3 font-body focus:outline-none focus:border-effluve-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
            {strength && (
              <div className="mt-2 flex items-center gap-2">
                <div className={`h-1.5 w-16 rounded-full ${strength.color}`} />
                <span className="text-xs text-neutral-500">{strength.label}</span>
              </div>
            )}
            <p className="mt-1 text-xs text-neutral-400">
              Min. 8 caractères, une majuscule, un chiffre.
            </p>
          </div>

          <div>
            <label className="block font-body text-sm text-effluve-nero mb-2">
              Confirmer le mot de passe
            </label>
            <input
              className="w-full border border-gray-300 px-4 py-3 font-body focus:outline-none focus:border-effluve-black"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              required
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-xs text-red-500">
                Les mots de passe ne correspondent pas.
              </p>
            )}
          </div>

          <button
            disabled={loading}
            className="w-full py-3 bg-effluve-black text-effluve-white font-body text-xs uppercase tracking-[0.2em] hover:bg-effluve-vanilla hover:text-effluve-nero transition-colors disabled:opacity-60"
          >
            {loading ? "Enregistrement…" : "Définir le mot de passe"}
          </button>
        </form>
      </div>
    </main>
  );
}
