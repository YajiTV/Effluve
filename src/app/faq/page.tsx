const FAQS = [
  {
    q: "Comment passer une commande ?",
    a: "Ajoutez les articles souhaités à votre panier, puis suivez les étapes de la page panier jusqu'au paiement.",
  },
  {
    q: "Quels modes de paiement acceptez-vous ?",
    a: "Nous acceptons les cartes bancaires (Visa, Mastercard, American Express) via un paiement sécurisé Stripe.",
  },
  {
    q: "Puis-je modifier ou annuler ma commande ?",
    a: "Toute modification doit être effectuée dans les 2 heures suivant la commande, en contactant notre service client.",
  },
  {
    q: "Comment suivre ma commande ?",
    a: "Un email de suivi vous est envoyé dès l'expédition. Vous pouvez également consulter votre espace compte.",
  },
  {
    q: "Les articles sont-ils fabriqués en France ?",
    a: "Nos pièces sont conçues en France et fabriquées dans des ateliers partenaires certifiés en Europe.",
  },
  {
    q: "Comment entretenir mes vêtements ?",
    a: "Chaque article est accompagné d'une étiquette d'entretien. Nous recommandons un lavage délicat à 30°C pour les matières nobles.",
  },
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-effluve-white px-6 lg:px-12 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-title text-5xl text-effluve-black mb-10">FAQ</h1>

        <div className="space-y-6 font-body">
          {FAQS.map(({ q, a }) => (
            <div key={q} className="border-b border-gray-100 pb-6">
              <h2 className="font-semibold text-effluve-black mb-2">{q}</h2>
              <p className="text-sm text-effluve-nero leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
