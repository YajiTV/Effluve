import CategoryPage from "@/components/product/CategoryPage";

export const dynamic = "force-dynamic";

export default async function FemmePage() {
  return (
    <CategoryPage
      title="Femme"
      description="Silhouettes élégantes, matières premium et finitions nettes."
      category="femme"
      glowClassName="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-linear-to-b from-neutral-200/60 to-transparent blur-3xl"
      emptyTitle="Aucun produit femme pour le moment."
      emptyHint={
        <>
          Ajoute un produit dans la table <code className="font-mono">products</code> avec{" "}
          <code className="font-mono">category=&apos;femme&apos;</code>.
        </>
      }
    />
  );
}
