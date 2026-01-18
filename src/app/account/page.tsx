import Link from 'next/link';
import { redirect } from 'next/navigation';
import { User, Package, MapPin, Heart } from 'lucide-react';
import { getSessionUser } from '@/lib/auth';
import LogoutButton from '@/components/LogoutButton';

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

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
              <Link href="/account" className="flex items-center gap-3 px-4 py-3 font-body text-sm text-black bg-neutral-100 rounded transition-colors">
                <User className="w-5 h-5" strokeWidth={1.5} />
                Informations personnelles
              </Link>

              <Link href="/account/orders" className="flex items-center gap-3 px-4 py-3 font-body text-sm text-neutral-700 hover:bg-neutral-50 rounded transition-colors">
                <Package className="w-5 h-5" strokeWidth={1.5} />
                Mes commandes
              </Link>

              <Link href="/account/addresses" className="flex items-center gap-3 px-4 py-3 font-body text-sm text-neutral-700 hover:bg-neutral-50 rounded transition-colors">
                <MapPin className="w-5 h-5" strokeWidth={1.5} />
                Mes adresses
              </Link>

              <Link href="/account/wishlist" className="flex items-center gap-3 px-4 py-3 font-body text-sm text-neutral-700 hover:bg-neutral-50 rounded transition-colors">
                <Heart className="w-5 h-5" strokeWidth={1.5} />
                Liste de souhaits
              </Link>

              <LogoutButton />
            </nav>
          </aside>

          <div className="lg:col-span-3">
            <div className="bg-white border border-neutral-200 p-8">
              <h2 className="font-title text-2xl text-black mb-6">Informations personnelles</h2>

              <div className="space-y-2 font-body text-neutral-700">
                <p><span className="text-neutral-500">Nom :</span> {user.full_name}</p>
                <p><span className="text-neutral-500">Email :</span> {user.email}</p>
                {user.role === 'admin' && (
                   <p><span className="text-neutral-500">Rôle :</span> {user.role}</p>
      )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
