// app/page.tsx
import Link from "next/link";
import SearchBar from "@/components/HeaderSearch";


export const dynamic = "force-dynamic";

function ArrowRight() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 0 1 .75-.75h10.69l-3.22-3.22a.75.75 0 1 1 1.06-1.06l4.5 4.5c.3.3.3.77 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06l3.22-3.22H3.75A.75.75 0 0 1 3 10Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className="relative overflow-hidden bg-white">
      {/* Fond discret */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-b from-neutral-200/70 to-transparent blur-3xl" />
        <div className="absolute -bottom-48 right-[-120px] h-[520px] w-[520px] rounded-full bg-gradient-to-b from-neutral-200/50 to-transparent blur-3xl" />
      </div>

      <section className="relative mx-auto flex min-h-[72vh] max-w-6xl flex-col items-center justify-center px-4 py-16">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/70 px-4 py-2 text-xs text-neutral-700 shadow-sm backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-neutral-900" />
          Nouvelle collection • Made in France
        </div>

        {/* Titre */}
        <h1 className="text-center font-serif text-5xl tracking-tight text-neutral-900 sm:text-6xl">
          Angora
        </h1>

        {/* Sous-titre */}
        <p className="mt-5 max-w-2xl text-center text-base leading-relaxed text-neutral-600 sm:text-lg">
          L’élégance moderne, minimaliste et durable. Découvrez une collection pensée pour durer,
          avec des matières sélectionnées et une coupe essentielle.
        </p>
        
        {/* CTA */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/collection"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-black"
          >
            Découvrir la collection <ArrowRight />
          </Link>

          <Link
            href="/femme"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-900 transition hover:border-neutral-400"
          >
            Femme
          </Link>

          <Link
            href="/homme"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-900 transition hover:border-neutral-400"
          >
            Homme
          </Link>
        </div>

        {/* Features */}
        <div className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 bg-white/70 p-5 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold tracking-[0.22em] text-neutral-500 uppercase">
              Matières
            </p>
            <p className="mt-2 text-sm font-semibold text-neutral-900">Coton & laine</p>
            <p className="mt-1 text-sm text-neutral-600">
              Confort au quotidien, toucher doux, sélection soignée.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white/70 p-5 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold tracking-[0.22em] text-neutral-500 uppercase">
              Fabrication
            </p>
            <p className="mt-2 text-sm font-semibold text-neutral-900">Made in France</p>
            <p className="mt-1 text-sm text-neutral-600">
              Production locale, finitions propres, exigence qualité.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white/70 p-5 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold tracking-[0.22em] text-neutral-500 uppercase">
              Style
            </p>
            <p className="mt-2 text-sm font-semibold text-neutral-900">Minimal & durable</p>
            <p className="mt-1 text-sm text-neutral-600">
              Une silhouette simple, des pièces qui traversent le temps.
            </p>
          </div>
        </div>

        {/* Mini navigation bas */}
        <div className="mt-12 flex items-center gap-6 text-sm text-neutral-600">
          <Link className="underline underline-offset-4 hover:text-neutral-900" href="/collection">
            Voir tout
          </Link>
          <Link className="underline underline-offset-4 hover:text-neutral-900" href="/register">
            Créer un compte
          </Link>
          <Link className="underline underline-offset-4 hover:text-neutral-900" href="/login">
            Se connecter
          </Link>
        </div>
      </section>
    </main>
  );
}
