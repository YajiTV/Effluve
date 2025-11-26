'use client';

import { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface CartToastProps {
    productName: string;
    onClose: () => void;
}

export default function CartToast({ productName, onClose }: CartToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-24 right-6 z-[100] animate-slideInRight">
            <div className="bg-angora-white border border-angora-vanilla shadow-2xl p-6 max-w-sm flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-green-700" strokeWidth={2} />
                </div>

                <div className="flex-1">
                    <p className="font-body text-xs uppercase tracking-[0.15em] text-green-700 mb-1">
                        Ajouté au panier
                    </p>
                    <p className="font-body text-sm text-angora-black">
                        {productName}
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="flex-shrink-0 p-1 hover:bg-angora-vanilla/20 rounded-full transition-colors"
                >
                    <X className="w-4 h-4 text-angora-nero" strokeWidth={1.5} />
                </button>
            </div>
        </div>
    );
}
