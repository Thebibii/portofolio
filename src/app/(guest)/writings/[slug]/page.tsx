import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import JsonLd from "@/components/seo/json-ld";
import { articleSchema, breadcrumbSchema } from "@/components/seo/schemas";
import WritingDetailClient from "./_components/writing-detail-client";

type Props = {
  params: Promise<{ slug: string }>;
};

const baseUrl = "https://thebibie.vercel.app";

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { type: "WRITING" },
    select: { slug: true },
  });
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const writing = await prisma.post.findFirst({
    where: { slug, type: "WRITING" },
    select: { title: true, excerpt: true, coverImage: true },
  });

  if (!writing) return { title: "Tulisan Tidak Ditemukan" };

  return {
    title: writing.title,
    description: writing.excerpt ?? undefined,
    alternates: {
      canonical: `${baseUrl}/writings/${slug}`,
    },
    openGraph: {
      title: writing.title,
      description: writing.excerpt ?? undefined,
      url: `${baseUrl}/writings/${slug}`,
      type: "article",
      images: writing.coverImage
        ? [{ url: writing.coverImage }]
        : [{ url: "/profile.png", width: 1080, height: 1440, alt: "The Bibi" }],
    },
    twitter: {
      title: writing.title,
      description: writing.excerpt ?? undefined,
      images: writing.coverImage ? [writing.coverImage] : ["/profile.png"],
    },
  };
}

export default async function WritingDetailPage({ params }: Props) {
  const { slug } = await params;

  const writing = await prisma.post.findUnique({
    where: { slug, type: "WRITING" },
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
            { name: "Beranda", url: baseUrl },
            { name: "Tulisan", url: `${baseUrl}/writings` },
            { name: writing.title, url: `${baseUrl}/writings/${writing.slug}` },
          ],
        })}
      />
      <JsonLd
        schema={articleSchema({
          headline: writing.title,
          description: writing.excerpt ?? undefined,
          image: writing.coverImage ?? `${baseUrl}/profile.png`,
          datePublished: writing.createdAt.toISOString(),
          dateModified: writing.updatedAt.toISOString(),
          url: `${baseUrl}/writings/${writing.slug}`,
          authorName: "Habibie Bayezid Wildan",
        })}
      />
      <WritingDetailClient key={slug} post={serialized} slug={slug} />
    </>
  );
}
