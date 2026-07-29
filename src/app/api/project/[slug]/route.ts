import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { deleteImage, deleteMultipleImages, extractPathFromUrl } from "@/lib/imageUpload";
import { deleteImagesFromContent } from "@/lib/extract-image-from-content";
import z from "zod";
import { ProjectStatus } from "@prisma/client";
import { generateSlug } from "@/lib/genarate-slug";
const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  longDescription: z.string().optional(),
  image: z.string().optional(),
  images: z.array(z.string()).default([]),
  technologies: z
    .array(z.string())
    .min(1, "At least one technology is required"),
  demoUrl: z.string().optional(),
  sourceUrl: z.string().optional(),
  status: z.nativeEnum(ProjectStatus),
  featured: z.boolean().default(false),
  startDate: z.preprocess(
    (val) => (val ? new Date(val as string) : undefined),
    z.date().optional()
  ),
  endDate: z.preprocess(
    (val) => (val ? new Date(val as string) : undefined),
    z.date().optional()
  ),
});

function isValidCUID(str: string): boolean {
  const cuidRegex = /^c[0-9a-z]{24}$/i;
  return cuidRegex.test(str);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
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
        { message: "Project tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
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
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
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
      return NextResponse.json({ message: "Data not found" }, { status: 404 });
    }
    console.error(error); // untuk log internal
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const json = await req.json();

    // Validasi body
    const body = projectSchema.parse(json);

    // Cek apakah project ada
    const existingProject = await prisma.project.findUnique({
      where: { id: slug },
    });
    if (!existingProject) {
      return NextResponse.json(
        { message: `Project tidak ditemukan` },
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

    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
