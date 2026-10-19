import type { Prisma } from "@prisma/client";

export const postListSelect = {
  slug: true,
  excerpt: true,
  coverImage: true,
  updatedAt: true,
  title: true,
  viewCount: true,
  readingTime: true,
  createdAt: true,
  category: {
    select: { name: true, slug: true },
  },
  tags: {
    select: {
      tag: { select: { name: true, slug: true } },
    },
  },
} satisfies Prisma.PostSelect;

export const postDetailSelect = {
  slug: true,
  excerpt: true,
  coverImage: true,
  updatedAt: true,
  title: true,
  viewCount: true,
  readingTime: true,
  createdAt: true,
  content: true,
  category: {
    select: { name: true, slug: true },
  },
  tags: {
    select: {
      tag: { select: { name: true, slug: true } },
    },
  },
} satisfies Prisma.PostSelect;

export const postCardSelect = {
  title: true,
  excerpt: true,
  viewCount: true,
  readingTime: true,
  coverImage: true,
  slug: true,
  category: {
    select: { name: true, slug: true },
  },
  tags: {
    select: {
      tag: { select: { name: true, slug: true } },
    },
  },
} satisfies Prisma.PostSelect;
