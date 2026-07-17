import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Payment Ledger — Income & Expense Entry",
  description:
    "Track income and expenses — where money came from, where it was spent, and when. Simple, beautiful, and installable as a PWA.",
  manifest: "/manifest.json",
  applicationName: "Payment Ledger",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Payment Ledger",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f8f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1618" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </Providers>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
