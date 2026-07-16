import type { Metadata } from "next";
import ProjectsClient from "./_components/projects-client";

const baseUrl = "https://thebibie.vercel.app";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Explore my portfolio projects — featured builds, side projects, and experiments.",
  openGraph: {
    title: "Projects | The Bibi",
    description:
      "Explore my portfolio projects — featured builds, side projects, and experiments.",
    url: `${baseUrl}/projects`,
    images: [
      {
        url: "/profile.png",
        width: 512,
        height: 512,
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

export default function ProjectsPage() {
  return <ProjectsClient />;
}
