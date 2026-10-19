import type { Metadata } from "next";
import ProjectsClient from "./_components/projects-client";
import { getProjectsData } from "@/lib/server/get-projects-data";
import { buildListMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

export const metadata: Metadata = buildListMetadata({
  title: "Projek",
  description:
    "Jelajahi projek portofolio saya — build unggulan, projek sampingan, dan eksperimen.",
  path: "/projects",
});

export default async function ProjectsPage() {
  const { featured, other } = await getProjectsData();
  return <ProjectsClient featured={featured} other={other} />;
}
