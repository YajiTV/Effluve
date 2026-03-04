import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/account");
  redirect("/admin/returns");
}
