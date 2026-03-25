const ENGAGEMENTS = [
  {
    num: "01",
    titre: "Bilan carbone publié annuellement",
    texte: "Nous mesurons et publions l'empreinte carbone de chaque collection, avec un objectif de réduction de 10 % par an.",
  },
  {
    num: "02",
    titre: "Programme de reprise",
    texte: "Retournez vos anciennes pièces EFFLUVE pour un bon d'achat. Les articles sont reconditionnés ou recyclés.",
  },
  {
    num: "03",
    titre: "Emballages 100 % recyclés",
    texte: "Nos emballages sont fabriqués à partir de carton recyclé et d'encres végétales. Aucun plastique superflu.",
  },
  {
    num: "04",
    titre: "Soutien aux artisans locaux",
    texte: "5 % du chiffre d'affaires est reversé à un fonds d'aide aux jeunes artisans textiles français.",
  },
];

export default function EngagementPage() {
  return (
    <main className="min-h-screen bg-effluve-white px-6 lg:px-12 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-title text-5xl text-effluve-black mb-10">Engagement</h1>

        <div className="space-y-8 font-body">
          {ENGAGEMENTS.map(({ num, titre, texte }) => (
            <div key={num} className="flex gap-6">
              <span className="font-title text-3xl text-gray-200 shrink-0 leading-none">{num}</span>
              <div>
                <h2 className="font-semibold text-effluve-black mb-1">{titre}</h2>
                <p className="text-sm text-effluve-nero leading-relaxed">{texte}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
