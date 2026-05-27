import { Resend } from "resend";

export function getResendClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY manquante dans .env");
  return new Resend(key);
}

export function getFromAddress(): string {
  return process.env.RESEND_FROM ?? "onboarding@resend.dev";
}
