const POSTES = [
  { titre: "Styliste senior", type: "CDD — Toulouse", desc: "Conception des collections femme et homme, de l'esquisse à l'industrialisation." },
  { titre: "Développeur(se) e-commerce", type: "CDD — Hybride", desc: "Stack Next.js / TypeScript / Prisma. Amélioration de l'expérience d'achat en ligne." },
  { titre: "Chargé(e) de communication", type: "CDD — Toulouse", desc: "Gestion des réseaux sociaux, partenariats presse et contenu éditorial." },
];

export default function RecrutementPage() {
  return (
    <main className="min-h-screen bg-effluve-white px-6 lg:px-12 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-title text-5xl text-effluve-black mb-4">Recrutement</h1>
        <p className="font-body text-effluve-nero mb-10">
          Nous construisons une équipe exigeante, curieuse et engagée. Rejoignez l&apos;aventure EFFLUVE.
        </p>

        <div className="space-y-6 font-body">
          {POSTES.map(({ titre, type, desc }) => (
            <div key={titre} className="border border-gray-200 p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="font-semibold text-effluve-black">{titre}</h2>
                  <p className="text-xs text-gray-500 mt-1">{type}</p>
                </div>
                <a
                  href="mailto:rh@effluve.fr"
                  className="text-xs uppercase tracking-[0.15em] border border-effluve-black px-4 py-2 hover:bg-effluve-black hover:text-effluve-white transition-colors"
                >
                  Postuler
                </a>
              </div>
              <p className="mt-3 text-sm text-effluve-nero leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <p className="font-body text-sm text-effluve-nero mt-10">
          Candidature spontanée :{" "}
          <a href="mailto:rh@effluve.fr" className="underline hover:text-effluve-black transition-colors">
            rh@effluve.fr
          </a>
        </p>
      </div>
    </main>
  );
}
