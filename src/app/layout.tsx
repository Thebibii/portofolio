import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { ReactQueryClientProvider } from "@/provider/react-query";
import ProgressProvider from "@/provider/proggres-bar";
import { Toaster } from "sonner";
import { Providers } from "@/provider/next-auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thebibie.vercel.app"),
  title: {
    default: "The Bibi — Portfolio",
    template: "%s | The Bibi",
  },
  description: "Portofolio pribadi Habibie Bayezid Wildan (The Bibi), menampilkan projek, blog, dan tulisan",
  applicationName: "The Bibi",
  openGraph: {
    title: "The Bibi — Portfolio",
    description: "Portofolio pribadi Habibie Bayezid Wildan (The Bibi), menampilkan projek, blog, dan tulisan",
    url: "https://thebibie.vercel.app",
    siteName: "The Bibi",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/profile.png",
        width: 1080,
        height: 1440,
        alt: "The Bibi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Bibi — Portfolio",
    description: "Portofolio pribadi Habibie Bayezid Wildan (The Bibi), menampilkan projek, blog, dan tulisan",
    images: ["/profile.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "google-site-verification": "7bPi6mrRc1Q3pmubF-rmZAIAjlNLG0FloBR3CXCIUYQ",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <ReactQueryClientProvider>
            <ProgressProvider>{children}</ProgressProvider>
            <Toaster closeButton position="top-right" richColors />
          </ReactQueryClientProvider>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
