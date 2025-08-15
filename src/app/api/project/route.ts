import prisma from "@/lib/prisma";
import { ProjectFormData, ProjectStatus } from "@/types/projects";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

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
  // startDate: z.date().optional(),
  // endDate: z.date().optional(),
  startDate: z.preprocess(
    (val) => (val ? new Date(val as string) : undefined),
    z.date().optional()
  ),
  endDate: z.preprocess(
    (val) => (val ? new Date(val as string) : undefined),
    z.date().optional()
  ),
});

export async function GET() {
  try {
    const data = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();

    // Validasi body
    const body = projectSchema.parse(json);

    const data = await prisma.project.create({
      data: {
        ...body,
        startDate: json.startDate ? new Date(json.startDate) : undefined,
        endDate: json.endDate ? new Date(json.endDate) : undefined,
      },
    });

    return NextResponse.json(
      { data, success: true, message: "Project berhasil ditambahkan" },
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
