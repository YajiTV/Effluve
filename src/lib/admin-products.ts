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
  isActive: boolean;
};

export type ProductPayload = {
  name: string;
  description?: string;
  priceCents: number;
  imageUrl?: string;
  category: ProductCategory;
  stock: number;
  isActive: boolean;
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
      isActive: true,
    },
  });
  return rows;
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
