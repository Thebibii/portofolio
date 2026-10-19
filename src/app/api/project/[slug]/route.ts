import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { deleteImage, deleteMultipleImages, extractPathFromUrl } from "@/lib/imageUpload";
import { deleteImagesFromContent } from "@/lib/extract-image-from-content";
import z from "zod";
import { generateSlug } from "@/lib/slug";
import { projectServerSchema } from "@/types/validation/project";

function isValidCUID(str: string): boolean {
  const cuidRegex = /^c[0-9a-z]{24}$/i;
  return cuidRegex.test(str);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;

    const { slug } = await params;

    let data;

    if (isValidCUID(slug)) {
      // Jika UUID, cari berdasarkan id
      data = await prisma.project.findUnique({
        where: { id: slug },
      });
    } else {
      data = await prisma.project.findFirst({
        where: {
          slug,
        },
      });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Project tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;

    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: slug },
      select: {
        slug: true,
        longDescription: true,
        image: true,
        images: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.longDescription) {
      await deleteImagesFromContent(project.longDescription);
    }

    if (project.image) {
      const path = extractPathFromUrl(project.image);
      if (path) await deleteImage(path);
    }

    if (project.images && project.images.length > 0) {
      const galleryPaths = project.images
        .map((url) => extractPathFromUrl(url))
        .filter(Boolean) as string[];
      if (galleryPaths.length > 0) await deleteMultipleImages(galleryPaths);
    }

    const data = await prisma.project.delete({
      where: { id: slug },
      select: { id: true },
    });

  revalidatePath('/');
  revalidatePath('/projects');
  if (project?.slug) revalidatePath(`/projects/${project.slug}`);

  return NextResponse.json(
    { data, message: "Data deleted successfully" },
    { status: 200 }
  );
} catch (error: any) {
    // mapping error Prisma jadi pesan user-friendly
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Data not found" }, { status: 404 });
    }
    console.error(error); // untuk log internal
    return NextResponse.json(
      { error: "Internal server error" },
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
    const body = projectServerSchema.parse(json);

    // Cek apakah project ada
    const existingProject = await prisma.project.findUnique({
      where: { id: slug },
    });
    if (!existingProject) {
      return NextResponse.json(
        { error: `Project tidak ditemukan` },
        { status: 404 }
      );
    }

    // Update project
    const data = await prisma.project.update({
      where: { id: slug },
      data: {
        ...body,
        startDate: json.startDate ? new Date(json.startDate) : undefined,
        endDate: json.endDate ? new Date(json.endDate) : undefined,
        slug: generateSlug(body.title),
      },
    });

    revalidatePath('/');
    revalidatePath('/projects');
    if (existingProject?.slug) {
      revalidatePath(`/projects/${existingProject.slug}`);
    }

    return NextResponse.json(
      { data, success: true, message: "Project berhasil diperbarui" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => e.message) },
        { status: 400 }
      );
    }

    console.error("[project/:slug] failed:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
