import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
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
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
