import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import JsonLd from "@/components/seo/json-ld";
import { articleSchema } from "@/components/seo/schemas/article";
import BlogDetailClient from "./_components/blog-detail-client";

type Props = {
  params: Promise<{ slug: string }>;
};

const baseUrl = "https://thebibie.vercel.app";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await prisma.post.findFirst({
    where: { slug, type: "BLOG" },
    select: { title: true, excerpt: true, coverImage: true },
  });

  if (!blog) return { title: "Blog Not Found" };

  return {
    title: blog.title,
    description: blog.excerpt ?? undefined,
    openGraph: {
      title: blog.title,
      description: blog.excerpt ?? undefined,
      url: `${baseUrl}/blogs/${slug}`,
      type: "article",
      images: blog.coverImage
        ? [{ url: blog.coverImage }]
        : [{ url: "/profile.png", width: 512, height: 512, alt: "The Bibi" }],
    },
    twitter: {
      title: blog.title,
      description: blog.excerpt ?? undefined,
      images: blog.coverImage ? [blog.coverImage] : ["/profile.png"],
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;

  const blog = await prisma.post.findUnique({
    where: { slug, type: "BLOG" },
    include: {
      tags: {
        select: { tag: { select: { name: true, slug: true } } },
      },
      _count: { select: { likes: true } },
    },
  });

  if (!blog) notFound();

  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "127.0.0.1";

  const likedByMe = !!(await prisma.like.findUnique({
    where: { ipAddress_postId: { ipAddress: ip, postId: blog.id } },
    select: { id: true },
  }));

  const serialized = {
    slug: blog.slug,
    title: blog.title,
    excerpt: blog.excerpt,
    content: blog.content,
    coverImage: blog.coverImage,
    viewCount: blog.viewCount,
    readingTime: blog.readingTime,
    tags: blog.tags,
    createdAt: blog.createdAt.toISOString(),
    updatedAt: blog.updatedAt.toISOString(),
    likedByMe,
    _count: { likes: blog._count.likes },
  };

  return (
    <>
      <JsonLd
        schema={articleSchema({
          headline: blog.title,
          description: blog.excerpt ?? undefined,
          image: blog.coverImage ?? `${baseUrl}/profile.png`,
          datePublished: blog.createdAt.toISOString(),
          dateModified: blog.updatedAt.toISOString(),
          url: `${baseUrl}/blogs/${blog.slug}`,
          authorName: "Habibie Bayezid Wildan",
        })}
      />
      <BlogDetailClient post={serialized} slug={slug} />
    </>
  );
}
