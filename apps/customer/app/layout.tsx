import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/context/Providers";

export const metadata: Metadata = {
  title: { template: "%s | AuraZone", default: "AuraZone — Multi-Store Shopping" },
  description: "Shop fashion, home essentials, cosmetics, toys and more at AuraZone — your one-stop multi-store destination.",
  openGraph: {
    siteName: "AuraZone",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F8F8F7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}