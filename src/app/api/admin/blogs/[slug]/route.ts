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
  "admin/blogs/:slug",
  async (_req, { params }) => {
    const { response } = await requireAdmin();
    if (response) return response;

    const { slug } = await params;

    const data = await prisma.post.findUnique({
      where: { slug, type: "BLOG" },
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
        { error: "Blog tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  }
);

export const PUT = withRouteHandler<Context>(
  "admin/blogs/:slug",
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
      where: { slug, type: PostType.BLOG },
    });

    if (!existingBlog) {
      return NextResponse.json(
        { error: `Blog tidak ditemukan` },
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
    revalidatePath('/blogs');
    revalidatePath(`/blogs/${slug}`);

    if (finalSlug !== slug) {
      revalidatePath(`/blogs/${finalSlug}`);
    }

    return NextResponse.json(
      { data, success: true, message: "Blog berhasil diupdate" },
      { status: 200 }
    );
  }
);

export const DELETE = withRouteHandler<Context>(
  "admin/blogs/:slug",
  async (_req, { params }) => {
    const { response } = await requireAdmin();
    if (response) return response;

    const { slug } = await params;

    const existingBlog = await prisma.post.findUnique({
      where: { slug, type: PostType.BLOG },
      select: { content: true, coverImage: true },
    });

    if (!existingBlog) {
      return NextResponse.json(
        { error: `Blog tidak ditemukan` },
        { status: 404 }
      );
    }

    if (existingBlog.content) {
      await deleteImagesFromContent(existingBlog.content);
    }

    if (existingBlog.coverImage) {
      const coverPath = extractPathFromUrl(existingBlog.coverImage);
      if (coverPath) {
        await deleteImage(coverPath);
      }
    }

    const data = await prisma.post.delete({
      where: { slug },
      select: { id: true },
    });

    revalidatePath('/');
    revalidatePath('/blogs');
    revalidatePath(`/blogs/${slug}`);

    return NextResponse.json(
      { data, message: "Data deleted successfully" },
      { status: 200 }
    );
  }
);
