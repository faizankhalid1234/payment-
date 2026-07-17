import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "PaisaBook — Payment Entry & Ledger",
  description:
    "Track income and expenses — where money came from, where it was spent, and when. Simple, beautiful, and installable as a PWA.",
  manifest: "/manifest.json",
  applicationName: "PaisaBook",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PaisaBook",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6fc" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0c18" },
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
      <body>
        <Providers>{children}</Providers>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
