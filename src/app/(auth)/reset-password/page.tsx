import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyResetToken } from "@/lib/auth";
import ResetPasswordClient from "./ResetPasswordClient";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  const jar = await cookies();
  const resetToken = jar.get("effluve_reset")?.value;

  if (!resetToken) redirect("/login");

  const userId = await verifyResetToken(resetToken);
  if (!userId) redirect("/login?error=reset_expired");

  return <ResetPasswordClient />;
}
