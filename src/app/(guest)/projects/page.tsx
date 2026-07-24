import type { Metadata } from "next";
import ProjectsClient from "./_components/projects-client";
import { getProjectsData } from "@/lib/server/get-projects-data";

const baseUrl = "https://thebibie.vercel.app";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Explore my portfolio projects — featured builds, side projects, and experiments.",
  alternates: {
    canonical: `${baseUrl}/projects`,
  },
  openGraph: {
    title: "Projects | The Bibi",
    description:
      "Explore my portfolio projects — featured builds, side projects, and experiments.",
    url: `${baseUrl}/projects`,
    images: [
      {
        url: "/profile.png",
        width: 1080,
        height: 1440,
        alt: "The Bibi",
      },
    ],
  },
  twitter: {
    title: "Projects | The Bibi",
    description:
      "Explore my portfolio projects — featured builds, side projects, and experiments.",
    images: ["/profile.png"],
  },
};

export default async function ProjectsPage() {
  const { featured, other } = await getProjectsData();
  return <ProjectsClient featured={featured} other={other} />;
}
