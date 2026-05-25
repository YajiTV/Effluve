const VALEURS = [
  {
    titre: "Transparence",
    texte: "Chaque pièce est traçable : matière, origine, atelier. Nous publions nos chaînes d'approvisionnement.",
  },
  {
    titre: "Durabilité",
    texte: "Nous concevons pour durer. Pas de collections jetables, des matières nobles sélectionnées pour leur longévité.",
  },
  {
    titre: "Artisanat",
    texte: "Nos partenaires sont des artisans certifiés, rémunérés équitablement, avec qui nous entretenons des relations longues.",
  },
  {
    titre: "Inclusivité",
    texte: "La beauté ne ressemble pas à une seule chose. Nos collections couvrent toutes les morphologies.",
  },
];

export default function NosValeursPage() {
  return (
    <main className="min-h-screen bg-effluve-white px-6 lg:px-12 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-title text-5xl text-effluve-black mb-10">Nos valeurs</h1>

        <div className="space-y-8 font-body">
          {VALEURS.map(({ titre, texte }) => (
            <div key={titre} className="border-l-2 border-effluve-black pl-6">
              <h2 className="font-semibold text-effluve-black mb-2">{titre}</h2>
              <p className="text-sm text-effluve-nero leading-relaxed">{texte}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
