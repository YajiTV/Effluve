'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, Heart, CheckCircle, X } from 'lucide-react';

// Toast pour panier
function CartToast({ productName, onClose }: { productName: string; onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-24 right-6 z-100 animate-slideInRight">
            <div className="bg-angora-white border border-angora-vanilla shadow-2xl p-6 max-w-sm flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle className="w-6 h-6 text-green-700" strokeWidth={2} />
                </div>
                <div className="flex-1">
                    <p className="font-body text-xs uppercase tracking-[0.15em] text-green-700 mb-1">
                        Ajouté au panier
                    </p>
                    <p className="font-body text-sm text-angora-black">{productName}</p>
                </div>
                <button onClick={onClose} className="shrink-0 p-1 hover:bg-angora-vanilla/20 rounded-full transition-colors">
                    <X className="w-4 h-4 text-angora-nero" strokeWidth={1.5} />
                </button>
            </div>
        </div>
    );
}

// Toast pour favoris
function FavoriteToast({ productName, onClose }: { productName: string; onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-24 right-6 z-100 animate-slideInRight">
            <div className="bg-angora-white border border-angora-vanilla shadow-2xl p-6 max-w-sm flex items-start gap-4">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center shrink-0">
                    <Heart className="w-6 h-6 text-pink-600 fill-pink-600" strokeWidth={2} />
                </div>
                <div className="flex-1">
                    <p className="font-body text-xs uppercase tracking-[0.15em] text-pink-600 mb-1">
                        Ajouté aux favoris
                    </p>
                    <p className="font-body text-sm text-angora-black">{productName}</p>
                </div>
                <button onClick={onClose} className="shrink-0 p-1 hover:bg-angora-vanilla/20 rounded-full transition-colors">
                    <X className="w-4 h-4 text-angora-nero" strokeWidth={1.5} />
                </button>
            </div>
        </div>
    );
}

