import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        name: true,
        slug: true,
      },
      orderBy: {
        posts: {
          _count: "desc",
        },
      },
      take: 8, // ambil 8 kategori terbanyak
    });

    if (categories.length === 0) {
      return NextResponse.json(
        { message: "Tidak ada kategori ditemukan" },
        { status: 400 }
      );
    }

    return NextResponse.json({ data: categories, message: "Data successfuly" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
