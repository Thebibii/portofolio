import type { Metadata } from "next";

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
    canonical: "https://thebibie.vercel.app/guestbook",
  },
};

export default function GuestbookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
