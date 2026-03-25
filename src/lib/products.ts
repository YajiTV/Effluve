import type { ProductCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type Product = {
  id: number;
  name: string;
  description: string | null;
  priceCents: number;
  imageUrl: string | null;
  category: "homme" | "femme" | "accessoires";
  isActive: 0 | 1;
};

function toProduct(row: {
  id: number;
  name: string;
  description: string | null;
  priceCents: number;
  imageUrl: string | null;
  category: ProductCategory;
  isActive: boolean;
}): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    priceCents: row.priceCents,
    imageUrl: row.imageUrl ?? null,
    category: row.category as Product["category"],
    isActive: row.isActive ? 1 : 0,
  };
}

export async function getProductsByCategory(category: "homme" | "femme") {
  const rows = await prisma.product.findMany({
    where: { category, isActive: true },
    orderBy: { id: "desc" },
  });

  return rows.map(toProduct);
}

export async function getProductsByCategories(categories: ("homme" | "femme")[]) {
  const rows = await prisma.product.findMany({
    where: { category: { in: categories }, isActive: true },
    orderBy: [{ category: "asc" }, { id: "desc" }],
  });

  return rows.map(toProduct);
}

export async function searchProducts(query: string, limit = 48) {
  const safeQuery = String(query ?? "").trim();
  const rows = await prisma.product.findMany({
    where: safeQuery
      ? {
          isActive: true,
          OR: [
            { name: { contains: safeQuery } },
            { description: { contains: safeQuery } },
          ],
        }
      : { isActive: true },
    orderBy: { id: "desc" },
    take: Number(limit),
  });

  return rows.map(toProduct);
}
