import "./globals.css";
import Header from "@/components/Header";
import ToastProvider from "@/components/ToastProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-dvh bg-angora-white text-angora-black">
        <ToastProvider />
        <Header />
        {children}
      </body>
    </html>
  );
}
