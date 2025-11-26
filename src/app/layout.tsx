import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
    title: "Angora",
    description: "Angora - Mode élégante, minimaliste, 100% coton et laine, made in France.",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fr">
        <body>
        <Header />
        <div className="pt-16">
            {children}
        </div>
        </body>
        </html>
    );
}
