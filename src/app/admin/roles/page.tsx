import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import RolesManager from "@/components/admin/RolesManager";

export const dynamic = "force-dynamic";

export default async function RolesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin/roles");
  if (user.role !== "superadmin") redirect("/admin");

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="font-title text-4xl text-black">Gestion des rôles</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Attribuez les rôles aux utilisateurs par adresse email
          </p>
        </div>
        <RolesManager />
      </div>
    </main>
  );
}
