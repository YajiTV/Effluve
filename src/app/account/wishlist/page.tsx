// ============================================
// PAGE FAVORIS / LISTE DE SOUHAITS - ANGORA
// ============================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
    // Produits favoris (simulés pour l'instant)
    const [favorites, setFavorites] = useState([
        {
            id: 1,
            name: "Pull col roulé en laine mérinos",
            price: 89.00,
            material: "100% Laine mérinos",
            colors: ["Noir", "Beige", "Gris"],
            image: "/images/products/homme-pull-1.jpg",
            category: "Homme",
            inStock: true
        },
        {
            id: 5,
            name: "Manteau laine double face",
            price: 245.00,
            material: "100% Laine vierge",
            colors: ["Camel", "Marine"],
            image: "/images/products/homme-manteau-1.jpg",
            category: "Homme",
            inStock: true
        },
    ]);

    const removeFavorite = (id: number) => {
        setFavorites(favorites.filter(item => item.id !== id));
    };

    const addToCart = (product: typeof favorites[0]) => {
        alert(`🛒 ${product.name} ajouté au panier`);
    };

    return (
        <main className="min-h-screen bg-angora-white py-12 px-4 sm:px-6 lg:px-12">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-12">
                    <h1 className="font-title text-4xl md:text-5xl text-angora-black mb-2">
                        Mes Favoris
                    </h1>
                    <p className="font-body text-angora-nero">
                        {favorites.length} {favorites.length > 1 ? 'articles' : 'article'}
                    </p>
                </div>

                {favorites.length === 0 ? (
                    // Liste vide
                    <div className="text-center py-20">
                        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-angora-vanilla/20 flex items-center justify-center">
                            <Heart className="w-12 h-12 text-angora-vanilla" strokeWidth={1} />
                        </div>
                        <h2 className="font-title text-2xl text-angora-black mb-4">
                            Votre liste de favoris est vide
                        </h2>
                        <p className="font-body text-lg text-angora-nero mb-8">
                            Ajoutez des articles en cliquant sur le cœur ❤️
                        </p>
                        <Link
                            href="/homme"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-angora-black text-angora-white hover:bg-angora-vanilla hover:text-angora-nero transition-colors font-body text-xs uppercase tracking-[0.2em]"
                        >
                            Découvrir la collection
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {favorites.map((item) => (
                            <div
                                key={item.id}
                                className="group bg-white border border-gray-200 hover:border-angora-vanilla transition-colors"
                            >
                                {/* Image */}
                                <Link href={`/${item.category.toLowerCase()}/${item.id}`}>
                                    <div className="aspect-3/4 bg-neutral-100 relative overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-body text-xs text-neutral-400 uppercase tracking-wider text-center px-4">
                        {item.name}
                      </span>
                                        </div>

                                        {/* Badge stock */}
                                        {!item.inStock && (
                                            <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 text-[9px] font-body uppercase tracking-wider">
                                                Rupture de stock
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                {/* Infos */}
                                <div className="p-6">
                                    <Link href={`/${item.category.toLowerCase()}/${item.id}`}>
                                        <p className="font-body text-xs uppercase tracking-wider text-angora-nero/60 mb-2">
                                            {item.category}
                                        </p>
                                        <h3 className="font-body text-base text-angora-black mb-2 group-hover:text-angora-vanilla transition-colors">
                                            {item.name}
                                        </h3>
                                        <p className="font-body text-xs text-angora-nero/70 mb-3">
                                            {item.material}
                                        </p>
                                    </Link>

                                    {/* Couleurs */}
                                    <div className="flex gap-1.5 mb-4">
                                        {item.colors.map((color) => (
                                            <div
                                                key={color}
                                                className="w-5 h-5 rounded-full border border-gray-300"
                                                style={{
                                                    backgroundColor:
                                                        color === 'Noir' ? '#000000' :
                                                            color === 'Blanc' ? '#FFFFFF' :
                                                                color === 'Beige' ? '#CFC1A7' :
                                                                    color === 'Gris' ? '#888888' :
                                                                        color === 'Marine' ? '#1a1a2e' :
                                                                            color === 'Camel' ? '#C19A6B' :
                                                                                '#CCCCCC'
                                                }}
                                                title={color}
                                            />
                                        ))}
                                    </div>

                                    <p className="font-title text-xl text-angora-black mb-4">
                                        {item.price.toFixed(2)} €
                                    </p>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => addToCart(item)}
                                            disabled={!item.inStock}
                                            className="flex-1 py-3 bg-angora-black text-angora-white hover:bg-angora-vanilla hover:text-angora-nero transition-colors font-body text-xs uppercase tracking-wider disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500"
                                        >
                                            {item.inStock ? 'Ajouter au panier' : 'Indisponible'}
                                        </button>

                                        <button
                                            onClick={() => removeFavorite(item.id)}
                                            className="w-12 h-12 border border-gray-300 hover:border-red-600 hover:bg-red-50 flex items-center justify-center transition-colors group/delete"
                                            title="Retirer des favoris"
                                        >
                                            <Trash2 className="w-5 h-5 text-angora-nero group-hover/delete:text-red-600" strokeWidth={1.5} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Suggestions */}
                {favorites.length > 0 && (
                    <div className="mt-16 pt-12 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="font-title text-2xl text-angora-black">
                                Vous aimerez aussi
                            </h2>
                            <Link
                                href="/homme"
                                className="font-body text-sm uppercase tracking-wider text-angora-nero hover:text-angora-black transition-colors"
                            >
                                Voir tout →
                            </Link>
                        </div>
                        <p className="font-body text-angora-nero">
                            Continuez votre shopping sur notre collection Homme
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
