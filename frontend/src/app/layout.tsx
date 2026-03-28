import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DealDrop — Save More, Waste Less",
  description:
    "Hyperlocal flash-sale marketplace. Discover near-expiry deals from local retailers, reserve instantly, and pick up fresh savings.",
  themeColor: "#F4500B",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-surface text-charcoal min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
