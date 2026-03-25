import Link from "next/link";
import NewsletterForm from "./NewsletterForm";

const COLLECTION_LINKS = [
  { label: "Femme", href: "/femme" },
  { label: "Homme", href: "/homme" },
  { label: "Collection", href: "/collection" },
  { label: "Nouveautés", href: "/nouveautes" },
  { label: "Promotions", href: "/promotions" },
];

const SERVICE_LINKS = [
  { label: "Livraison", href: "/livraison" },
  { label: "Retours", href: "/retours" },
  { label: "Guide des tailles", href: "/guide-des-tailles" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

const MAISON_LINKS = [
  { label: "Notre histoire", href: "/notre-histoire" },
  { label: "Nos valeurs", href: "/nos-valeurs" },
  { label: "Fabrication", href: "/fabrication" },
  { label: "Engagement", href: "/engagement" },
  { label: "Recrutement", href: "/recrutement" },
];

export default function Footer() {
  return (
    <footer className="mt-20 w-full bg-[#070707] text-[#d2d2d2]">
      <div className="mx-auto w-full max-w-[1800px] px-6 py-8 lg:px-12 lg:py-10">
        <section className="mx-auto flex w-full aspect-[16/9] min-h-[680px] flex-col rounded-2xl border border-[#1a1a1a] bg-[#090909] p-6 sm:p-8 lg:p-12">

          {/* Newsletter */}
          <div className="mx-auto w-full max-w-5xl rounded-2xl border border-[#1f1f1f] bg-[#0d0d0d] p-6 sm:p-8">
            <p className="text-center text-[clamp(1.2rem,2.2vw,2rem)] font-semibold tracking-tight text-[#f2f2f2] blur-[0.35px]">
              Rejoins notre cercle privé
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-[#a8a8a8]">
              Offres exclusives, nouveautés mode et sélections en avant-première.
            </p>
            <NewsletterForm />
          </div>

          <div className="my-8 h-px w-full bg-[#262626]" />

          {/* Navigation columns — COLLECTION left · SERVICE center · MAISON right */}
          <div className="grid flex-1 grid-cols-3 gap-10">
            <FooterCol title="Collection" links={COLLECTION_LINKS} />
            <div className="flex justify-center">
              <FooterCol title="Service" links={SERVICE_LINKS} />
            </div>
            <div className="flex justify-end">
              <FooterCol title="Maison" links={MAISON_LINKS} />
            </div>
          </div>

          {/* Bottom legal */}
          <div className="mt-10 flex items-center justify-end gap-6 border-t border-[#212121] pt-4 text-xs text-[#989898]">
            <Link href="/mentions-legales" className="transition hover:text-[#e8e8e8]">
              Mentions légales
            </Link>
            <Link href="/confidentialite" className="transition hover:text-[#e8e8e8]">
              Politique de confidentialité
            </Link>
            <Link href="/cgv" className="transition hover:text-[#e8e8e8]">
              CGV
            </Link>
          </div>
        </section>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#f0f0f0]">{title}</h3>
      <ul className="mt-4 space-y-3 text-sm text-[#b7b7b7]">
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link href={href} className="transition hover:text-[#e8e8e8]">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
