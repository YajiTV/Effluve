import { Search } from "lucide-react";

export default function HeaderSearch({ className = "" }: { className?: string }) {
  return (
    <form action="/search" method="GET" role="search" className={className}>
      <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-angora-white px-3 py-2 shadow-sm transition focus-within:border-angora-vanilla">
        <Search className="h-4 w-4 text-angora-nero" strokeWidth={1.5} />

        <input
          name="q"
          placeholder="Rechercher…"
          className="w-full bg-transparent text-sm font-body text-angora-black placeholder:text-angora-nero/60 outline-none"
          autoComplete="off"
          spellCheck={false}
        />

        <button
          type="submit"
          className="hidden sm:inline-flex h-8 items-center justify-center rounded-full bg-angora-black px-3 text-[11px] font-body uppercase tracking-[0.18em] text-angora-white transition hover:bg-angora-vanilla hover:text-angora-nero"
        >
          OK
        </button>
      </div>
    </form>
  );
}
