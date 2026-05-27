import Link from 'next/link';
import { redirect } from 'next/navigation';
import { User, Package, MapPin, Heart, RotateCcw, Shield } from 'lucide-react';
import { getSessionUser } from '@/lib/auth';
import LogoutButton from '@/components/ui/LogoutButton';
import { getLoyaltyPoints, PALIER, LOYALTY_DISCOUNT_PCT } from '@/lib/loyalty';

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect('/connexion');

  const loyaltyPoints = await getLoyaltyPoints(user.id);

  const [firstName, ...rest] = user.full_name.split(' ');
  const lastName = rest.join(' ');

  return (
    <main className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="font-title text-4xl text-black mb-2">Mon Compte</h1>
          <p className="font-body text-neutral-600">
            Bienvenue, {firstName} {lastName}
          </p>
          <p className="font-body text-neutral-600">{user.email}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <nav className="bg-white border border-neutral-200 p-6 space-y-2">
              <Link href="/compte" className="flex items-center gap-3 px-4 py-3 font-body text-sm text-black bg-neutral-100 rounded transition-colors">
                <User className="w-5 h-5" strokeWidth={1.5} />
                Informations personnelles
              </Link>

              <Link href="/compte/commandes" className="flex items-center gap-3 px-4 py-3 font-body text-sm text-neutral-700 hover:bg-neutral-50 rounded transition-colors">
                <Package className="w-5 h-5" strokeWidth={1.5} />
                Mes commandes
              </Link>
              
              <Link href="/compte/factures" className="flex items-center gap-3 px-4 py-3 font-body text-sm text-neutral-700 hover:bg-neutral-50 rounded transition-colors">
                <Package className="w-5 h-5" strokeWidth={1.5} />
                Mes factures
              </Link>

              <Link href="/compte/adresses" className="flex items-center gap-3 px-4 py-3 font-body text-sm text-neutral-700 hover:bg-neutral-50 rounded transition-colors">
                <MapPin className="w-5 h-5" strokeWidth={1.5} />
                Mes adresses
              </Link>

              <Link href="/compte/liste-de-souhaits" className="flex items-center gap-3 px-4 py-3 font-body text-sm text-neutral-700 hover:bg-neutral-50 rounded transition-colors">
                <Heart className="w-5 h-5" strokeWidth={1.5} />
                Liste de souhaits
              </Link>

              <Link href="/compte/retours" className="flex items-center gap-3 px-4 py-3 font-body text-sm text-neutral-700 hover:bg-neutral-50 rounded transition-colors">
                <RotateCcw className="w-5 h-5" strokeWidth={1.5} />
                Mes retours
              </Link>

              {(user.role === 'admin' || user.role === 'superadmin') && (
                <Link href="/admin/" className="flex items-center gap-3 px-4 py-3 font-body text-sm text-neutral-700 hover:bg-neutral-50 rounded transition-colors">
                  <Shield className="w-5 h-5" strokeWidth={1.5} />
                  Dashboard admin
                </Link>
              )}

              <LogoutButton />
            </nav>
          </aside>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white border border-neutral-200 p-8">
              <h2 className="font-title text-2xl text-black mb-6">Informations personnelles</h2>

              <div className="space-y-2 font-body text-neutral-700">
                <p><span className="text-neutral-500">Nom :</span> {user.full_name}</p>
                <p><span className="text-neutral-500">Email :</span> {user.email}</p>
                {(user.role === 'admin' || user.role === 'superadmin') && (
                  <p><span className="text-neutral-500">Rôle :</span> {user.role}</p>
                )}
              </div>
            </div>

            {(() => {
              const paliersDisponibles = Math.floor(loyaltyPoints / PALIER);
              const pointsRestants = loyaltyPoints % PALIER;
              const progressPct = Math.round((pointsRestants / PALIER) * 100);

              return (
                <div className="bg-white border border-neutral-200 p-8">
                  <h2 className="font-title text-2xl text-black mb-1">Fidélité</h2>
                  <p className="font-body text-xs text-neutral-400 mb-6">10 points par euro dépensé · 1 000 points = -{LOYALTY_DISCOUNT_PCT}% sur une commande</p>

                  <div className="flex items-end justify-between mb-3">
                    <span className="font-title text-3xl text-black">
                      {loyaltyPoints.toLocaleString("fr-FR")} points
                    </span>
                    {paliersDisponibles > 0 ? (
                      <span className="font-body text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                        {paliersDisponibles} palier{paliersDisponibles > 1 ? "s" : ""} disponible{paliersDisponibles > 1 ? "s" : ""} -{LOYALTY_DISCOUNT_PCT}% à l&apos;achat
                      </span>
                    ) : (
                      <span className="font-body text-xs text-neutral-500">
                        Prochain palier dans {PALIER - pointsRestants} pts
                      </span>
                    )}
                  </div>

                  <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black rounded-full transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="mt-2 font-body text-xs text-neutral-400">
                    {pointsRestants.toLocaleString("fr-FR")} / {PALIER.toLocaleString("fr-FR")} points vers le prochain palier
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </main>
  );
}
