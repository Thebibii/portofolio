import { omitId } from "@/lib/helper";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const featuredParam = searchParams.get("featured");

    const where = featuredParam !== null
      ? { featured: featuredParam === "true" }
      : {};

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    const data = omitId(projects);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message =
      process.env.APP_ENV === "development"
        ? error instanceof Error
          ? error.message
          : String(error)
        : "Terjadi kesalahan, silakan coba lagi.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
