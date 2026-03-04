import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createUserAddress, getUserAddresses, normalizeAddressValue } from "@/lib/addresses";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const addresses = await getUserAddresses(user.id);
  return NextResponse.json(addresses);
}

// Valide puis enregistre une nouvelle adresse utilisateur dans MySQL.
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as
    | {
        firstName?: string;
        lastName?: string;
        line1?: string;
        line2?: string;
        postalCode?: string;
        city?: string;
        country?: string;
        phone?: string;
        isDefaultShipping?: boolean;
        isDefaultBilling?: boolean;
      }
    | null;

  const firstName = normalizeAddressValue(body?.firstName, 80);
  const lastName = normalizeAddressValue(body?.lastName, 80);
  const line1 = normalizeAddressValue(body?.line1, 180);
  const line2 = normalizeAddressValue(body?.line2, 180) || null;
  const postalCode = normalizeAddressValue(body?.postalCode, 20);
  const city = normalizeAddressValue(body?.city, 80);
  const country = normalizeAddressValue(body?.country, 80);
  const phone = normalizeAddressValue(body?.phone, 32);
  const isDefaultShipping = Boolean(body?.isDefaultShipping);
  const isDefaultBilling = Boolean(body?.isDefaultBilling);

  if (!firstName || !lastName || !line1 || !postalCode || !city || !country || !phone) {
    return NextResponse.json({ error: "INVALID_DATA" }, { status: 400 });
  }

  try {
    const id = await createUserAddress({
      userId: user.id,
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
    });

    return NextResponse.json({ ok: true, id });
  } catch {
    return NextResponse.json({ error: "ADDRESS_CREATE_FAILED" }, { status: 500 });
  }
}
