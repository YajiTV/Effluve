import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/newsletter/unsubscribe/invalid", req.url));
  }

  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { unsubscribeToken: token },
  });

  if (!subscriber) {
    return NextResponse.redirect(new URL("/newsletter/unsubscribe/invalid", req.url));
  }

  await prisma.newsletterSubscriber.delete({
    where: { id: subscriber.id },
  });

  return NextResponse.redirect(new URL("/newsletter/unsubscribe", req.url));
}
