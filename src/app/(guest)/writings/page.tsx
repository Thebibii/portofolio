import type { Metadata } from "next";
import WritingsClient from "./_components/writings-client";

const baseUrl = "https://thebibie.vercel.app";

export const metadata: Metadata = {
  title: "Writings",
  description: "A story of growth and discovery — writings about ideas, thoughts, and experiences.",
  openGraph: {
    title: "Writings | The Bibi",
    description: "A story of growth and discovery — writings about ideas, thoughts, and experiences.",
    url: `${baseUrl}/writings`,
    images: [{ url: "/profile.png", width: 512, height: 512, alt: "The Bibi" }],
  },
  twitter: {
    title: "Writings | The Bibi",
    description: "A story of growth and discovery — writings about ideas, thoughts, and experiences.",
    images: ["/profile.png"],
  },
};

export default function WritingsPage() {
  return <WritingsClient />;
}
