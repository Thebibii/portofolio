import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Statistik",
  description:
    "Statistik dan analitik situs — dilihat, disukai, dan metrik keterlibatan untuk blog, tulisan, dan projek.",
  openGraph: {
    title: "Statistik | The Bibi",
    description:
      "Statistik dan analitik situs — dilihat, disukai, dan metrik keterlibatan untuk blog, tulisan, dan projek.",
  },
  alternates: {
    canonical: "https://thebibie.vercel.app/statistics",
  },
};

export default function StatisticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
