import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import JsonLd from "@/components/seo/json-ld";
import { articleSchema, breadcrumbSchema } from "@/components/seo/schemas";
import { buildPostMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/seo/site";
import { serializePost } from "@/lib/serialize";
import BlogDetailClient from "./_components/blog-detail-client";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

// Hanya 20 post terbaru di-prerender; sisanya dibangun saat diminta.
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { type: "BLOG", status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { slug: true },
  });
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await prisma.post.findFirst({
    where: { slug, type: "BLOG", status: "PUBLISHED" },
    select: { title: true, excerpt: true, coverImage: true },
  });

  if (!blog) return { title: "Blog Tidak Ditemukan" };

  return buildPostMetadata({
    title: blog.title,
    description: blog.excerpt ?? undefined,
    path: `/blogs/${slug}`,
    image: blog.coverImage,
    type: "article",
  });
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;

  const blog = await prisma.post.findUnique({
    where: { slug, type: "BLOG", status: "PUBLISHED" },
    include: {
      tags: {
        select: { tag: { select: { name: true, slug: true } } },
      },
      _count: { select: { likes: true } },
    },
  });

  if (!blog) notFound();

  const serialized = serializePost({
    slug: blog.slug,
    title: blog.title,
    excerpt: blog.excerpt,
    content: blog.content,
    coverImage: blog.coverImage,
    viewCount: blog.viewCount,
    readingTime: blog.readingTime,
    tags: blog.tags,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
    likedByMe: false,
    _count: { likes: blog._count.likes },
  });

  return (
    <>
      <JsonLd
        schema={breadcrumbSchema({
          items: [
            { name: "Beranda", url: SITE_URL },
            { name: "Blog", url: `${SITE_URL}/blogs` },
            { name: blog.title, url: `${SITE_URL}/blogs/${blog.slug}` },
          ],
        })}
      />
      <JsonLd
        schema={articleSchema({
          headline: blog.title,
          description: blog.excerpt ?? undefined,
          image: blog.coverImage ?? `${SITE_URL}/profile.png`,
          datePublished: blog.createdAt.toISOString(),
          dateModified: blog.updatedAt.toISOString(),
          url: `${SITE_URL}/blogs/${blog.slug}`,
          authorName: "Habibie Bayezid Wildan",
        })}
      />
      <BlogDetailClient key={slug} post={serialized} slug={slug} />
    </>
  );
}
