import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Buku Tamu",
  description:
    "Tinggalkan pesan — buku tamu untuk pengunjung berbagi pemikiran, masukan, atau sekadar menyapa.",
  openGraph: {
    title: "Buku Tamu | The Bibi",
    description:
      "Tinggalkan pesan — buku tamu untuk pengunjung berbagi pemikiran, masukan, atau sekadar menyapa.",
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
