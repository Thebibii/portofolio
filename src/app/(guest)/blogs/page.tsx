import type { Metadata } from "next";
import BlogsClient from "./_components/blogs-client";
import { getBlogsData } from "@/lib/server/get-blogs-data";

const baseUrl = "https://thebibie.vercel.app";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog",
  description: "Cerita tentang pertumbuhan dan penemuan — tulisan blog tentang pengembangan, teknologi, dan kehidupan.",
  alternates: {
    canonical: `${baseUrl}/blogs`,
  },
  openGraph: {
    title: "Blog | The Bibi",
    description: "Cerita tentang pertumbuhan dan penemuan — tulisan blog tentang pengembangan, teknologi, dan kehidupan.",
    url: `${baseUrl}/blogs`,
    images: [{ url: "/profile.png", width: 1080, height: 1440, alt: "The Bibi" }],
  },
  twitter: {
    title: "Blog | The Bibi",
    description: "Cerita tentang pertumbuhan dan penemuan — tulisan blog tentang pengembangan, teknologi, dan kehidupan.",
    images: ["/profile.png"],
  },
};

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
