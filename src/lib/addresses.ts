import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";

export type Address = {
  id: number;
  firstName: string;
  lastName: string;
  line1: string;
  line2: string | null;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
};

type AddressSchema = "modern" | "legacy";

let schemaPromise: Promise<AddressSchema> | null = null;

export function normalizeAddressValue(value: unknown, maxLen: number) {
  return String(value ?? "").trim().slice(0, maxLen);
}

async function getAddressesSchema(): Promise<AddressSchema> {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const [columns] = await pool.query<RowDataPacket[]>("SHOW COLUMNS FROM addresses");
      const set = new Set(columns.map((column) => String(column.Field)));
      return set.has("first_name") ? "modern" : "legacy";
    })();
  }

  return schemaPromise;
}

function splitName(fullName: string) {
  const [firstName = "", ...rest] = String(fullName).trim().split(/\s+/).filter(Boolean);
  return { firstName, lastName: rest.join(" ") };
}

// Charge les adresses en supportant les deux schémas (legacy et moderne).
export async function getUserAddresses(userId: number): Promise<Address[]> {
  const schema = await getAddressesSchema();

  if (schema === "modern") {
    const [rows] = await pool.query<
      (RowDataPacket & {
        id: number;
        first_name: string;
        last_name: string;
        line1: string;
        line2: string | null;
        postal_code: string;
        city: string;
        country: string;
        phone: string;
        is_default_shipping: number;
        is_default_billing: number;
      })[]
    >(
      `
      SELECT
        id,
        first_name,
        last_name,
        line1,
        line2,
        postal_code,
        city,
        country,
        phone,
        is_default_shipping,
        is_default_billing
      FROM addresses
      WHERE user_id = ?
      ORDER BY is_default_shipping DESC, is_default_billing DESC, id DESC
      `,
      [userId]
    );

    return rows.map((row) => ({
      id: Number(row.id),
      firstName: String(row.first_name),
      lastName: String(row.last_name),
      line1: String(row.line1),
      line2: row.line2 ?? null,
      postalCode: String(row.postal_code),
      city: String(row.city),
      country: String(row.country),
      phone: String(row.phone),
      isDefaultShipping: Boolean(row.is_default_shipping),
      isDefaultBilling: Boolean(row.is_default_billing),
    }));
  }

  const [rows] = await pool.query<
    (RowDataPacket & {
      id: number;
      name: string;
      street: string;
      city: string;
      zipcode: string;
      country: string | null;
      is_default: number;
    })[]
  >(
    `
    SELECT id, name, street, city, zipcode, country, is_default
    FROM addresses
    WHERE user_id = ?
    ORDER BY is_default DESC, id DESC
    `,
    [userId]
  );

  return rows.map((row) => {
    const { firstName, lastName } = splitName(row.name);
    return {
      id: Number(row.id),
      firstName,
      lastName,
      line1: String(row.street),
      line2: null,
      postalCode: String(row.zipcode),
      city: String(row.city),
      country: row.country ? String(row.country) : "France",
      phone: "",
      isDefaultShipping: Boolean(row.is_default),
      isDefaultBilling: Boolean(row.is_default),
    };
  });
}

// Enregistre une adresse en tenant compte du format de table existant.
export async function createUserAddress(params: {
  userId: number;
  firstName: string;
  lastName: string;
  line1: string;
  line2: string | null;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}) {
  const {
    userId,
    firstName,
    lastName,
    line1,
    line2,
    postalCode,
    city,
    country,
    phone,
    isDefaultShipping,
    isDefaultBilling,
  } = params;

  const schema = await getAddressesSchema();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    if (schema === "modern") {
      if (isDefaultShipping) {
        await connection.query("UPDATE addresses SET is_default_shipping = 0 WHERE user_id = ?", [userId]);
      }

      if (isDefaultBilling) {
        await connection.query("UPDATE addresses SET is_default_billing = 0 WHERE user_id = ?", [userId]);
      }

      const [result] = await connection.query<ResultSetHeader>(
        `
        INSERT INTO addresses (
          user_id,
          first_name,
          last_name,
          line1,
          line2,
          postal_code,
          city,
          country,
          phone,
          is_default_shipping,
          is_default_billing
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          userId,
          firstName,
          lastName,
          line1,
          line2,
          postalCode,
          city,
          country,
          phone,
          isDefaultShipping ? 1 : 0,
          isDefaultBilling ? 1 : 0,
        ]
      );

      await connection.commit();
      return Number(result.insertId);
    }

    const isDefault = isDefaultShipping || isDefaultBilling;
    if (isDefault) {
      await connection.query("UPDATE addresses SET is_default = 0 WHERE user_id = ?", [userId]);
    }

    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

    const [result] = await connection.query<ResultSetHeader>(
      `
      INSERT INTO addresses (user_id, name, street, city, zipcode, country, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [userId, fullName || firstName, [line1, line2].filter(Boolean).join(" "), city, postalCode, country, isDefault ? 1 : 0]
    );

    await connection.commit();
    return Number(result.insertId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
