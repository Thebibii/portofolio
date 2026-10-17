import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;

    const experiences = await prisma.experience.findMany({
      orderBy: { startDate: "asc" },
    });
    const currentActivities = await prisma.currentActivity.findMany({
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: { experiences, currentActivities },
    });
  } catch (error) {
    console.error("[admin/about] failed:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
