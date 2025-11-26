// ============================================
// PAGE 404 - ANGORA
// ============================================

import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <main className="min-h-screen bg-angora-white flex items-center justify-center px-4 relative overflow-hidden">

            {/* Éléments décoratifs en arrière-plan */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-64 h-64 bg-angora-vanilla/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-angora-vanilla/10 rounded-full blur-3xl" />
            </div>

            <div className="max-w-2xl mx-auto text-center relative z-10">

                {/* Grand 404 décoratif */}
                <div className="mb-8">
                    <h1 className="font-title text-[12rem] md:text-[16rem] leading-none text-angora-vanilla/20 select-none">
                        404
                    </h1>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
                        <p className="font-title text-5xl md:text-6xl text-angora-black tracking-tight">
                            Page introuvable
                        </p>
                    </div>
                </div>

                {/* Message élégant */}
                <div className="mt-32 mb-12">
                    <p className="font-body text-lg md:text-xl text-angora-nero mb-4 leading-relaxed">
                        Cette page n'existe pas ou a été déplacée.
                    </p>
                    <p className="font-body text-sm text-angora-nero/60 uppercase tracking-[0.15em]">
                        Nous vous invitons à retourner à l'accueil
                    </p>
                </div>

                {/* Boutons d'action */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link
                        href="/"
                        className="group flex items-center gap-3 px-10 py-5 bg-angora-black text-angora-white hover:bg-angora-vanilla hover:text-angora-nero transition-all duration-300 font-body text-xs uppercase tracking-[0.2em]"
                    >
                        <Home className="w-4 h-4" strokeWidth={1.5} />
                        Retour à l'accueil
                    </Link>

                    <Link
                        href="/collection"
                        className="group flex items-center gap-3 px-10 py-5 border border-angora-black text-angora-black hover:bg-angora-black hover:text-angora-white transition-all duration-300 font-body text-xs uppercase tracking-[0.2em]"
                    >
                        <Search className="w-4 h-4" strokeWidth={1.5} />
                        Découvrir la collection
                    </Link>
                </div>

                {/* Liens rapides */}
                <div className="mt-16 pt-8 border-t border-angora-vanilla/30">
                    <p className="font-body text-xs uppercase tracking-wider text-angora-nero/50 mb-6">
                        Liens rapides
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <Link
                            href="/femme"
                            className="font-body text-sm text-angora-nero hover:text-angora-black transition-colors"
                        >
                            Femme
                        </Link>
                        <Link
                            href="/homme"
                            className="font-body text-sm text-angora-nero hover:text-angora-black transition-colors"
                        >
                            Homme
                        </Link>
                        <Link
                            href="/collection"
                            className="font-body text-sm text-angora-nero hover:text-angora-black transition-colors"
                        >
                            Collection
                        </Link>
                        <Link
                            href="/account"
                            className="font-body text-sm text-angora-nero hover:text-angora-black transition-colors"
                        >
                            Mon compte
                        </Link>
                        <Link
                            href="/cart"
                            className="font-body text-sm text-angora-nero hover:text-angora-black transition-colors"
                        >
                            Panier
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
