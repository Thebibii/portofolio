import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo/site";

const DESCRIPTION =
  "Statistik situs: jumlah dilihat, disukai, dan keterlibatan pada blog, tulisan, dan projek.";

export const metadata: Metadata = {
  title: "Statistik",
  description: DESCRIPTION,
  openGraph: {
    title: "Statistik | The Bibi",
    description: DESCRIPTION,
  },
  alternates: {
    canonical: absoluteUrl("/statistics"),
  },
};

export default function StatisticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
