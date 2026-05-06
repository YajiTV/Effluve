export default function GuideTaillesPage() {
  return (
    <main className="min-h-screen bg-effluve-white px-6 lg:px-12 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-title text-5xl text-effluve-black mb-8">Guide des tailles</h1>

        <div className="space-y-10 font-body text-effluve-nero">
          <section>
            <h2 className="text-xl font-semibold mb-4">Femme</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-6 font-medium">Taille FR</th>
                    <th className="text-left py-2 pr-6 font-medium">Tour de poitrine (cm)</th>
                    <th className="text-left py-2 pr-6 font-medium">Tour de taille (cm)</th>
                    <th className="text-left py-2 font-medium">Tour de hanches (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[["34 / XS", "80–84", "60–64", "86–90"], ["36 / S", "84–88", "64–68", "90–94"], ["38 / M", "88–92", "68–72", "94–98"], ["40 / L", "92–96", "72–76", "98–102"], ["42 / XL", "96–100", "76–80", "102–106"]].map(([t, p, ta, h]) => (
                    <tr key={t}>
                      <td className="py-2 pr-6 font-medium">{t}</td>
                      <td className="py-2 pr-6">{p}</td>
                      <td className="py-2 pr-6">{ta}</td>
                      <td className="py-2">{h}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Homme</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-6 font-medium">Taille FR</th>
                    <th className="text-left py-2 pr-6 font-medium">Tour de poitrine (cm)</th>
                    <th className="text-left py-2 font-medium">Tour de taille (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[["S", "88–92", "74–78"], ["M", "92–96", "78–82"], ["L", "96–100", "82–86"], ["XL", "100–104", "86–90"], ["XXL", "104–108", "90–94"]].map(([t, p, ta]) => (
                    <tr key={t}>
                      <td className="py-2 pr-6 font-medium">{t}</td>
                      <td className="py-2 pr-6">{p}</td>
                      <td className="py-2">{ta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <p className="text-xs text-gray-500">
            En cas de doute, nous recommandons de prendre la taille supérieure. Notre équipe est disponible pour vous conseiller.
          </p>
        </div>
      </div>
    </main>
  );
}
