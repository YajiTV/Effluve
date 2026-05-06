// src/components/ToastProvider.tsx
"use client";
import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 2600,
        className:
          "rounded-xl border border-neutral-200 bg-white text-neutral-900 shadow-lg",
      }}
    />
  );
}
