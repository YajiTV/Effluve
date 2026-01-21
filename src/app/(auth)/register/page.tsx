'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [full_name, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch('/angora/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, email, password }),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok) return setError(data?.error ?? 'Erreur');
    router.push('/account');
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-angora-white px-6 lg:px-12 py-16">
      <div className="max-w-md mx-auto border border-gray-200 p-8">
        <h1 className="font-title text-4xl text-angora-black mb-6">Créer un compte</h1>

        {error && <p className="font-body text-sm text-red-600 mb-4">{error}</p>}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block font-body text-sm text-angora-nero mb-2">Nom complet</label>
            <input
              className="w-full border border-gray-300 px-4 py-3 font-body focus:outline-none focus:border-angora-black"
              value={full_name}
              onChange={(e) => setFullName(e.target.value)}
              type="text"
              required
            />
          </div>

          <div>
            <label className="block font-body text-sm text-angora-nero mb-2">Email</label>
            <input
              className="w-full border border-gray-300 px-4 py-3 font-body focus:outline-none focus:border-angora-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>

          <div>
            <label className="block font-body text-sm text-angora-nero mb-2">Mot de passe (min 8)</label>
            <input
              className="w-full border border-gray-300 px-4 py-3 font-body focus:outline-none focus:border-angora-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full py-3 bg-angora-black text-angora-white font-body text-xs uppercase tracking-[0.2em] hover:bg-angora-vanilla hover:text-angora-nero transition-colors disabled:opacity-60"
          >
            {loading ? 'Création…' : 'Créer mon compte'}
          </button>
        </form>

        <p className="font-body text-sm text-angora-nero mt-6">
          Déjà un compte ? <Link className="underline" href="/login">Se connecter</Link>
        </p>
      </div>
    </main>
  );
}
