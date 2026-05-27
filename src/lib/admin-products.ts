import { prisma } from "@/lib/prisma";
import { ProductCategory } from "@prisma/client";

export type AdminProduct = {
  id: number;
  name: string;
  description: string | null;
  priceCents: number;
  imageUrl: string | null;
  category: ProductCategory;
  stock: number;
  stockAlert: number;
  isActive: boolean;
  sizes: string | null;
  extraImages: string | null;
};

export type ProductPayload = {
  name: string;
  description?: string;
  priceCents: number;
  imageUrl?: string;
  category: ProductCategory;
  stock: number;
  stockAlert?: number;
  isActive: boolean;
  sizes?: string | null;
  extraImages?: string | null;
};

export async function getAllProductsForAdmin(): Promise<AdminProduct[]> {
  const rows = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      priceCents: true,
      imageUrl: true,
      category: true,
      stock: true,
      stockAlert: true,
      isActive: true,
      sizes: true,
      extraImages: true,
    },
  });
  return rows.map((r) => ({ ...r, sizes: r.sizes ?? null, extraImages: r.extraImages ?? null }));
}

export async function createProduct(data: ProductPayload) {
  return prisma.product.create({ data });
}

export async function updateProduct(id: number, data: Partial<ProductPayload>) {
  return prisma.product.update({ where: { id }, data });
}

export async function deleteProduct(id: number) {
  return prisma.product.delete({ where: { id } });
}
