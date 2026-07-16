import type { Metadata } from "next";
import BlogsClient from "./_components/blogs-client";

const baseUrl = "https://thebibie.vercel.app";

export const metadata: Metadata = {
  title: "Blogs",
  description: "A story of growth and discovery — blog posts about development, tech, and life.",
  openGraph: {
    title: "Blogs | The Bibi",
    description: "A story of growth and discovery — blog posts about development, tech, and life.",
    url: `${baseUrl}/blogs`,
    images: [{ url: "/profile.png", width: 512, height: 512, alt: "The Bibi" }],
  },
  twitter: {
    title: "Blogs | The Bibi",
    description: "A story of growth and discovery — blog posts about development, tech, and life.",
    images: ["/profile.png"],
  },
};

export default function BlogsPage() {
  return <BlogsClient />;
}
