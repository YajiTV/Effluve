import Link from 'next/link';
import { User, Package, MapPin, Heart, LogOut } from 'lucide-react';

export default function AccountPage() {
    const user = {
        firstName: "Marie",
        lastName: "Dupont",
        email: "marie.dupont@example.com",
    };

    return (
        <main className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-12">
            <div className="max-w-6xl mx-auto">

                {/* En-tête */}
                <div className="mb-12">
                    <h1 className="font-title text-4xl text-black mb-2">Mon Compte</h1>
                    <p className="font-body text-neutral-600">
                        Bienvenue, {user.firstName} {user.lastName}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Menu latéral */}
                    <aside className="lg:col-span-1">
                        <nav className="bg-white border border-neutral-200 p-6 space-y-2">
                            <Link
                                href="/account"
                                className="flex items-center gap-3 px-4 py-3 font-body text-sm text-black bg-neutral-100 rounded transition-colors"
                            >
                                <User className="w-5 h-5" strokeWidth={1.5} />
                                Informations personnelles
                            </Link>

                            <Link
                                href="/account/orders"
                                className="flex items-center gap-3 px-4 py-3 font-body text-sm text-neutral-700 hover:bg-neutral-50 rounded transition-colors"
                            >
                                <Package className="w-5 h-5" strokeWidth={1.5} />
                                Mes commandes
                            </Link>

                            <Link
                                href="/account/addresses"
                                className="flex items-center gap-3 px-4 py-3 font-body text-sm text-neutral-700 hover:bg-neutral-50 rounded transition-colors"
                            >
                                <MapPin className="w-5 h-5" strokeWidth={1.5} />
                                Mes adresses
                            </Link>

                            <Link
                                href="/account/wishlist"
                                className="flex items-center gap-3 px-4 py-3 font-body text-sm text-neutral-700 hover:bg-neutral-50 rounded transition-colors"
                            >
                                <Heart className="w-5 h-5" strokeWidth={1.5} />
                                Liste de souhaits
                            </Link>

                            <button
                                className="flex items-center gap-3 px-4 py-3 font-body text-sm text-red-600 hover:bg-red-50 rounded transition-colors w-full text-left mt-6"
                            >
                                <LogOut className="w-5 h-5" strokeWidth={1.5} />
                                Se déconnecter
                            </button>
                        </nav>
                    </aside>

                    {/* Contenu principal */}
                    <div className="lg:col-span-3">
                        <div className="bg-white border border-neutral-200 p-8">
                            <h2 className="font-title text-2xl text-black mb-6">
                                Informations personnelles
                            </h2>

                            {/* Formulaire */}
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="firstName" className="block font-body text-sm text-neutral-700 mb-2">
                                            Prénom
                                        </label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            defaultValue={user.firstName}
                                            className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none transition-colors font-body"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="lastName" className="block font-body text-sm text-neutral-700 mb-2">
                                            Nom
                                        </label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            defaultValue={user.lastName}
                                            className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none transition-colors font-body"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block font-body text-sm text-neutral-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        defaultValue={user.email}
                                        className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none transition-colors font-body"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block font-body text-sm text-neutral-700 mb-2">
                                        Téléphone
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        placeholder="+33 6 12 34 56 78"
                                        className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none transition-colors font-body"
                                    />
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="px-8 py-3 bg-black text-white font-body text-sm uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                                    >
                                        Sauvegarder les modifications
                                    </button>
                                </div>
                            </form>

                            {/* Section mot de passe */}
                            <div className="mt-12 pt-8 border-t border-neutral-200">
                                <h3 className="font-title text-xl text-black mb-6">
                                    Modifier le mot de passe
                                </h3>

                                <form className="space-y-6 max-w-md">
                                    <div>
                                        <label htmlFor="currentPassword" className="block font-body text-sm text-neutral-700 mb-2">
                                            Mot de passe actuel
                                        </label>
                                        <input
                                            type="password"
                                            id="currentPassword"
                                            className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none transition-colors font-body"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="newPassword" className="block font-body text-sm text-neutral-700 mb-2">
                                            Nouveau mot de passe
                                        </label>
                                        <input
                                            type="password"
                                            id="newPassword"
                                            className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none transition-colors font-body"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="confirmPassword" className="block font-body text-sm text-neutral-700 mb-2">
                                            Confirmer le nouveau mot de passe
                                        </label>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none transition-colors font-body"
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            className="px-8 py-3 bg-black text-white font-body text-sm uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                                        >
                                            Modifier le mot de passe
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
