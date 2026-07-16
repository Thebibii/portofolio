import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://thebibie.vercel.app";

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 1 },
    { url: `${baseUrl}/blogs`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/writings`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/projects`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${baseUrl}/statistics`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
  ];

  let blogEntries: MetadataRoute.Sitemap = [];
  let writingEntries: MetadataRoute.Sitemap = [];
  let projectEntries: MetadataRoute.Sitemap = [];

  try {
    const [blogs, writings, projects] = await Promise.all([
      prisma.post.findMany({
        where: { type: "BLOG" },
        select: { slug: true, updatedAt: true },
      }),
      prisma.post.findMany({
        where: { type: "WRITING" },
        select: { slug: true, updatedAt: true },
      }),
      prisma.project.findMany({
        select: { slug: true, updatedAt: true },
      }),
    ]);

    blogEntries = blogs.map((blog) => ({
      url: `${baseUrl}/blogs/${blog.slug}`,
      lastModified: blog.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    writingEntries = writings.map((writing) => ({
      url: `${baseUrl}/writings/${writing.slug}`,
      lastModified: writing.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    projectEntries = projects.map((project) => ({
      url: `${baseUrl}/projects/${project.slug}`,
      lastModified: project.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Sitemap: gagal memuat data dinamis, fallback ke static pages", error);
  }

  return [
    ...staticPages,
    ...blogEntries,
    ...writingEntries,
    ...projectEntries,
  ];
}
