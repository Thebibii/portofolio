import { generateSlug } from "@/lib/genarate-slug";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Title is required"),
  color: z.string().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const json = await req.json();

    // Validasi body
    const body = categorySchema.parse(json);

    // Cek apakah tag ada
    const existingSlug = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingSlug) {
      return NextResponse.json(
        { message: `Slug tidak ditemukan` },
        { status: 404 }
      );
    }

    // Update tag
    const data = await prisma.category.update({
      where: { id: id },
      data: {
        ...body,
        slug: generateSlug(body.name),
      },
    });

    return NextResponse.json(
      { data, success: true, message: "Slug berhasil diperbarui" },
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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    const data = await prisma.category.delete({
      where: { id },
      select: { id: true, name: true },
    });

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
