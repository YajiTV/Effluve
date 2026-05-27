"use client";

import { useEffect, useState } from "react";

type User = {
  id: number;
  email: string;
  fullName: string;
  role: "customer" | "admin" | "superadmin";
};

const ROLE_LABELS: Record<User["role"], string> = {
  customer: "Client",
  admin: "Admin",
  superadmin: "Super Admin",
};

const ROLE_COLORS: Record<User["role"], string> = {
  customer: "bg-neutral-100 text-neutral-600",
  admin: "bg-blue-100 text-blue-700",
  superadmin: "bg-amber-100 text-amber-700",
};

type ResetModal =
  | { state: "confirm"; user: User }
  | { state: "success"; user: User; tempPassword: string }
  | { state: "error"; message: string };

export default function RolesManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<User["role"]>("admin");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [search, setSearch] = useState("");
  const [resetModal, setResetModal] = useState<ResetModal | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/admin/roles")
      .then((r) => r.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/roles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msgs: Record<string, string> = {
          USER_NOT_FOUND: "Aucun utilisateur trouvé avec cet email.",
          CANNOT_CHANGE_OWN_ROLE: "Vous ne pouvez pas modifier votre propre rôle.",
          INVALID_PAYLOAD: "Données invalides.",
        };
        setMessage({ type: "error", text: msgs[data.error] ?? "Une erreur est survenue." });
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === data.id ? { ...u, role: data.role } : u))
        );
        setMessage({
          type: "success",
          text: `Rôle de ${data.fullName} mis à jour : ${ROLE_LABELS[data.role as User["role"]]}.`,
        });
        setEmail("");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetConfirm() {
    if (!resetModal || resetModal.state !== "confirm") return;
    setResetLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${resetModal.user.id}/reset-password`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        const msgs: Record<string, string> = {
          FORBIDDEN: "Accès refusé.",
          USER_NOT_FOUND: "Utilisateur introuvable.",
          CANNOT_RESET_OWN_PASSWORD: "Vous ne pouvez pas réinitialiser votre propre mot de passe.",
        };
        setResetModal({ state: "error", message: msgs[data.error] ?? "Erreur inattendue." });
      } else {
        setResetModal({ state: "success", user: resetModal.user, tempPassword: data.tempPassword });
        setCopied(false);
      }
    } finally {
      setResetLoading(false);
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Role form */}
      <div className="bg-white border border-neutral-200 p-6 space-y-4">
        <p className="text-xs uppercase tracking-widest text-neutral-400">Modifier un rôle</p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            required
            placeholder="Email de l'utilisateur"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as User["role"])}
            className="border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-black bg-white"
          >
            <option value="customer">Client</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 text-xs uppercase tracking-widest bg-black text-white hover:bg-neutral-800 disabled:opacity-50 transition-colors"
          >
            {submitting ? "..." : "Appliquer"}
          </button>
        </form>
        {message && (
          <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-500"}`}>
            {message.text}
          </p>
        )}
      </div>

      {/* User list */}
      <div className="bg-white border border-neutral-200">
        <div className="p-4 border-b border-neutral-100">
          <input
            type="text"
            placeholder="Rechercher un utilisateur…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
          />
        </div>
        {loading ? (
          <p className="p-6 text-sm text-neutral-400">Chargement…</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-neutral-400 font-normal">
                  Utilisateur
                </th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-neutral-400 font-normal">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-neutral-400 font-normal">
                  Rôle
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                  <td className="px-4 py-3">{u.fullName}</td>
                  <td className="px-4 py-3 text-neutral-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs rounded-sm font-medium ${ROLE_COLORS[u.role]}`}
                    >
                      {ROLE_LABELS[u.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setResetModal({ state: "confirm", user: u })}
                      className="text-xs text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors"
                    >
                      Réinitialiser MDP
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-neutral-400 text-sm">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Reset password modal */}
      {resetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => { if (e.target === e.currentTarget) setResetModal(null); }}
        >
          <div className="bg-white border border-neutral-200 p-8 max-w-md w-full mx-4 space-y-6">
            {resetModal.state === "confirm" && (
              <>
                <h2 className="font-title text-2xl text-black">Réinitialiser le mot de passe</h2>
                <p className="text-sm text-neutral-600">
                  Vous allez réinitialiser le mot de passe de{" "}
                  <strong>{resetModal.user.fullName}</strong> ({resetModal.user.email}).
                </p>
                <p className="text-sm text-neutral-600">
                  Un mot de passe temporaire sera généré. L&apos;utilisateur devra en définir un
                  nouveau lors de sa prochaine connexion.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setResetModal(null)}
                    className="px-5 py-2 text-xs uppercase tracking-widest border border-neutral-300 hover:border-black transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleResetConfirm}
                    disabled={resetLoading}
                    className="px-5 py-2 text-xs uppercase tracking-widest bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {resetLoading ? "…" : "Confirmer"}
                  </button>
                </div>
              </>
            )}

            {resetModal.state === "success" && (
              <>
                <h2 className="font-title text-2xl text-black">Mot de passe réinitialisé</h2>
                <p className="text-sm text-neutral-600">
                  Le mot de passe de <strong>{resetModal.user.fullName}</strong> a été réinitialisé.
                  Communiquez le mot de passe temporaire ci-dessous à l&apos;utilisateur. Il ne sera
                  affiché qu&apos;une seule fois.
                </p>
                <div className="bg-neutral-50 border border-neutral-200 p-4 flex items-center justify-between gap-4">
                  <code className="text-sm font-mono text-black break-all">
                    {resetModal.tempPassword}
                  </code>
                  <button
                    onClick={() => handleCopy(resetModal.tempPassword)}
                    className="shrink-0 text-xs uppercase tracking-widest text-neutral-500 hover:text-black transition-colors"
                  >
                    {copied ? "Copié ✓" : "Copier"}
                  </button>
                </div>
                <p className="text-xs text-neutral-400">
                  Lors de sa prochaine connexion, l&apos;utilisateur sera obligé de définir un
                  nouveau mot de passe.
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={() => setResetModal(null)}
                    className="px-5 py-2 text-xs uppercase tracking-widest bg-black text-white hover:bg-neutral-800 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </>
            )}

            {resetModal.state === "error" && (
              <>
                <h2 className="font-title text-2xl text-black">Erreur</h2>
                <p className="text-sm text-red-500">{resetModal.message}</p>
                <div className="flex justify-end">
                  <button
                    onClick={() => setResetModal(null)}
                    className="px-5 py-2 text-xs uppercase tracking-widest border border-neutral-300 hover:border-black transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
