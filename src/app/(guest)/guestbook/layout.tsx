import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo/site";

const DESCRIPTION =
  "Buku tamu untuk berbagi pemikiran, masukan, atau sekadar menyapa.";

export const metadata: Metadata = {
  title: "Buku Tamu",
  description: DESCRIPTION,
  openGraph: {
    title: "Buku Tamu | The Bibi",
    description: DESCRIPTION,
  },
  alternates: {
    canonical: absoluteUrl("/guestbook"),
  },
};

export default function GuestbookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
