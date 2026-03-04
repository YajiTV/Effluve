import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getCartItemsByUserId } from "@/lib/cart";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const items = await getCartItemsByUserId(user.id);
  return NextResponse.json(items);
}
