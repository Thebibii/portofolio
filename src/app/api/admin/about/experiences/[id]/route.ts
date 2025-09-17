import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    const data = await prisma.experience.delete({
      where: { id: Number(id) },
      select: { id: true },
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
