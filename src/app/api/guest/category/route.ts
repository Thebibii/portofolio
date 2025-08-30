import prisma from "@/lib/prisma";
import { PostType } from "@/types/blogs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get("type") as PostType | null;

    // Default ke BLOG jika parameter tidak ada atau tidak valid
    // Normalisasi ke uppercase untuk pencocokan dengan enum
    const normalizedType = typeParam?.toUpperCase();
    const type: PostType =
      normalizedType &&
      Object.values(PostType).includes(normalizedType as PostType)
        ? (normalizedType as PostType)
        : PostType.BLOG;

    // Ambil categories yang benar-benar memiliki posts dengan type tertentu
    const categories = await prisma.category.findMany({
      where: {
        posts: {
          some: {
            type, // Menggunakan type yang sudah divalidasi dan dinormalisasi
          },
        },
      },
      select: {
        name: true,
        slug: true,
      },
      orderBy: {
        posts: {
          _count: "desc",
        },
      },
      take: 8,
    });

    // Return categories data directly
    return NextResponse.json({
      success: true,
      data: categories,
      message: "Categories retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch categories",
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
