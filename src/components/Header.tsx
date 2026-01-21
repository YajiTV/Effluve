"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X, Search, User } from "lucide-react";

import HeaderSearch from "@/components/HeaderSearch";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-angora-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        {/* Ligne principale */}
        <div className="flex items-center h-20 gap-6">
          {/* Gauche (desktop nav) */}
          <nav className="hidden lg:flex items-center gap-10 flex-1">
            <Link
              href="/femme"
              className="group relative font-body text-xs uppercase tracking-[0.15em] text-angora-black transition-all duration-300 hover:text-angora-vanilla"
            >
              Femme
              <span className="absolute -bottom-2 left-0 w-0 h-px bg-angora-vanilla transition-all duration-300 group-hover:w-full" />
            </Link>

            <Link
              href="/homme"
              className="group relative font-body text-xs uppercase tracking-[0.15em] text-angora-black transition-all duration-300 hover:text-angora-vanilla"
            >
              Homme
              <span className="absolute -bottom-2 left-0 w-0 h-px bg-angora-vanilla transition-all duration-300 group-hover:w-full" />
            </Link>

            <Link
              href="/collection"
              className="group relative font-body text-xs uppercase tracking-[0.15em] text-angora-black transition-all duration-300 hover:text-angora-vanilla"
            >
              Collection
              <span className="absolute -bottom-2 left-0 w-0 h-px bg-angora-vanilla transition-all duration-300 group-hover:w-full" />
            </Link>
          </nav>

          {/* Centre (logo + search desktop) */}
          <div className="flex items-center justify-center gap-6 flex-1">
            <Link
              href="/"
              className="font-title text-3xl tracking-tighter text-angora-black hover:opacity-70 transition-opacity duration-300"
            >
              Angora
            </Link>

            {/* Search desktop */}
            <div className="hidden lg:block w-full max-w-[520px]">
              <HeaderSearch />
            </div>
          </div>

          {/* Droite (icônes) */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            {/* Loupe mobile (toggle search) */}
            <button
              className="lg:hidden p-2 hover:bg-angora-vanilla/20 rounded-full transition-all duration-300"
              aria-label="Rechercher"
              onClick={() => {
                setMobileSearchOpen((v) => !v);
                setMobileMenuOpen(false);
              }}
            >
              <Search className="w-5 h-5 text-angora-black" strokeWidth={1.5} />
            </button>

            {/* Compte desktop */}
            <Link
              href="/account"
              className="hidden lg:block p-2 hover:bg-angora-vanilla/20 rounded-full transition-all duration-300"
              aria-label="Mon compte"
            >
              <User className="w-5 h-5 text-angora-black" strokeWidth={1.5} />
            </Link>

            {/* Panier */}
            <Link
              href="/cart"
              className="relative p-2 hover:bg-angora-vanilla/20 rounded-full transition-all duration-300"
              aria-label="Panier"
            >
              <ShoppingBag className="w-5 h-5 text-angora-black" strokeWidth={1.5} />
              <span className="absolute top-0 right-0 w-4 h-4 bg-angora-vanilla text-angora-nero text-[10px] rounded-full flex items-center justify-center font-body font-medium">
                0
              </span>
            </Link>

            {/* Menu mobile */}
            <button
              className="lg:hidden p-2 hover:bg-angora-vanilla/20 rounded-full transition-all"
              onClick={() => {
                setMobileMenuOpen((v) => !v);
                setMobileSearchOpen(false);
              }}
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-angora-black" strokeWidth={1.5} />
              ) : (
                <Menu className="w-6 h-6 text-angora-black" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        {/* Search mobile (sous la ligne) */}
        {mobileSearchOpen && (
          <div className="lg:hidden pb-4 -mt-2 animate-fadeIn">
            <HeaderSearch />
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-8 border-t border-gray-200 animate-fadeIn">
            <nav className="flex flex-col gap-6">
              <Link
                href="/femme"
                className="font-body text-sm uppercase tracking-[0.15em] text-angora-black hover:text-angora-vanilla transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Femme
              </Link>
              <Link
                href="/homme"
                className="font-body text-sm uppercase tracking-[0.15em] text-angora-black hover:text-angora-vanilla transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Homme
              </Link>
              <Link
                href="/collection"
                className="font-body text-sm uppercase tracking-[0.15em] text-angora-black hover:text-angora-vanilla transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Collection
              </Link>

              <div className="pt-6 border-t border-gray-200 flex flex-col gap-4">
                <Link
                  href="/account"
                  className="font-body text-sm text-angora-nero hover:text-angora-vanilla transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mon compte
                </Link>

                <button
                  className="font-body text-sm text-angora-nero hover:text-angora-vanilla transition-colors text-left"
                  onClick={() => {
                    setMobileSearchOpen(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  Rechercher
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
