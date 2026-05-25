export default function LivraisonPage() {
  return (
    <main className="min-h-screen bg-effluve-white px-6 lg:px-12 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-title text-5xl text-effluve-black mb-8">Livraison</h1>

        <div className="space-y-8 font-body text-effluve-nero">
          <section>
            <h2 className="text-xl font-semibold mb-3">Frais de livraison</h2>
            <p className="text-sm leading-relaxed">
              Les frais de livraison sont calculés automatiquement lors de la commande en fonction de votre adresse de livraison et du poids total de votre colis.
              Le montant exact vous est indiqué avant de confirmer votre paiement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Transporteurs</h2>
            <p className="text-sm leading-relaxed mb-2">
              Nous travaillons avec les transporteurs suivants, sélectionnés automatiquement selon la meilleure offre disponible pour votre destination :
            </p>
            <ul className="space-y-1 text-sm leading-relaxed list-disc list-inside">
              <li>Colissimo</li>
              <li>DHL</li>
              <li>GLS</li>
              <li>DPD</li>
              <li>UPS</li>
              <li>FedEx</li>
              <li>TNT</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Zones de livraison</h2>
            <p className="text-sm leading-relaxed mb-2">Nous livrons dans les pays suivants :</p>
            <ul className="space-y-1 text-sm leading-relaxed list-disc list-inside">
              <li>France métropolitaine</li>
              <li>Belgique, Luxembourg, Suisse</li>
              <li>Espagne, Italie, Allemagne</li>
              <li>Royaume-Uni, États-Unis</li>
            </ul>
            <p className="text-sm leading-relaxed mt-3">
              Pour toute destination non listée, contactez notre service client.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Suivi de commande</h2>
            <p className="text-sm leading-relaxed">
              Un email contenant votre numéro de suivi vous est envoyé dès l&apos;expédition.
              Vous pouvez également consulter le statut de votre commande depuis votre espace compte.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
