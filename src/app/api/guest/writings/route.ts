import prisma from "@/lib/prisma";
import { parseSearchParams } from "@/lib/validate";
import { guestPostListQuerySchema } from "@/types/validation/post";
import { NextResponse } from "next/server";
import { withRouteHandler } from "@/lib/api-handler";

export const GET = withRouteHandler("guest/writings", async (request) => {
  const parsed = parseSearchParams(
    new URL(request.url).searchParams,
    guestPostListQuerySchema
  );
  if (!parsed.ok) return parsed.response;
  const {
    search,
    tag: tagSlug,
    category: categorySlug,
    limit,
    page,
    sortBy,
    sortOrder,
  } = parsed.data;

  // Build where clause
  const whereClause: any = {
    type: "WRITING",
    status: "PUBLISHED",
  };

  // Add search filter
  if (search) {
    whereClause.OR = [
      {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        excerpt: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        content: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  // Add tag filter
  if (tagSlug) {
    whereClause.tags = {
      some: {
        tag: {
          slug: tagSlug,
        },
      },
    };
  }

  // Add category filter
  if (categorySlug) {
    whereClause.category = {
      slug: categorySlug,
    };
  }

  // Calculate skip for pagination
  const skip = (page - 1) * limit;

  // Build orderBy clause
  const orderByClause: any = {};
  orderByClause[sortBy] = sortOrder;

  // Get total count for pagination
  const totalCount = await prisma.post.count({
    where: whereClause,
  });

  // Fetch filtered data
  const data = await prisma.post.findMany({
    where: whereClause,
    orderBy: orderByClause,
    skip: skip,
    take: limit,
    select: {
      slug: true,
      excerpt: true,
      coverImage: true,
      updatedAt: true,
      title: true,
      viewCount: true,
      readingTime: true,
      createdAt: true,
      category: {
        // Add category to select
        select: {
          name: true,
          slug: true,
        },
      },
      tags: {
        select: {
          tag: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return NextResponse.json({
    data,
    meta: {
      total: totalCount,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
    },
    filters: {
      search,
      tag: tagSlug,
      category: categorySlug, // Add this line
      sortBy,
      sortOrder,
    },
    message: "Data berhasil diambil",
  });
});
