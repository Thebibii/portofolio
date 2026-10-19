import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { errors } from "@/lib/api-error";
import { mapPrismaError } from "@/lib/prisma-error";
import { parseId } from "@/lib/validate";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const idNumber = parseId(id);
    if (idNumber === null) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const data = await prisma.experience.delete({
      where: { id: idNumber },
      select: { id: true },
    });

    return NextResponse.json(
      { data, message: "Data deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    const mapped = mapPrismaError(error);
    if (mapped) return errors.mapped(mapped);
    console.error(error); // untuk log internal
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
