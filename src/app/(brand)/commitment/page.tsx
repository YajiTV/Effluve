const MATIERES = [
  {
    label: "Cuir végétal",
    detail: "Fibre d'ananas",
    fournisseur: "Ananas Anam",
    transformation: "Transformation et confection réalisées en France.",
  },
  {
    label: "Laine végétale",
    detail: "Fibre de bambou",
    fournisseur: "Comptoir du Bambou",
    transformation: "Tricotage et confection réalisés en France.",
  },
  {
    label: "Fourrure végétale",
    detail: "Fibre de maïs",
    fournisseur: "NatureWorks (États-Unis)",
    transformation: "Texturisation et assemblage réalisés en France.",
  },
];

const PARTENAIRES = [
  {
    nom: "Texinov",
    description: "Spécialiste du textile technique, France.",
  },
  {
    nom: "Tissages de Charlieu",
    description: "Expert en tissage responsable, France.",
  },
  {
    nom: "Lemahieu",
    description: "Atelier historique pour la confection finale, France.",
  },
];

export default function EngagementPage() {
  return (
    <main className="min-h-screen bg-effluve-white px-6 lg:px-12 py-16">
      <div className="max-w-3xl mx-auto space-y-16">

        {/* Titre */}
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-neutral-400 uppercase mb-3">RSE</p>
          <h1 className="font-title text-5xl text-effluve-black mb-4">Engagements</h1>
          <p className="font-body text-effluve-nero leading-relaxed">
            Effluve privilégie des matières végétales de nouvelle génération sourcées à l&apos;international,
            tout en garantissant une transformation et une confection réalisées en France.
          </p>
        </div>

        {/* Matières premières */}
        <section>
          <h2 className="font-title text-2xl text-effluve-black mb-2">
            Nos Matières Premières &amp; Fournisseurs
          </h2>
          <p className="font-body text-sm text-effluve-nero mb-8">
            L&apos;innovation au service du vivant.
          </p>

          <div className="space-y-6">
            {MATIERES.map(({ label, detail, fournisseur, transformation }) => (
              <div key={label} className="border-t border-neutral-200 pt-6 grid grid-cols-[1fr_auto] gap-4">
                <div className="font-body">
                  <p className="font-semibold text-effluve-black">
                    {label}{" "}
                    <span className="font-normal text-neutral-500">({detail})</span>
                  </p>
                  <p className="text-sm text-effluve-nero mt-1">
                    Sourcé auprès de <span className="font-medium text-effluve-black">{fournisseur}</span>.{" "}
                    {transformation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Partenaires */}
        <section>
          <h2 className="font-title text-2xl text-effluve-black mb-2">
            Nos Partenaires de Transformation
          </h2>
          <p className="font-body text-sm text-effluve-nero mb-8">
            Le savoir-faire français au cœur de notre production.
          </p>

          <div className="space-y-4">
            {PARTENAIRES.map(({ nom, description }) => (
              <div key={nom} className="flex gap-5 items-start border-t border-neutral-200 pt-5">
                <span className="font-title text-2xl text-gray-200 shrink-0 leading-none select-none">✦</span>
                <div className="font-body">
                  <p className="font-semibold text-effluve-black">{nom}</p>
                  <p className="text-sm text-effluve-nero mt-0.5">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
