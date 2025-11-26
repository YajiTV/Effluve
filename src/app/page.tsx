// ============================================
// PAGE D'ACCUEIL - ANGORA
// ============================================

import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
    return (
        <main className="relative min-h-screen">
            {/* Image de fond */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/Tableau.jpg"
                    alt="Angora collection"
                    fill
                    className="object-cover"
                    quality={90}
                    priority
                />
                {/* Overlay pour rendre le texte lisible */}
                <div className="absolute inset-0 bg-angora-black/40" />
            </div>

            {/* Contenu par-dessus l'image */}
            <div className="relative z-10 min-h-screen flex flex-col justify-center items-center px-4 text-center">
                <h1 className="font-title text-5xl md:text-7xl text-angora-white mb-6 drop-shadow-lg">
                    Angora
                </h1>
                <p className="font-body text-lg md:text-xl text-angora-white mb-4 max-w-2xl drop-shadow-md">
                    L'élégance moderne, minimaliste et durable.
                </p>
                <p className="font-body text-base text-angora-white/90 mb-8 max-w-xl drop-shadow-md">
                    Découvrez notre collection 100% coton & laine, made in France.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        href="/collection"
                        className="px-8 py-4 bg-angora-white text-angora-black hover:bg-angora-vanilla hover:text-angora-nero transition-all duration-300 font-body text-sm uppercase tracking-wider"
                    >
                        Découvrir la collection
                    </Link>
                    <Link
                        href="/femme"
                        className="px-8 py-4 border-2 border-angora-white text-angora-white hover:bg-angora-white hover:text-angora-black transition-all duration-300 font-body text-sm uppercase tracking-wider"
                    >
                        Femme
                    </Link>
                </div>
            </div>

            {/* Indicateur de scroll (optionnel) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
                <div className="w-6 h-10 border-2 border-angora-white rounded-full flex justify-center pt-2">
                    <div className="w-1 h-3 bg-angora-white rounded-full" />
                </div>
            </div>
        </main>
    );
}
