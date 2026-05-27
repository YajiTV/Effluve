import CategoryPage from "@/components/product/CategoryPage";

export const dynamic = "force-dynamic";

export default async function HommePage() {
  return (
    <CategoryPage
      title="Homme"
      description="Pièces essentielles, coupes propres et matières sélectionnées."
      category="homme"
      glowClassName="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-b from-neutral-200/60 to-transparent blur-3xl"
      emptyTitle="Aucun produit homme pour le moment."
      emptyHint={
        <>
          Ajoute un produit dans la table <code className="font-mono">products</code> pour le
          voir ici.
        </>
      }
    />
  );
}
