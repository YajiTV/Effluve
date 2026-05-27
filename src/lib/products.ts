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
  stock: number;
  sizes: string | null;
};

function toProduct(row: {
  id: number;
  name: string;
  description: string | null;
  priceCents: number;
  imageUrl: string | null;
  category: ProductCategory;
  isActive: boolean;
  stock: number;
  sizes?: string | null;
}): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    priceCents: row.priceCents,
    imageUrl: row.imageUrl ?? null,
    category: row.category as Product["category"],
    isActive: row.isActive ? 1 : 0,
    stock: row.stock,
    sizes: row.sizes ?? null,
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

export async function getProductById(id: number): Promise<Product | null> {
  const row = await prisma.product.findFirst({ where: { id, isActive: true } });
  if (!row) return null;
  return toProduct(row);
}

export async function getLowStockProducts(): Promise<
  Array<{ id: number; name: string; stock: number; stockAlert: number; category: string }>
> {
  const rows = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { stock: "asc" },
    select: { id: true, name: true, stock: true, stockAlert: true, category: true },
  });
  return rows.filter((r) => r.stock <= r.stockAlert);
}

export async function getSuggestedProducts(
  productId: number,
  category: string,
  limit = 4,
): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: {
      isActive: true,
      stock: { gt: 0 },
      category: category as Product["category"],
      id: { not: productId },
    },
    orderBy: { id: "asc" },
  });

  for (let i = rows.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rows[i], rows[j]] = [rows[j], rows[i]];
  }

  return rows.slice(0, limit).map(toProduct);
}

export type SearchFilters = {
  query?: string;
  category?: "homme" | "femme" | "accessoires";
  minPriceCents?: number;
  maxPriceCents?: number;
  size?: string;
  sort?: "newest" | "price_asc" | "price_desc";
  limit?: number;
};

export async function searchProducts(filters: SearchFilters | string, limit = 48) {
  // Rétrocompatibilité : accepte une string ou un objet
  const f: SearchFilters = typeof filters === "string"
    ? { query: filters, limit }
    : { limit, ...filters };

  const safeQuery = String(f.query ?? "").trim();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    isActive: true,
    ...(safeQuery && {
      OR: [
        { name: { contains: safeQuery } },
        { description: { contains: safeQuery } },
      ],
    }),
    ...(f.category && { category: f.category }),
    ...(f.minPriceCents != null && { priceCents: { gte: f.minPriceCents } }),
    ...(f.maxPriceCents != null && {
      priceCents: {
        ...(f.minPriceCents != null ? { gte: f.minPriceCents } : {}),
        lte: f.maxPriceCents,
      },
    }),
    ...(f.size && { sizes: { contains: f.size } }),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderBy: any =
    f.sort === "price_asc"
      ? { priceCents: "asc" }
      : f.sort === "price_desc"
      ? { priceCents: "desc" }
      : { id: "desc" };

  const rows = await prisma.product.findMany({
    where,
    orderBy,
    take: f.limit ?? 48,
  });

  return rows.map(toProduct);
}
