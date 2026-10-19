import type { Metadata } from "next";
import BlogsClient from "./_components/blogs-client";
import { getBlogsData } from "@/lib/server/get-blogs-data";
import { buildListMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

export const metadata: Metadata = buildListMetadata({
  title: "Blog",
  description:
    "Cerita tentang pertumbuhan dan penemuan — tulisan blog tentang pengembangan, teknologi, dan kehidupan.",
  path: "/blogs",
});

export default async function BlogsPage() {
  const { blogs, meta, categories, tags } = await getBlogsData();
  return (
    <BlogsClient
      initialBlogs={{ data: blogs, meta }}
      initialCategories={{ success: true, data: categories }}
      initialTags={{ success: true, data: tags }}
    />
  );
}
