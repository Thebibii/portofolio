import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import JsonLd from "@/components/seo/json-ld";
import { softwareApplicationSchema } from "@/components/seo/schemas/software-application";
import ProjectDetailClient from "./_components/project-detail-client";

type Props = {
  params: Promise<{ slug: string }>;
};

const baseUrl = "https://thebibie.vercel.app";

export const revalidate = 3600;

export async function generateStaticParams() {
  const projects = await prisma.project.findMany({
    select: { slug: true },
  });
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await prisma.project.findFirst({ where: { slug } });

  if (!project) return { title: "Project Not Found" };

  return {
    title: project.title,
    description: project.description ?? undefined,
    alternates: {
      canonical: `${baseUrl}/projects/${slug}`,
    },
    openGraph: {
      title: project.title,
      description: project.description ?? undefined,
      url: `${baseUrl}/projects/${slug}`,
      images: project.image
        ? [{ url: project.image }]
        : [{ url: "/profile.png", width: 512, height: 512, alt: "The Bibi" }],
    },
    twitter: {
      title: project.title,
      description: project.description ?? undefined,
      images: project.image ? [project.image] : ["/profile.png"],
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await prisma.project.findFirst({ where: { slug } });

  if (!project) notFound();

  const serialized = {
    ...project,
    startDate: project.startDate?.toISOString() ?? null,
    endDate: project.endDate?.toISOString() ?? null,
    updatedAt: project.updatedAt.toISOString(),
  };

  return (
    <>
      <JsonLd
        schema={softwareApplicationSchema({
          name: project.title,
          description: project.description ?? undefined,
          url: `${baseUrl}/projects/${project.slug}`,
          image: project.image ?? `${baseUrl}/profile.png`,
          operatingSystem: "Web",
          applicationCategory: "WebApplication",
        })}
      />
      <ProjectDetailClient project={serialized} slug={slug} />
    </>
  );
}
