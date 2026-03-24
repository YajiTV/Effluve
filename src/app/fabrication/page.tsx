export default function FabricationPage() {
  return (
    <main className="min-h-screen bg-effluve-white px-6 lg:px-12 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-title text-5xl text-effluve-black mb-8">Fabrication</h1>

        <div className="space-y-6 font-body text-effluve-nero text-sm leading-relaxed">
          <p>
            Toutes nos pièces sont conçues dans notre atelier parisien, puis fabriquées par des manufactures
            partenaires situées en France, en Italie et au Portugal.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-effluve-black mb-3">Nos matières premières</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>Laine mérinos certifiée ZQ</li>
              <li>Cachemire grade A issu d&apos;élevages contrôlés</li>
              <li>Soie naturelle OEKO-TEX®</li>
              <li>Lin et coton biologiques certifiés GOTS</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-effluve-black mb-3">Nos ateliers</h2>
            <p>
              Nous travaillons exclusivement avec des ateliers ayant signé notre charte de production responsable.
              Chaque atelier fait l&apos;objet d&apos;un audit annuel indépendant.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
