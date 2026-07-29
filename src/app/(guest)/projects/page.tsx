import type { Metadata } from "next";
import ProjectsClient from "./_components/projects-client";
import { getProjectsData } from "@/lib/server/get-projects-data";

const baseUrl = "https://thebibie.vercel.app";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Projek",
  description:
    "Jelajahi projek portofolio saya — build unggulan, projek sampingan, dan eksperimen.",
  alternates: {
    canonical: `${baseUrl}/projects`,
  },
  openGraph: {
    title: "Projek | The Bibi",
    description:
      "Jelajahi projek portofolio saya — build unggulan, projek sampingan, dan eksperimen.",
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
    title: "Projek | The Bibi",
    description:
      "Jelajahi projek portofolio saya — build unggulan, projek sampingan, dan eksperimen.",
    images: ["/profile.png"],
  },
};

export default async function ProjectsPage() {
  const { featured, other } = await getProjectsData();
  return <ProjectsClient featured={featured} other={other} />;
}
