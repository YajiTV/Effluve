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
  icons: {
    icon: '/icon/favicon.ico'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-dvh bg-effluve-white text-effluve-black">
        <ToastProvider />
        <div className="print:hidden"><Header /></div>
        {children}
        <div className="print:hidden"><Footer /></div>
      </body>
    </html>
  );
}
