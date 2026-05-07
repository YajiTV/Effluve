import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE = "https://effluve.fr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, createdAt: true },
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/women`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/men`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/collection`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/new-arrivals`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/promotions`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE}/search`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/our-story`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/our-values`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/shipping`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/returns`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/size-guide`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/legal-notice`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE}/products/${p.id}`,
    lastModified: p.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes];
}