export default function HommePage() {
    const [sortBy, setSortBy] = useState('nouveautes');
    const [cartToast, setCartToast] = useState<{ show: boolean; productName: string }>({ show: false, productName: '' });
    const [favoriteToast, setFavoriteToast] = useState<{ show: boolean; productName: string }>({ show: false, productName: '' });
    const [addingToCart, setAddingToCart] = useState<number | null>(null);
    const [favorites, setFavorites] = useState<number[]>([]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const productsData = [
        {
            id: 1,
            name: "Pull col roulé en laine mérinos",
            price: 89.00,
            material: "100% Laine mérinos",
            colors: ["Noir", "Beige", "Gris"],
            badge: "Nouveauté",
            dateAjout: new Date('2025-11-20')
        },
        {
            id: 2,
            name: "Chemise Oxford classique",
            price: 75.00,
            material: "100% Coton",
            colors: ["Blanc", "Bleu ciel"],
            badge: null,
            dateAjout: new Date('2025-11-15')
        },
        {
            id: 3,
            name: "Pantalon chino coupe droite",
            price: 95.00,
            material: "100% Coton biologique",
            colors: ["Beige", "Marine", "Kaki"],
            badge: "Made in France",
            dateAjout: new Date('2025-11-10')
        },
        {
            id: 4,
            name: "Gilet cardigan boutonné",
            price: 110.00,
            material: "100% Laine",
            colors: ["Beige", "Marine"],
            badge: null,
            dateAjout: new Date('2025-11-05')
        },
        {
            id: 5,
            name: "Manteau laine double face",
            price: 245.00,
            material: "100% Laine vierge",
            colors: ["Camel", "Marine"],
            badge: "Nouveauté",
            dateAjout: new Date('2025-11-25')
        },
        {
            id: 6,
            name: "T-shirt col rond essential",
            price: 45.00,
            material: "100% Coton pima",
            colors: ["Blanc", "Noir", "Beige"],
            badge: null,
            dateAjout: new Date('2025-11-01')
        },
    ];

    const products = useMemo(() => {
        const sorted = [...productsData];
        switch (sortBy) {
            case 'prix-croissant':
                return sorted.sort((a, b) => a.price - b.price);
            case 'prix-decroissant':
                return sorted.sort((a, b) => b.price - a.price);
            case 'nom':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'nouveautes':
            default:
                return sorted.sort((a, b) => b.dateAjout.getTime() - a.dateAjout.getTime());
        }
    }, [productsData, sortBy]);

    const handleAddToCart = (e: React.MouseEvent, product: typeof productsData[0]) => {
        e.preventDefault();
        e.stopPropagation();

        setAddingToCart(product.id);
        setTimeout(() => {
            setAddingToCart(null);
            setCartToast({ show: true, productName: product.name });
        }, 400);
    };

    const handleToggleFavorite = (e: React.MouseEvent, product: typeof productsData[0]) => {
        e.preventDefault();
        e.stopPropagation();

        if (favorites.includes(product.id)) {
            // Retirer des favoris
            setFavorites(favorites.filter(id => id !== product.id));
        } else {
            // Ajouter aux favoris
            setFavorites([...favorites, product.id]);
            setFavoriteToast({ show: true, productName: product.name });
        }
    };

    return (
        <main className="min-h-screen bg-angora-white">

            {/* Toasts */}
            {cartToast.show && (
                <CartToast
                    productName={cartToast.productName}
                    onClose={() => setCartToast({ show: false, productName: '' })}
                />
            )}
            {favoriteToast.show && (
                <FavoriteToast
                    productName={favoriteToast.productName}
                    onClose={() => setFavoriteToast({ show: false, productName: '' })}
                />
            )}

            {/* Header */}
            <div className="border-b border-gray-200 bg-angora-vanilla/5">
                <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-16">
                    <h1 className="font-title text-6xl md:text-7xl text-angora-black mb-4 tracking-tight">Homme</h1>
                    <p className="font-body text-sm uppercase tracking-[0.15em] text-angora-nero/60">
                        {products.length} articles • {favorites.length} favoris
                    </p>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12">

                {/* Filtres et tri */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12 pb-6 border-b border-gray-200">
                    <button className="flex items-center gap-2 font-body text-sm uppercase tracking-wider text-angora-nero hover:text-angora-black transition-colors">
                        <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
                        Filtres
                    </button>

                    <div className="flex items-center gap-3">
                        <span className="font-body text-xs uppercase tracking-wider text-angora-nero/60">Trier par:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="font-body text-sm uppercase tracking-wider text-angora-black border border-gray-300 px-4 py-2 hover:border-angora-vanilla focus:border-angora-black focus:outline-none transition-colors cursor-pointer bg-angora-white"
                        >
                            <option value="nouveautes">Nouveautés</option>
                            <option value="prix-croissant">Prix croissant</option>
                            <option value="prix-decroissant">Prix décroissant</option>
                            <option value="nom">Nom A-Z</option>
                        </select>
                    </div>
                </div>

                {/* Grille produits */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                    {products.map((product) => {
                        const isFavorite = favorites.includes(product.id);

                        return (
                            <div key={product.id} className="group">
                                <Link href={`/homme/${product.id}`}>
                                    <div className="relative">
                                        <div className={`aspect-3/4 bg-neutral-100 mb-4 overflow-hidden relative transition-transform duration-300 ${addingToCart === product.id ? 'scale-95' : 'group-hover:scale-[1.02]'}`}>

                                            <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-body text-xs text-neutral-400 uppercase tracking-wider text-center px-4">
                          {product.name}
                        </span>
                                            </div>

                                            {product.badge && (
                                                <div className="absolute top-3 left-3 bg-angora-white px-3 py-1 text-[9px] font-body uppercase tracking-wider text-angora-nero z-10">
                                                    {product.badge}
                                                </div>
                                            )}

                                            {addingToCart === product.id && (
                                                <div className="absolute inset-0 bg-angora-vanilla/30 flex items-center justify-center z-20">
                                                    <div className="w-8 h-8 border-2 border-angora-black border-t-transparent rounded-full animate-spin" />
                                                </div>
                                            )}

                                            {/* Bouton FAVORIS (cœur) */}
                                            <button
                                                onClick={(e) => handleToggleFavorite(e, product)}
                                                className={`absolute top-3 right-3 w-10 h-10 bg-angora-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-10 ${
                                                    isFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                                } hover:bg-angora-vanilla`}
                                            >
                                                <Heart
                                                    className={`w-5 h-5 transition-all duration-300 ${
                                                        isFavorite ? 'fill-pink-600 text-pink-600' : 'text-angora-nero'
                                                    }`}
                                                    strokeWidth={1.5}
                                                />
                                            </button>

                                            {/* Bouton PANIER */}
                                            <button
                                                onClick={(e) => handleAddToCart(e, product)}
                                                disabled={addingToCart === product.id}
                                                className="absolute bottom-0 left-0 right-0 bg-angora-black text-angora-white py-3 text-center font-body text-xs uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-angora-vanilla hover:text-angora-nero disabled:opacity-50 z-10"
                                            >
                                                {addingToCart === product.id ? 'Ajout en cours...' : 'Ajouter au panier'}
                                            </button>
                                        </div>

                                        {/* Infos produit */}
                                        <div>
                                            <h3 className="font-body text-sm text-angora-black mb-1 group-hover:text-angora-vanilla transition-colors">
                                                {product.name}
                                            </h3>
                                            <p className="font-body text-xs uppercase tracking-wider text-angora-nero/60 mb-2">
                                                {product.material}
                                            </p>
                                            <div className="flex gap-1.5 mb-3">
                                                {product.colors.map((color) => (
                                                    <div
                                                        key={color}
                                                        className="w-4 h-4 rounded-full border border-gray-300"
                                                        style={{
                                                            backgroundColor:
                                                                color === 'Noir' ? '#000000' :
                                                                    color === 'Blanc' ? '#FFFFFF' :
                                                                        color === 'Beige' ? '#CFC1A7' :
                                                                            color === 'Gris' ? '#888888' :
                                                                                color === 'Marine' ? '#1a1a2e' :
                                                                                    color === 'Bleu ciel' ? '#87CEEB' :
                                                                                        color === 'Camel' ? '#C19A6B' :
                                                                                            color === 'Kaki' ? '#8A7F6D' :
                                                                                                '#CCCCCC'
                                                        }}
                                                        title={color}
                                                    />
                                                ))}
                                            </div>
                                            <p className="font-title text-lg text-angora-black">
                                                {product.price.toFixed(2)} €
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
