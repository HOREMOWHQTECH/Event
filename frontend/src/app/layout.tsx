import type { Metadata, Viewport } from "next";
import { Onest, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import { SITE_CONFIG } from "@/config/site";
import { InstallPromptGate } from "@/components/ui/install-prompt-gate";

const onest = Onest({
  subsets: ["latin"],
  variable: "--font-onest",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const shareImage = "/images/conference_flyer.png";

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  title: {
    template: "%s | IHGC 2026 — Horemow",
    default: `${SITE_CONFIG.eventTitle} — ${SITE_CONFIG.shortBrandName}`,
  },
  description: `${SITE_CONFIG.eventTitle}. Theme: "${SITE_CONFIG.theme}". ${SITE_CONFIG.datesText} at ${SITE_CONFIG.venue.name}, ${SITE_CONFIG.venue.location}.`,
  openGraph: {
    title: SITE_CONFIG.eventTitle,
    description: `Theme: "${SITE_CONFIG.theme}". ${SITE_CONFIG.datesText}.`,
    type: "website",
    locale: "en_NG",
    images: [{ url: shareImage, alt: `Official flyer for ${SITE_CONFIG.eventTitle}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.eventTitle,
    description: `Theme: "${SITE_CONFIG.theme}". ${SITE_CONFIG.datesText}.`,
    images: [shareImage],
  },
};

export const viewport: Viewport = {
  themeColor: "#0E1020",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${onest.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-white text-[#4b5563] antialiased selection:bg-[#0e7a6e] selection:text-white">
        <InstallPromptGate />
        {children}
      </body>
    </html>
  );
}