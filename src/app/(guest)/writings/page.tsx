import type { Metadata } from "next";
import WritingsClient from "./_components/writings-client";
import { getWritingsData } from "@/lib/server/get-writings-data";

const baseUrl = "https://thebibie.vercel.app";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Tulisan",
  description: "Cerita tentang pertumbuhan dan penemuan — tulisan tentang ide, pemikiran, dan pengalaman.",
  alternates: {
    canonical: `${baseUrl}/writings`,
  },
  openGraph: {
    title: "Tulisan | The Bibi",
    description: "Cerita tentang pertumbuhan dan penemuan — tulisan tentang ide, pemikiran, dan pengalaman.",
    url: `${baseUrl}/writings`,
    images: [{ url: "/profile.png", width: 1080, height: 1440, alt: "The Bibi" }],
  },
  twitter: {
    title: "Tulisan | The Bibi",
    description: "Cerita tentang pertumbuhan dan penemuan — tulisan tentang ide, pemikiran, dan pengalaman.",
    images: ["/profile.png"],
  },
};

export default async function WritingsPage() {
  const { writings, meta, categories, tags } = await getWritingsData();
  return (
    <WritingsClient
      initialWritings={{ data: writings, meta }}
      initialCategories={{ success: true, data: categories }}
      initialTags={{ success: true, data: tags }}
    />
  );
}
