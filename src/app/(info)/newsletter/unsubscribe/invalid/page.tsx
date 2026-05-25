export default function UnsubscribeInvalidPage() {
  return (
    <main className="min-h-screen bg-effluve-white px-6 lg:px-12 py-24">
      <div className="max-w-lg mx-auto text-center">
        <h1 className="font-title text-4xl text-effluve-black mb-6">Lien invalide</h1>
        <p className="text-base text-effluve-nero leading-relaxed">
          Lien de désinscription invalide ou déjà utilisé.
        </p>
        <p className="mt-4 text-sm text-neutral-400">
          Si tu souhaites te désinscrire, contacte-nous à{" "}
          <a href="mailto:contact@effluve.fr" className="underline">
            contact@effluve.fr
          </a>
          .
        </p>
        <a
          href="/"
          className="mt-10 inline-block text-sm underline text-effluve-nero hover:text-effluve-black transition-colors"
        >
          Retourner à l&apos;accueil
        </a>
      </div>
    </main>
  );
}
