import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import JsonLd from "@/components/seo/json-ld";
import { softwareApplicationSchema, breadcrumbSchema } from "@/components/seo/schemas";
import { buildPostMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/seo/site";
import ProjectDetailClient from "./_components/project-detail-client";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

// Hanya 20 project terbaru di-prerender; sisanya dibangun saat diminta.
export const dynamicParams = true;

export async function generateStaticParams() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { slug: true },
  });
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await prisma.project.findFirst({ where: { slug } });

  if (!project) return { title: "Projek Tidak Ditemukan" };

  return buildPostMetadata({
    title: project.title,
    description: project.description ?? undefined,
    path: `/projects/${slug}`,
    image: project.image,
  });
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
        schema={breadcrumbSchema({
          items: [
            { name: "Beranda", url: SITE_URL },
            { name: "Projek", url: `${SITE_URL}/projects` },
            { name: project.title, url: `${SITE_URL}/projects/${project.slug}` },
          ],
        })}
      />
      <JsonLd
        schema={softwareApplicationSchema({
          name: project.title,
          description: project.description ?? undefined,
          url: `${SITE_URL}/projects/${project.slug}`,
          image: project.image ?? `${SITE_URL}/profile.png`,
          operatingSystem: "Web",
          applicationCategory: "WebApplication",
        })}
      />
      <ProjectDetailClient key={slug} project={serialized} slug={slug} />
    </>
  );
}
