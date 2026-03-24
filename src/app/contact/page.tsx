export default function ContactPage() {
  return (
    <main className="min-h-screen bg-effluve-white px-6 lg:px-12 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-title text-5xl text-effluve-black mb-8">Contact</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 font-body text-effluve-nero">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-effluve-black">Nous écrire</h2>
            <p className="text-sm leading-relaxed">
              Notre équipe répond à toutes les demandes du lundi au vendredi, de 9h à 18h.
            </p>
            <a
              href="mailto:contact@effluve.fr"
              className="text-sm underline hover:text-effluve-black transition-colors"
            >
              contact@effluve.fr
            </a>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-effluve-black">Nous appeler</h2>
            <p className="text-sm leading-relaxed">
              Service client disponible du lundi au vendredi, de 10h à 17h.
            </p>
            <p className="text-sm font-medium">+33 1 00 00 00 00</p>
          </section>

          <section className="space-y-4 lg:col-span-2">
            <h2 className="text-xl font-semibold text-effluve-black">Adresse</h2>
            <p className="text-sm leading-relaxed">
              EFFLUVE SAS<br />
              12 rue du Faubourg Saint-Honoré<br />
              75008 Paris — France
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
