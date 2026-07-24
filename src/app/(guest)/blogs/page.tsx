import type { Metadata } from "next";
import BlogsClient from "./_components/blogs-client";
import { getBlogsData } from "@/lib/server/get-blogs-data";

const baseUrl = "https://thebibie.vercel.app";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blogs",
  description: "A story of growth and discovery — blog posts about development, tech, and life.",
  alternates: {
    canonical: `${baseUrl}/blogs`,
  },
  openGraph: {
    title: "Blogs | The Bibi",
    description: "A story of growth and discovery — blog posts about development, tech, and life.",
    url: `${baseUrl}/blogs`,
    images: [{ url: "/profile.png", width: 1080, height: 1440, alt: "The Bibi" }],
  },
  twitter: {
    title: "Blogs | The Bibi",
    description: "A story of growth and discovery — blog posts about development, tech, and life.",
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
