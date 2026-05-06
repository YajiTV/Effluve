import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getAllProductsForAdmin } from "@/lib/admin-products";
import ProductsManager from "@/components/admin/ProductsManager";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin/products");
  if (user.role !== "admin") redirect("/account");

  const products = await getAllProductsForAdmin();

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="font-title text-4xl text-black">Gestion des produits</h1>
          <p className="mt-2 text-sm text-neutral-500">
            {products.length} produit{products.length > 1 ? "s" : ""} au total
          </p>
        </div>

        <ProductsManager initialProducts={products} />
      </div>
    </main>
  );
}
