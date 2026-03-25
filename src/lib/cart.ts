import { prisma } from "@/lib/prisma";

export type CartItem = {
  cartitemid: number;
  quantity: number;
  productid: number;
  name: string;
  pricecents: number;
  imageurl: string | null;
  stock: number;
};

export async function getCartItemsByUserId(userId: number): Promise<CartItem[]> {
  const rows = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { id: "desc" },
  });

  return rows.map((row) => ({
    cartitemid: row.id,
    quantity: row.quantity,
    productid: row.product.id,
    name: row.product.name,
    pricecents: row.product.priceCents,
    imageurl: row.product.imageUrl ?? null,
    stock: row.product.stock,
  }));
}

export async function getCartTotalCents(userId: number): Promise<number> {
  const items = await getCartItemsByUserId(userId);
  return items.reduce((sum, item) => sum + item.pricecents * item.quantity, 0);
}
