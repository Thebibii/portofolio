import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { withRouteHandler } from "@/lib/api-handler";
import type { PostTypeConfig } from "@/lib/post-type-config";
import prisma from "@/lib/prisma";
import { postListSelect } from "@/lib/prisma-selects";
import { parseSearchParams } from "@/lib/validate";
import {
  guestPostListQuerySchema,
  type GuestPostListQuery,
} from "@/types/validation/post";

export const POST_LIST_SELECT = postListSelect;

export function buildPostListQuery(
  config: PostTypeConfig,
  filters: GuestPostListQuery
) {
  const {
    search,
    tag: tagSlug,
    category: categorySlug,
    limit,
    page,
    sortBy,
    sortOrder,
  } = filters;

  const where: Prisma.PostWhereInput = {
    type: config.type,
    status: "PUBLISHED",
  };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { excerpt: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  if (tagSlug) {
    where.tags = { some: { tag: { slug: tagSlug } } };
  }

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  return {
    where,
    orderBy: { [sortBy]: sortOrder } as Prisma.PostOrderByWithRelationInput,
    skip: (page - 1) * limit,
  };
}

export function createGuestPostListHandler(config: PostTypeConfig) {
  return withRouteHandler(`guest/${config.logTag}`, async (request) => {
    const parsed = parseSearchParams(
      new URL(request.url).searchParams,
      guestPostListQuerySchema
    );
    if (!parsed.ok) return parsed.response;

    const { search, tag, category, limit, page, sortBy, sortOrder } =
      parsed.data;
    const { where, orderBy, skip } = buildPostListQuery(config, parsed.data);

    const totalCount = await prisma.post.count({ where });
    const data = await prisma.post.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: POST_LIST_SELECT,
    });

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
        tag,
        category,
        sortBy,
        sortOrder,
      },
      message: "Data berhasil diambil",
    });
  });
}
