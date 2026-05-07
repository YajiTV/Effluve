import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="bg-effluve-white">

      {/* ── Hero plein écran ── */}
      <section className="relative h-screen min-h-[640px] w-full overflow-hidden">
        <Image
          src="/images/bannerhero.png"
          alt="Effluve — Collection"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* Overlay léger — juste pour les boutons en bas */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* CTA positionné en bas, image parle d'elle-même */}
        <div className="absolute bottom-20 left-0 right-0 flex flex-wrap gap-3 justify-center px-6">
          <Link
            href="/collection"
            className="font-body inline-flex h-12 items-center px-10 text-[10px] uppercase tracking-[0.3em] bg-effluve-vanilla text-effluve-nero hover:bg-effluve-white hover:text-effluve-black transition-all duration-300"
          >
            Découvrir la collection
          </Link>
          <Link
            href="/women"
            className="font-body inline-flex h-12 items-center px-10 text-[10px] uppercase tracking-[0.3em] border border-white/60 text-white hover:border-effluve-vanilla hover:text-effluve-vanilla transition-all duration-300"
          >
            Femme
          </Link>
          <Link
            href="/men"
            className="font-body inline-flex h-12 items-center px-10 text-[10px] uppercase tracking-[0.3em] border border-white/60 text-white hover:border-effluve-vanilla hover:text-effluve-vanilla transition-all duration-300"
          >
            Homme
          </Link>
        </div>


      </section>

      {/* ── Bandeau valeurs ── */}
      <section className="border-y border-neutral-100 bg-effluve-white">
        <div className="mx-auto max-w-[1400px] px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-neutral-100">

            {[
              { tag: "Matières", title: "Coton & laine", desc: "Sélection soignée, confort au quotidien, toucher doux." },
              { tag: "Fabrication", title: "Made in France", desc: "Production locale, finitions impeccables, exigence totale." },
              { tag: "Style", title: "Minimal & durable", desc: "Des silhouettes simples qui traversent les saisons." },
            ].map(({ tag, title, desc }) => (
              <div key={tag} className="group py-12 px-8 sm:px-12 hover:bg-neutral-50 transition-colors duration-300">
                <p className="font-body text-[9px] uppercase tracking-[0.4em] text-effluve-vanilla">
                  {tag}
                </p>
                <p className="font-title mt-3 text-2xl text-effluve-black">{title}</p>
                <p className="font-body mt-2 text-xs text-neutral-400 leading-relaxed">{desc}</p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* ── Double panneau Femme / Homme ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 h-[80vh] min-h-[500px]">

        {/* Femme */}
        <Link href="/women" className="group relative overflow-hidden">
          <Image
            src="/images/img5.png"
            alt="Collection Femme"
            fill
            sizes="50vw"
            className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-500" />
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-14 text-center">
            <p className="font-body text-[9px] uppercase tracking-[0.4em] text-white/60 mb-3">Collection</p>
            <h2 className="font-title text-5xl sm:text-6xl text-effluve-white tracking-wide">Femme</h2>
            <div className="mt-5 h-px w-8 bg-effluve-vanilla mx-auto group-hover:w-16 transition-all duration-500" />
            <p className="font-body mt-4 text-[10px] uppercase tracking-[0.3em] text-white/60 group-hover:text-white/90 transition-colors duration-300">
              Découvrir →
            </p>
          </div>
        </Link>

        {/* Homme */}
        <Link href="/men" className="group relative overflow-hidden">
          <Image
            src="/images/img2.png"
            alt="Collection Homme"
            fill
            sizes="50vw"
            className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/35 group-hover:bg-black/25 transition-colors duration-500" />
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-14 text-center">
            <p className="font-body text-[9px] uppercase tracking-[0.4em] text-white/60 mb-3">Collection</p>
            <h2 className="font-title text-5xl sm:text-6xl text-effluve-white tracking-wide">Homme</h2>
            <div className="mt-5 h-px w-8 bg-effluve-vanilla mx-auto group-hover:w-16 transition-all duration-500" />
            <p className="font-body mt-4 text-[10px] uppercase tracking-[0.3em] text-white/60 group-hover:text-white/90 transition-colors duration-300">
              Découvrir →
            </p>
          </div>
        </Link>

      </section>

      {/* ── Manifeste éditorial ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[560px]">

        {/* Image */}
        <div className="relative min-h-[400px] lg:min-h-0 overflow-hidden">
          <Image
            src="/images/img1.png"
            alt="Effluve — Savoir-faire"
            fill
            sizes="50vw"
            className="object-cover object-center"
          />
        </div>

        {/* Texte */}
        <div className="flex flex-col justify-center bg-effluve-nero px-12 py-20 lg:px-20">
          <p className="font-body text-[9px] uppercase tracking-[0.45em] text-effluve-vanilla mb-6">
            Notre histoire
          </p>
          <h2 className="font-title text-4xl sm:text-5xl text-effluve-white leading-tight">
            Une mode<br />qui a du sens.
          </h2>
          <div className="mt-6 h-px w-10 bg-effluve-vanilla" />
          <p className="font-body mt-6 text-sm text-white/55 leading-loose max-w-sm">
            Effluve naît d&apos;une conviction simple — les vêtements que l&apos;on porte méritent
            d&apos;être pensés avec soin. Chaque pièce est conçue en France, avec des matières
            naturelles et des méthodes artisanales.
          </p>
          <Link
            href="/our-story"
            className="font-body mt-10 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-effluve-vanilla hover:text-effluve-white transition-colors duration-300 group"
          >
            Lire notre histoire
            <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">→</span>
          </Link>
        </div>

      </section>

      {/* ── Nouvelle arrivée — mise en avant éditoriale ── */}
      <section className="py-24 px-8 bg-[#f9f7f4]">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4">
            <div>
              <p className="font-body text-[9px] uppercase tracking-[0.45em] text-effluve-vanilla mb-3">
                Saison 2025
              </p>
              <h2 className="font-title text-4xl sm:text-5xl text-effluve-black">Nouveautés</h2>
            </div>
            <Link
              href="/collection"
              className="font-body text-[10px] uppercase tracking-[0.3em] text-effluve-black border-b border-effluve-black pb-1 hover:text-effluve-vanilla hover:border-effluve-vanilla transition-colors duration-300 self-start sm:self-auto"
            >
              Voir tout →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { src: "/images/img3.png", name: "Veste lin", price: "280 €" },
              { src: "/images/img4.png", name: "Pantalon droit", price: "190 €" },
              { src: "/images/img6.png", name: "Chemise oversize", price: "145 €" },
              { src: "/images/img7.png", name: "Manteau laine", price: "420 €" },
            ].map(({ src, name, price }) => (
              <Link key={src} href="/collection" className="group">
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
                  <Image
                    src={src}
                    alt={name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="mt-4 px-1">
                  <p className="font-body text-xs text-effluve-black tracking-wide">{name}</p>
                  <p className="font-body text-xs text-neutral-400 mt-1">{price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Newsletter ── */}
      <section className="py-32 px-6 text-center bg-effluve-white">
        <p className="font-body text-[9px] uppercase tracking-[0.45em] text-effluve-vanilla mb-5">
          Nouvelle saison
        </p>
        <h2 className="font-title text-5xl sm:text-6xl md:text-7xl text-effluve-black leading-none">
          Toute la<br />collection
        </h2>
        <p className="font-body mt-6 text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed tracking-wide">
          Femme, homme, retrouvez toutes nos pièces de la saison.
        </p>
        <Link
          href="/collection"
          className="font-body mt-10 inline-flex h-12 items-center px-12 text-[10px] uppercase tracking-[0.35em] bg-effluve-black text-effluve-white hover:bg-effluve-nero transition-all duration-300"
        >
          Voir tout
        </Link>
      </section>

    </main>
  );
}
