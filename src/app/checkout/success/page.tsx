"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const params = useSearchParams();
  const orderId = Number(params.get("orderId") ?? 0);
  const sessionId = params.get("session_id") ?? "";
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("Validation du paiement...");

  const canConfirm = useMemo(() => Number.isFinite(orderId) && orderId > 0 && !!sessionId, [orderId, sessionId]);

  useEffect(() => {
    if (!canConfirm) return;
    void (async () => {
      const res = await fetch("/api/payment/stripe/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, sessionId }),
      }).catch(() => null);

      if (!res?.ok) {
        setStatus("error");
        setMessage("Le paiement n'a pas pu être confirmé.");
        return;
      }

      setStatus("ok");
      setMessage("Paiement confirmé. Redirection vers le détail de commande...");
      setTimeout(() => {
        router.push(`/account/orders/${orderId}`);
        router.refresh();
      }, 800);
    })();
  }, [canConfirm, orderId, router, sessionId]);

  if (!canConfirm) {
    return (
      <main className="min-h-screen bg-neutral-50 px-4 py-12 sm:px-6 lg:px-12">
        <div className="mx-auto max-w-xl rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-neutral-900">Paiement Stripe (test)</h1>
          <p className="mt-3 text-neutral-700">Paramètres de paiement invalides.</p>
          <div className="mt-6">
            <Link href="/checkout" className="text-sm font-semibold text-neutral-900 underline underline-offset-4">
              Retourner au checkout
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-xl rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-neutral-900">Paiement Stripe (test)</h1>
        <p className="mt-3 text-neutral-700">{message}</p>
        {status === "error" ? (
          <div className="mt-6">
            <Link href="/checkout" className="text-sm font-semibold text-neutral-900 underline underline-offset-4">
              Retourner au checkout
            </Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}
