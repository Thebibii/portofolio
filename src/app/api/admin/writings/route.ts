import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PostStatus, PostType } from "@/types/blogs";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const postSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  status: z.nativeEnum(PostStatus),
  featured: z.boolean(),
  readingTime: z.number().min(1, "Reading time must be at least 1 minute"),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
});
export async function GET() {
  try {
    const data = await prisma.post.findMany({
      where: { type: PostType.WRITING },
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    const transformed = data.map((p) => ({
      ...p,
      tags: p.tags?.map((pt) => pt.tag) || [],
    }));

    return NextResponse.json({ success: true, data: transformed });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const json = await req.json();

    const body = postSchema.parse(json);

    const { tagIds, ...postData } = body;

    const data = await prisma.post.create({
      data: {
        ...postData,
        type: PostType.WRITING,
        ...(tagIds &&
          tagIds.length > 0 && {
            tags: {
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
      { data, success: true, message: "Post berhasil ditambahkan" },
      { status: 201 }
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
