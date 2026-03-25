import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mentions légales" };

const SECTIONS = [
  {
    titre: "Éditeur du site",
    contenu: [
      "Raison sociale : EFFLUVE SAS",
      "Siège social : 12 rue de la Paix, 75002 Paris",
      "Capital social : 10 000 €",
      "SIRET : 000 000 000 00000",
      "RCS Paris : 000 000 000",
      "Directeur de la publication : Équipe EFFLUVE",
      "Contact : contact@effluve.fr",
    ],
  },
  {
    titre: "Hébergement",
    contenu: [
      "Hébergeur : Vercel Inc.",
      "Adresse : 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis",
      "Site : vercel.com",
    ],
  },
  {
    titre: "Propriété intellectuelle",
    contenu: [
      "L'ensemble des contenus présents sur ce site (textes, images, logos, vidéos) est la propriété exclusive d'EFFLUVE ou de ses partenaires et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.",
      "Toute reproduction, représentation, modification ou exploitation, totale ou partielle, sans autorisation expresse est interdite.",
    ],
  },
  {
    titre: "Responsabilité",
    contenu: [
      "EFFLUVE s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, EFFLUVE ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition.",
      "EFFLUVE se réserve le droit de corriger, à tout moment et sans préavis, le contenu de ce site.",
    ],
  },
  {
    titre: "Cookies",
    contenu: [
      "Ce site utilise des cookies strictement nécessaires au bon fonctionnement de la navigation (session, panier). Aucun cookie publicitaire ou de tracking tiers n'est déposé sans votre consentement.",
    ],
  },
  {
    titre: "Litiges",
    contenu: [
      "Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux compétents seront ceux du ressort de Paris.",
    ],
  },
];

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-effluve-white px-6 lg:px-12 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-title text-5xl text-effluve-black mb-2">Mentions légales</h1>
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
