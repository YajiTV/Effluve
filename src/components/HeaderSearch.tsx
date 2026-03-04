import { Search } from "lucide-react";

export default function HeaderSearch({ className = "" }: { className?: string }) {
  return (
    <form action="/search" method="GET" role="search" className={className}>
      <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-effluve-white px-3 py-2 shadow-sm transition focus-within:border-effluve-vanilla">
        <Search className="h-4 w-4 text-effluve-nero" strokeWidth={1.5} />

        <input
          name="q"
          placeholder="Rechercher un parfum, une marque..."
          className="w-full bg-transparent text-sm font-body text-effluve-black placeholder:text-effluve-nero/60 outline-none"
          autoComplete="on"
          list="search-suggestions"
          spellCheck={false}
        />

        <button
          type="submit"
          className="hidden sm:inline-flex h-8 items-center justify-center rounded-full bg-effluve-black px-3 text-[11px] font-body uppercase tracking-[0.18em] text-effluve-white transition hover:bg-effluve-vanilla hover:text-effluve-nero"
        >
          OK
        </button>
      </div>
      <datalist id="search-suggestions">
        <option value="parfum boisé" />
        <option value="eau de parfum" />
        <option value="notes florales" />
        <option value="bergamote" />
        <option value="vanille" />
      </datalist>
    </form>
  );
}
