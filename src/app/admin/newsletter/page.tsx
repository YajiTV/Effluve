import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NewsletterSender from "@/components/admin/NewsletterSender";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin/newsletter");
  if (user.role !== "admin") redirect("/account");

  const count = await prisma.newsletterSubscriber.count();

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="font-title text-4xl text-black">Newsletter</h1>
          <p className="mt-2 text-sm text-neutral-500">
            {count} inscrit{count > 1 ? "s" : ""} dans la base de données.
          </p>
        </div>

        <NewsletterSender subscriberCount={count} />
      </div>
    </main>
  );
}
