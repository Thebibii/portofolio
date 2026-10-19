import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import JsonLd from "@/components/seo/json-ld";
import { articleSchema, breadcrumbSchema } from "@/components/seo/schemas";
import { buildPostMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/seo/site";
import WritingDetailClient from "./_components/writing-detail-client";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

// Hanya 20 post terbaru di-prerender; sisanya dibangun saat diminta.
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { type: "WRITING", status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { slug: true },
  });
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const writing = await prisma.post.findFirst({
    where: { slug, type: "WRITING", status: "PUBLISHED" },
    select: { title: true, excerpt: true, coverImage: true },
  });

  if (!writing) return { title: "Tulisan Tidak Ditemukan" };

  return buildPostMetadata({
    title: writing.title,
    description: writing.excerpt ?? undefined,
    path: `/writings/${slug}`,
    image: writing.coverImage,
    type: "article",
  });
}

export default async function WritingDetailPage({ params }: Props) {
  const { slug } = await params;

  const writing = await prisma.post.findUnique({
    where: { slug, type: "WRITING", status: "PUBLISHED" },
    include: {
      tags: {
        select: { tag: { select: { name: true, slug: true } } },
      },
      _count: { select: { likes: true } },
    },
  });

  if (!writing) notFound();

  const serialized = {
    slug: writing.slug,
    title: writing.title,
    excerpt: writing.excerpt,
    content: writing.content,
    coverImage: writing.coverImage,
    viewCount: writing.viewCount,
    readingTime: writing.readingTime,
    tags: writing.tags,
    createdAt: writing.createdAt.toISOString(),
    updatedAt: writing.updatedAt.toISOString(),
    likedByMe: false,
    _count: { likes: writing._count.likes },
  };

  return (
    <>
      <JsonLd
        schema={breadcrumbSchema({
          items: [
            { name: "Beranda", url: SITE_URL },
            { name: "Tulisan", url: `${SITE_URL}/writings` },
            { name: writing.title, url: `${SITE_URL}/writings/${writing.slug}` },
          ],
        })}
      />
      <JsonLd
        schema={articleSchema({
          headline: writing.title,
          description: writing.excerpt ?? undefined,
          image: writing.coverImage ?? `${SITE_URL}/profile.png`,
          datePublished: writing.createdAt.toISOString(),
          dateModified: writing.updatedAt.toISOString(),
          url: `${SITE_URL}/writings/${writing.slug}`,
          authorName: "Habibie Bayezid Wildan",
        })}
      />
      <WritingDetailClient key={slug} post={serialized} slug={slug} />
    </>
  );
}
