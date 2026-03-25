import type { Metadata } from "next";

export const metadata: Metadata = { title: "Conditions Générales de Vente" };

const SECTIONS = [
  {
    titre: "Article 1 — Objet",
    contenu: [
      "Les présentes Conditions Générales de Vente (CGV) régissent les ventes de produits effectuées par EFFLUVE SAS (ci-après « EFFLUVE ») auprès de tout acheteur (ci-après « le Client ») via le site effluve.fr.",
      "Toute commande implique l'acceptation pleine et entière des présentes CGV.",
    ],
  },
  {
    titre: "Article 2 — Produits",
    contenu: [
      "Les produits proposés à la vente sont ceux figurant sur le site au moment de la commande. EFFLUVE se réserve le droit de modifier à tout moment son catalogue.",
      "Les photographies et descriptions des produits sont données à titre indicatif. De légères variations de teintes peuvent exister selon les écrans.",
    ],
  },
  {
    titre: "Article 3 — Prix",
    contenu: [
      "Les prix sont indiqués en euros toutes taxes comprises (TTC). EFFLUVE se réserve le droit de modifier ses prix à tout moment, étant entendu que le prix applicable est celui en vigueur au moment de la validation de la commande.",
      "Les frais de livraison sont indiqués séparément lors du processus de commande.",
    ],
  },
  {
    titre: "Article 4 — Commande",
    contenu: [
      "La commande est définitivement enregistrée après validation du paiement. Un e-mail de confirmation est envoyé au Client.",
      "EFFLUVE se réserve le droit d'annuler ou de refuser toute commande d'un Client en cas de litige relatif au paiement d'une commande antérieure ou de suspicion de fraude.",
    ],
  },
  {
    titre: "Article 5 — Paiement",
    contenu: [
      "Le paiement s'effectue en ligne par carte bancaire via la plateforme sécurisée Stripe (SSL). Les données bancaires ne sont pas stockées par EFFLUVE.",
      "La commande est traitée après confirmation du paiement par Stripe.",
    ],
  },
  {
    titre: "Article 6 — Livraison",
    contenu: [
      "Les commandes sont expédiées à l'adresse indiquée lors de la commande, dans un délai de 2 à 5 jours ouvrés.",
      "EFFLUVE ne peut être tenu responsable des retards liés aux transporteurs ou à des événements indépendants de sa volonté (grèves, intempéries, etc.).",
      "En cas de colis endommagé ou manquant, le Client doit contacter contact@effluve.fr dans les 48 h suivant la livraison.",
    ],
  },
  {
    titre: "Article 7 — Droit de rétractation",
    contenu: [
      "Conformément à l'article L221-18 du Code de la consommation, le Client dispose d'un délai de 14 jours calendaires à compter de la réception de sa commande pour exercer son droit de rétractation, sans justification.",
      "Les articles doivent être retournés dans leur état d'origine, non portés, avec leurs étiquettes. Les frais de retour sont à la charge du Client.",
      "Le remboursement sera effectué dans un délai de 14 jours suivant la réception du retour.",
    ],
  },
  {
    titre: "Article 8 — Retours et échanges",
    contenu: [
      "En dehors du droit de rétractation légal, EFFLUVE accepte les retours pour défaut de conformité ou vice caché. La demande doit être faite depuis votre espace compte, rubrique « Mes retours ».",
      "Les articles ayant été portés, lavés ou détériorés par le Client ne sont pas éligibles au retour.",
    ],
  },
  {
    titre: "Article 9 — Garanties",
    contenu: [
      "Tous les produits bénéficient de la garantie légale de conformité (articles L217-4 et suivants du Code de la consommation) et de la garantie contre les vices cachés (articles 1641 et suivants du Code civil).",
    ],
  },
  {
    titre: "Article 10 — Responsabilité",
    contenu: [
      "La responsabilité d'EFFLUVE ne saurait être engagée pour les dommages indirects résultant de l'utilisation des produits. En tout état de cause, la responsabilité d'EFFLUVE est limitée au montant de la commande concernée.",
    ],
  },
  {
    titre: "Article 11 — Données personnelles",
    contenu: [
      "Le traitement des données personnelles est décrit dans notre Politique de confidentialité, consultable à l'adresse effluve.fr/confidentialite.",
    ],
  },
  {
    titre: "Article 12 — Droit applicable et litiges",
    contenu: [
      "Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité.",
      "À défaut d'accord, le Client peut recourir à la médiation de la consommation (médiateur FEVAD : mediateurfevad.fr) ou saisir les tribunaux compétents du ressort de Paris.",
    ],
  },
];

export default function CGVPage() {
  return (
    <main className="min-h-screen bg-effluve-white px-6 lg:px-12 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-title text-5xl text-effluve-black mb-2">
          Conditions Générales de Vente
        </h1>
        <p className="font-body text-xs text-gray-400 mb-10">Dernière mise à jour : mars 2026</p>

        <div className="space-y-10 font-body text-effluve-nero text-sm leading-relaxed">
          {SECTIONS.map(({ titre, contenu }) => (
            <section key={titre}>
              <h2 className="font-semibold text-effluve-black text-base mb-3 uppercase tracking-[0.1em]">
                {titre}
              </h2>
              <div className="space-y-2">
                {contenu.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
