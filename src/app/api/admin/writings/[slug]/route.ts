import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { withRouteHandler } from "@/lib/api-handler";
import { parseJsonBody } from "@/lib/validate";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { PostType } from "@/types/blogs";
import { deleteImage, extractPathFromUrl } from "@/lib/imageUpload";
import { deleteImagesFromContent } from "@/lib/extract-image-from-content";
import { generateUniquePostSlug } from "@/lib/slug";
import { postCreateSchema } from "@/types/validation/post";

type Context = { params: Promise<{ slug: string }> };

export const GET = withRouteHandler<Context>(
  "admin/writings/:slug",
  async (_req, { params }) => {
    const { response } = await requireAdmin();
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
        { error: "Writings tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  }
);

export const PUT = withRouteHandler<Context>(
  "admin/writings/:slug",
  async (req, { params }) => {
    const { response } = await requireAdmin();
    if (response) return response;

    const { slug } = await params;

    const parsed = await parseJsonBody(req, postCreateSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;

    // Pisahkan tagIds dari data lainnya
    const { tagIds, ...postData } = body;
    const existingBlog = await prisma.post.findUnique({
      where: { slug, type: PostType.WRITING },
    });

    if (!existingBlog) {
      return NextResponse.json(
        { error: `Writings tidak ditemukan` },
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
  }
);

export const DELETE = withRouteHandler<Context>(
  "admin/writings/:slug",
  async (_req, { params }) => {
    const { response } = await requireAdmin();
    if (response) return response;

    const { slug } = await params;

    const existingWriting = await prisma.post.findUnique({
      where: { slug, type: PostType.WRITING },
      select: { content: true, coverImage: true },
    });

    if (!existingWriting) {
      return NextResponse.json(
        { error: `Writing tidak ditemukan` },
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

    revalidatePath('/');
    revalidatePath('/writings');
    revalidatePath(`/writings/${slug}`);

    return NextResponse.json(
      { data, message: "Data deleted successfully" },
      { status: 200 }
    );
  }
);
