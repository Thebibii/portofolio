import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { PostStatus, PostType } from "@/types/blogs";
import { deleteImage, extractPathFromUrl } from "@/lib/imageUpload";
import { deleteImagesFromContent } from "@/lib/extract-image-from-content";
import { generateUniquePostSlug } from "@/lib/slug";
import z from "zod";

const postSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    slug: z.string().max(120, "Slug too long").optional(),
    content: z
      .string()
      .min(1, "Content is required")
      .max(100000, "Content too long"),
    excerpt: z.string().max(500, "Excerpt too long").optional(),
    coverImage: z.string().max(2048, "Cover image URL too long").optional(),
    status: z.nativeEnum(PostStatus),
    featured: z.boolean(),
    readingTime: z.number().min(1, "Reading time must be at least 1 minute"),
    categoryId: z.string().optional(),
    tagIds: z.array(z.string()).max(20, "Too many tags").optional(),
  })
  .strict();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;

    const { slug } = await params;

    const data = await prisma.post.findUnique({
      where: { slug, type: PostType.WRITING },
      include: {
        tags: {
          select: {
            tag: true,
          },
        },
      },
    });

    if (!data) {
      return NextResponse.json(
        { message: "Writings tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching writing:", error);
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
    const { session, response } = await requireAdmin();
    if (response) return response;

    const { slug } = await params;
    const json = await req.json();

    // Validasi body
    const body = postSchema.parse(json);

    // Pisahkan tagIds dari data lainnya
    const { tagIds, ...postData } = body;
    const existingBlog = await prisma.post.findUnique({
      where: { slug, type: PostType.WRITING },
    });

    if (!existingBlog) {
      return NextResponse.json(
        { message: `Writings tidak ditemukan` },
        { status: 404 }
      );
    }

    // Slug tidak berubah otomatis saat judul berubah.
    // Hanya berubah bila client mengirim slug manual yang tidak kosong.
    let finalSlug = slug;
    if (body.slug && body.slug.trim()) {
      finalSlug = await generateUniquePostSlug(body.slug, slug);
    }

    const data = await prisma.post.update({
      where: { slug },
      data: {
        ...postData,
        slug: finalSlug,
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

    revalidatePath('/');
    revalidatePath('/writings');
    revalidatePath(`/writings/${slug}`);

    if (finalSlug !== slug) {
      revalidatePath(`/writings/${finalSlug}`);
    }

    return NextResponse.json(
      { data, success: true, message: "Writings berhasil diupdate" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => e.message) },
        { status: 400 }
      );
    }

    console.error("[admin/writings/:slug] failed:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;

    const { slug } = await params;

    const existingWriting = await prisma.post.findUnique({
      where: { slug, type: PostType.WRITING },
      select: { content: true, coverImage: true },
    });

    if (!existingWriting) {
      return NextResponse.json(
        { message: `Writing tidak ditemukan` },
        { status: 404 }
      );
    }

    if (existingWriting.content) {
      await deleteImagesFromContent(existingWriting.content);
    }

    if (existingWriting.coverImage) {
      const coverPath = extractPathFromUrl(existingWriting.coverImage);
      if (coverPath) {
        await deleteImage(coverPath);
      }
    }

    const data = await prisma.post.delete({
      where: { slug },
      select: { id: true },
    });

    console.log(
      `[admin/writings/:slug] deleted id=${data.id} slug=${slug} by=${session.user.id}`
    );

    revalidatePath('/');
    revalidatePath('/writings');
    revalidatePath(`/writings/${slug}`);

    return NextResponse.json(
      { data, message: "Data deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[admin/writings/:slug] failed:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
