import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { withRouteHandler } from "@/lib/api-handler";
import { parseJsonBody } from "@/lib/validate";
import { extractPathFromUrl } from "@/lib/imageUpload";
import { removeObjects } from "@/lib/storage-server";
import { deleteImagesFromContent } from "@/lib/extract-image-from-content";
import { generateSlug } from "@/lib/slug";
import { projectServerSchema } from "@/types/validation/project";

function isValidCUID(str: string): boolean {
  const cuidRegex = /^c[0-9a-z]{24}$/i;
  return cuidRegex.test(str);
}

type ProjectContext = { params: Promise<{ slug: string }> };

export const GET = withRouteHandler<ProjectContext>(
  "project/:slug",
  async (_req, { params }) => {
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
  }
);

export const DELETE = withRouteHandler<ProjectContext>(
  "project/:slug",
  async (_req, { params }) => {
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
      if (path) await removeObjects("projects", [path]);
    }

    if (project.images && project.images.length > 0) {
      const galleryPaths = project.images
        .map((url) => extractPathFromUrl(url))
        .filter(Boolean) as string[];
      if (galleryPaths.length > 0) await removeObjects("projects", galleryPaths);
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
  }
);

export const PUT = withRouteHandler<ProjectContext>(
  "project/:slug",
  async (req: NextRequest, { params }) => {
    const { session, response } = await requireAdmin();
    if (response) return response;

    const { slug } = await params;
    const parsed = await parseJsonBody(req, projectServerSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;

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
        startDate: body.startDate,
        endDate: body.endDate,
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
  }
);
