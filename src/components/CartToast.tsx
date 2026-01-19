"use client";

import { useEffect, useState } from "react";
import { CheckCircle, X } from "lucide-react";

type ToastVariant = "success" | "info" | "danger";

type Props = {
  title: string;
  message: string;
  variant?: ToastVariant;
  onClose: () => void;
  durationMs?: number;
};

export default function CartToast({
  title,
  message,
  variant = "success",
  onClose,
  durationMs = 2200,
}: Props) {
  const [closing, setClosing] = useState(false);

  const close = () => {
    if (closing) return;
    setClosing(true);
    // Doit matcher la durée de --animate-cart-toast-out (180ms)
    window.setTimeout(() => onClose(), 180);
  };

  useEffect(() => {
    const t = window.setTimeout(() => close(), durationMs);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationMs]);

  const pill =
    variant === "success"
      ? "text-green-700"
      : variant === "danger"
        ? "text-red-700"
        : "text-angora-nero";

  const iconBg =
    variant === "success"
      ? "bg-green-100"
      : variant === "danger"
        ? "bg-red-100"
        : "bg-angora-vanilla/20";

  const iconColor =
    variant === "success"
      ? "text-green-700"
      : variant === "danger"
        ? "text-red-700"
        : "text-angora-nero";

  return (
    <div className="fixed top-24 right-6 z-[100]">
      <div
        className={[
          "bg-angora-white border border-angora-vanilla shadow-2xl p-6 max-w-sm flex items-start gap-4",
          closing ? "animate-cart-toast-out" : "animate-cart-toast-in",
        ].join(" ")}
        role="status"
        aria-live="polite"
      >
        {/* Croix à gauche */}
        <button
          onClick={close}
          className="shrink-0 -ml-1 -mt-1 p-1 hover:bg-angora-vanilla/20 rounded-full transition-colors"
          aria-label="Fermer la notification"
        >
          <X className="w-4 h-4 text-angora-nero" strokeWidth={1.5} />
        </button>

        <div
          className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center shrink-0`}
        >
          <CheckCircle className={`w-6 h-6 ${iconColor}`} strokeWidth={2} />
        </div>

        <div className="flex-1">
          <p className={`font-body text-xs uppercase tracking-[0.15em] ${pill} mb-1`}>
            {title}
          </p>
          <p className="font-body text-sm text-angora-black">{message}</p>
        </div>
      </div>
    </div>
  );
}
