import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import JsonLd from "@/components/seo/json-ld";
import { articleSchema } from "@/components/seo/schemas/article";
import BlogDetailClient from "./_components/blog-detail-client";

type Props = {
  params: Promise<{ slug: string }>;
};

const baseUrl = "https://thebibie.vercel.app";

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { type: "BLOG" },
    select: { slug: true },
  });
  return posts.map((post) => ({ slug: post.slug }));
}

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
    alternates: {
      canonical: `${baseUrl}/blogs/${slug}`,
    },
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
    likedByMe: false,
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
      <BlogDetailClient key={slug} post={serialized} slug={slug} />
    </>
  );
}
