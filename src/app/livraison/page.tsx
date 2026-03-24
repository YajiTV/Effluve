export default function LivraisonPage() {
  return (
    <main className="min-h-screen bg-effluve-white px-6 lg:px-12 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-title text-5xl text-effluve-black mb-8">Livraison</h1>

        <div className="space-y-8 font-body text-effluve-nero">
          <section>
            <h2 className="text-xl font-semibold mb-3">Délais de livraison</h2>
            <ul className="space-y-2 text-sm leading-relaxed">
              <li><span className="font-medium">Standard (3–5 jours ouvrés)</span> — offerte dès 150 €</li>
              <li><span className="font-medium">Express (24–48 h)</span> — 9,90 €</li>
              <li><span className="font-medium">International (5–10 jours ouvrés)</span> — à partir de 14,90 €</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Suivi de commande</h2>
            <p className="text-sm leading-relaxed">
              Un email de confirmation contenant votre numéro de suivi vous est envoyé dès l&apos;expédition.
              Vous pouvez suivre votre colis depuis votre espace compte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Zone de livraison</h2>
            <p className="text-sm leading-relaxed">
              Nous livrons en France métropolitaine, en Europe et dans une sélection de pays à l&apos;international.
              Pour toute demande spécifique, contactez notre service client.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
