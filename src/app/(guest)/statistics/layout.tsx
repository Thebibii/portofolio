import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Statistics",
  description:
    "Site statistics and analytics — views, likes, and engagement metrics for blogs, writings, and projects.",
  openGraph: {
    title: "Statistics | The Bibi",
    description:
      "Site statistics and analytics — views, likes, and engagement metrics for blogs, writings, and projects.",
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
