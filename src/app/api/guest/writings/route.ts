import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const search = searchParams.get("search") || "";
    const tagSlug = searchParams.get("tag") || "";
    const categorySlug = searchParams.get("category") || ""; // Add this line
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const whereClause: any = {
      type: "WRITING",
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
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
