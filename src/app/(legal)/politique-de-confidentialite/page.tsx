import type { Metadata } from "next";

export const metadata: Metadata = { title: "Politique de confidentialité" };

const SECTIONS = [
  {
    titre: "Responsable du traitement",
    contenu: [
      "EFFLUVE SAS, 12 rue pres dici, 31000 Toulouse, contact@effluve.fr",
    ],
  },
  {
    titre: "Données collectées",
    contenu: [
      "Nous collectons les données suivantes lors de votre utilisation du site :",
      "• Données d'identification : nom, prénom, adresse e-mail, mot de passe (chiffré)",
      "• Données de livraison : adresse postale, numéro de téléphone",
      "• Données de commande : historique d'achats, retours, factures",
      "• Données de navigation : cookies de session",
    ],
  },
  {
    titre: "Finalités du traitement",
    contenu: [
      "Vos données sont utilisées pour :",
      "- Gérer votre compte client et vos commandes",
      "-Traiter les paiements (via Stripe, aucune donnée bancaire n'est stockée sur nos serveurs)",
      "- Vous envoyer des confirmations de commande et factures",
      "- Vous adresser notre newsletter si vous y avez consenti",
      "- Respecter nos obligations légales (comptabilité, litiges)",
    ],
  },
  {
    titre: "Base légale",
    contenu: [
      "- Exécution du contrat : traitement des commandes, livraisons, retours",
      "- Consentement : newsletter, cookies non essentiels",
      "- Obligation légale : conservation des données de facturation (10 ans)",
    ],
  },
  {
    titre: "Durée de conservation",
    contenu: [
      "- Données de compte actif : durée de la relation commerciale",
      "- Données de commande et factures : 10 ans (obligation comptable)",
      "- Données newsletter : jusqu'au désabonnement",
      "- Cookies de session : supprimés à la fermeture du navigateur",
    ],
  },
  {
    titre: "Partage des données",
    contenu: [
      "Nous ne vendons jamais vos données. Elles peuvent être partagées avec :",
      "- Stripe (paiement en ligne) politique : stripe.com/fr/privacy",
      "- Prestataires de livraison (transporteurs)",
      "- Hébergeur (YajiTV)",
      "Ces prestataires agissent en tant que sous-traitants et sont soumis à des obligations de confidentialité strictes.",
    ],
  },
  {
    titre: "Vos droits",
    contenu: [
      "Conformément au RGPD, vous disposez des droits suivants :",
      "- Droit d'accès à vos données",
      "- Droit de rectification",
      "- Droit à l'effacement (droit à l'oubli)",
      "- Droit à la portabilité",
      "- Droit d'opposition au traitement",
      "- Droit de retirer votre consentement à tout moment",
      "Pour exercer ces droits : rh@effluve.fr ou via votre espace compte.",
      "Vous pouvez également introduire une réclamation auprès de la CNIL (cnil.fr).",
    ],
  },
  {
    titre: "Sécurité",
    contenu: [
      "Les données sont transmises via HTTPS. Les mots de passe sont stockés de façon chiffrée. Les données bancaires sont gérées exclusivement par Stripe (certifié PCI-DSS) et ne transitent jamais par nos serveurs.",
    ],
  },
];

export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen bg-effluve-white px-6 lg:px-12 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-title text-5xl text-effluve-black mb-2">
          Politique de confidentialité
        </h1>
        <p className="font-body text-xs text-gray-400 mb-10">Dernière mise à jour : mai 2026</p>

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
