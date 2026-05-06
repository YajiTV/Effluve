import { redirect } from "next/navigation";
import AdminReturnsTable from "@/components/account/AdminReturnsTable";
import { getSessionUser } from "@/lib/auth";
import { getAllReturnsForAdmin } from "@/lib/returns";

export const dynamic = "force-dynamic";

export default async function AdminReturnsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin/returns");
  if (user.role !== "admin") redirect("/account");

  const rows = await getAllReturnsForAdmin();

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="font-title text-4xl text-black">Dashboard Admin - Retours</h1>
          <p className="mt-2 text-neutral-600">Valide les retours et gère les remboursements.</p>
        </div>

        <AdminReturnsTable rows={rows} />
      </div>
    </main>
  );
}
