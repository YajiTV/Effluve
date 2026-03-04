import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";

export type Product = {
  id: number;
  name: string;
  description: string | null;
  priceCents: number;
  imageUrl: string | null;
  category: "homme" | "femme" | "accessoires";
  isActive: 0 | 1;
};

type ProductRow = RowDataPacket & Product;

function toProduct(row: ProductRow): Product {
  return {
    id: Number(row.id),
    name: String(row.name),
    description: row.description ?? null,
    priceCents: Number(row.priceCents),
    imageUrl: row.imageUrl ?? null,
    category: row.category,
    isActive: row.isActive,
  };
}

export async function getProductsByCategory(category: "homme" | "femme") {
  const [rows] = await pool.query<ProductRow[]>(
    `
    SELECT
      id,
      name,
      description,
      pricecents AS priceCents,
      imageurl   AS imageUrl,
      category,
      isactive   AS isActive
    FROM products
    WHERE category = ? AND isactive = 1
    ORDER BY id DESC
    `,
    [category]
  );

  return rows.map(toProduct);
}

export async function getProductsByCategories(categories: ("homme" | "femme")[]) {
  const [rows] = await pool.query<ProductRow[]>(
    `
    SELECT
      id,
      name,
      description,
      pricecents AS priceCents,
      imageurl   AS imageUrl,
      category,
      isactive   AS isActive
    FROM products
    WHERE category IN (${categories.map(() => "?").join(",")}) AND isactive = 1
    ORDER BY category ASC, id DESC
    `,
    categories
  );

  return rows.map(toProduct);
}

export async function searchProducts(query: string, limit = 48) {
  const safeQuery = String(query ?? "").trim();
  const like = `%${safeQuery}%`;

  const [rows] = await pool.query<ProductRow[]>(
    `
    SELECT
      id,
      name,
      description,
      pricecents AS priceCents,
      imageurl   AS imageUrl,
      category,
      isactive   AS isActive
    FROM products
    WHERE isactive = 1
      AND (
        ? = '' OR
        name LIKE ? OR
        description LIKE ?
      )
    ORDER BY id DESC
    LIMIT ${Number(limit)}
    `,
    [safeQuery, like, like]
  );

  return rows.map(toProduct);
}
