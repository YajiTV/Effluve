import { prisma } from "@/lib/prisma";

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

export function normalizeAddressValue(value: unknown, maxLen: number) {
  return String(value ?? "").trim().slice(0, maxLen);
}

function splitName(fullName: string) {
  const [firstName = "", ...rest] = String(fullName).trim().split(/\s+/).filter(Boolean);
  return { firstName, lastName: rest.join(" ") };
}

export async function getUserAddresses(userId: number): Promise<Address[]> {
  const rows = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { id: "desc" }],
  });

  return rows.map((row) => {
    const { firstName, lastName } = splitName(row.name);
    return {
      id: row.id,
      firstName,
      lastName,
      line1: row.street,
      line2: null,
      postalCode: row.zipcode,
      city: row.city,
      country: row.country ?? "France",
      phone: "",
      isDefaultShipping: row.isDefault,
      isDefaultBilling: row.isDefault,
    };
  });
}

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
    isDefaultShipping,
    isDefaultBilling,
  } = params;

  const isDefault = isDefaultShipping || isDefaultBilling;
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const street = [line1, line2].filter(Boolean).join(" ").trim();

  const created = await prisma.$transaction(async (tx) => {
    if (isDefault) {
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return tx.address.create({
      data: {
        userId,
        name: fullName || firstName,
        street,
        city,
        zipcode: postalCode,
        country,
        isDefault,
      },
      select: { id: true },
    });
  });

  return created.id;
}
