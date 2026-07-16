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
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thebibie.vercel.app"),
  title: {
    default: "The Bibi — Portfolio",
    template: "%s | The Bibi",
  },
  description: "Personal portfolio showcasing projects, blogs, and writings",
  openGraph: {
    title: "The Bibi — Portfolio",
    description: "Personal portfolio showcasing projects, blogs, and writings",
    url: "https://thebibie.vercel.app",
    siteName: "The Bibi",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/profile.png",
        width: 512,
        height: 512,
        alt: "The Bibi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Bibi — Portfolio",
    description: "Personal portfolio showcasing projects, blogs, and writings",
    images: ["/profile.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/profile.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
