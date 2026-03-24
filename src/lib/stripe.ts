import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "";
export const isStripeConfigured = STRIPE_SECRET_KEY.startsWith("sk_");

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!isStripeConfigured) {
    throw new Error("STRIPE_NOT_CONFIGURED");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
    });
  }
  return stripeClient;
}
