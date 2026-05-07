import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NewsletterSender from "@/components/admin/NewsletterSender";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin/newsletter");
  if (user.role !== "admin" && user.role !== "superadmin") redirect("/account");

  const count = await prisma.newsletterSubscriber.count();

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-title text-4xl text-black">Newsletter</h1>
            <p className="mt-2 text-sm text-neutral-500">
              {count} inscrit{count > 1 ? "s" : ""} dans la base de données.
            </p>
          </div>
          <a
            href="/api/admin/newsletter/export"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 shrink-0 items-center rounded-xl border border-neutral-300 px-4 text-sm font-semibold text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 transition-colors"
          >
            Exporter CSV
          </a>
        </div>

        <NewsletterSender subscriberCount={count} />
      </div>
    </main>
  );
}
