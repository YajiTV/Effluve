import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getAllProductsForAdmin } from "@/lib/admin-products";
import { getLowStockProducts } from "@/lib/products";
import ProductsManager from "@/components/admin/ProductsManager";
import BackButton from "@/components/admin/BackButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/connexion?next=/admin/products");
  if (user.role !== "admin" && user.role !== "superadmin") redirect("/compte");

  const [products, lowStockProducts] = await Promise.all([
    getAllProductsForAdmin(),
    getLowStockProducts(),
  ]);

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <BackButton />
          <h1 className="mt-4 font-title text-4xl text-black">Gestion des produits</h1>
          <p className="mt-2 text-sm text-neutral-500">
            {products.length} produit{products.length > 1 ? "s" : ""} au total
          </p>
        </div>

        {lowStockProducts.length > 0 && (
          <div className="rounded border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
            <span className="font-semibold">⚠ {lowStockProducts.length} produit(s) en stock critique :</span>
            <ul className="mt-1 list-inside list-disc">
              {lowStockProducts.map(p => <li key={p.id}>{p.name} — {p.stock} restant(s)</li>)}
            </ul>
          </div>
        )}

        <ProductsManager initialProducts={products} />
      </div>
    </main>
  );
}
