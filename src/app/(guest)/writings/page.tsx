import type { Metadata } from "next";
import WritingsClient from "./_components/writings-client";
import { getWritingsData } from "@/lib/server/get-writings-data";
import { buildListMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

export const metadata: Metadata = buildListMetadata({
  title: "Tulisan",
  description:
    "Cerita tentang pertumbuhan dan penemuan — tulisan tentang ide, pemikiran, dan pengalaman.",
  path: "/writings",
});

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
