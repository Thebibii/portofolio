import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import JsonLd from "@/components/seo/json-ld";
import { articleSchema } from "@/components/seo/schemas/article";
import WritingDetailClient from "./_components/writing-detail-client";

type Props = {
  params: Promise<{ slug: string }>;
};

const baseUrl = "https://thebibie.vercel.app";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const writing = await prisma.post.findFirst({
    where: { slug, type: "WRITING" },
    select: { title: true, excerpt: true, coverImage: true },
  });

  if (!writing) return { title: "Writing Not Found" };

  return {
    title: writing.title,
    description: writing.excerpt ?? undefined,
    openGraph: {
      title: writing.title,
      description: writing.excerpt ?? undefined,
      url: `${baseUrl}/writings/${slug}`,
      type: "article",
      images: writing.coverImage
        ? [{ url: writing.coverImage }]
        : [{ url: "/profile.png", width: 512, height: 512, alt: "The Bibi" }],
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

  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "127.0.0.1";

  const likedByMe = !!(await prisma.like.findUnique({
    where: { ipAddress_postId: { ipAddress: ip, postId: writing.id } },
    select: { id: true },
  }));

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
    likedByMe,
    _count: { likes: writing._count.likes },
  };

  return (
    <>
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
      <WritingDetailClient post={serialized} slug={slug} />
    </>
  );
}
