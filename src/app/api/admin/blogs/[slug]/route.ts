import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { PostStatus, PostType } from "@/types/blogs";
import z from "zod";

const postSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  status: z.nativeEnum(PostStatus),
  featured: z.boolean(),
  type: z.nativeEnum(PostType),
  readingTime: z.number().min(1, "Reading time must be at least 1 minute"),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const data = await prisma.post.findUnique({
      where: { slug },
    });

    if (!data) {
      return NextResponse.json(
        { message: "Blog tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const json = await req.json();

    // Validasi body
    const body = postSchema.parse(json);

    // Pisahkan tagIds dari data lainnya
    const { tagIds, ...postData } = body;
    const existingBlog = await prisma.post.findUnique({
      where: { slug },
    });

    if (!existingBlog) {
      return NextResponse.json(
        { message: `Blog tidak ditemukan` },
        { status: 404 }
      );
    }
    const data = await prisma.post.update({
      where: { slug },
      data: {
        ...postData,
        // Menggunakan connect untuk tag yang sudah ada
        ...(tagIds &&
          tagIds.length > 0 && {
            tags: {
              deleteMany: {},
              create: tagIds.map((tagId) => ({
                tag: {
                  connect: { id: tagId },
                },
              })),
            },
          }),
      },
      // Include relasi untuk response
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json(
      { data, success: true, message: "Blog berhasil diupdate" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => e.message) },
        { status: 400 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const existingBlog = await prisma.post.findUnique({
    where: { slug },
  });

  if (!existingBlog) {
    return NextResponse.json(
      { message: `Blog tidak ditemukan` },
      { status: 404 }
    );
  }

  const data = await prisma.post.delete({
    where: { slug },
    select: { id: true },
  });

  return NextResponse.json(
    { data, message: "Data deleted successfully" },
    { status: 200 }
  );
}
