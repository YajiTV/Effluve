import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToastProvider from "@/components/ui/ToastProvider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "EFFLUVE",
    template: "%s | EFFLUVE",
  },
  description: "EFFLUVE - Boutique e-commerce de parfums.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-dvh bg-effluve-white text-effluve-black">
        <ToastProvider />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
