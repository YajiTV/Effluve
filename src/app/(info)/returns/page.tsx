import Link from "next/link";

export default function RetoursPage() {
  return (
    <main className="min-h-screen bg-effluve-white px-6 lg:px-12 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-title text-5xl text-effluve-black mb-8">Retours</h1>

        <div className="space-y-8 font-body text-effluve-nero">
          <section>
            <h2 className="text-xl font-semibold mb-3">Politique de retour</h2>
            <p className="text-sm leading-relaxed">
              Vous disposez de <strong>14 jours</strong> à compter de la réception de votre commande pour nous
              retourner un article. Les articles doivent être non portés, non lavés et dans leur emballage d&apos;origine.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Comment effectuer un retour</h2>
            <ol className="space-y-2 text-sm leading-relaxed list-decimal list-inside">
              <li>Connectez-vous à votre compte et accédez à vos commandes.</li>
              <li>Sélectionnez l&apos;article à retourner et indiquez la raison.</li>
              <li>Imprimez l&apos;étiquette de retour fournie par email.</li>
              <li>Déposez le colis dans un point relais ou bureau de poste.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Remboursement</h2>
            <p className="text-sm leading-relaxed">
              Le remboursement est effectué dans un délai de <strong>5 à 10 jours ouvrés</strong> après réception
              du retour, sur votre moyen de paiement initial.
            </p>
          </section>

          <Link
            href="/account/returns"
            className="inline-block mt-4 px-6 py-3 bg-effluve-black text-effluve-white text-xs uppercase tracking-[0.2em] hover:bg-effluve-vanilla hover:text-effluve-nero transition-colors"
          >
            Faire une demande de retour
          </Link>
        </div>
      </div>
    </main>
  );
}
