import { omitId } from "@/lib/helper";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const experiences = await prisma.experience.findMany({
      orderBy: { startDate: "desc" },
    });
    const currentActivity = await prisma.currentActivity.findMany({
      orderBy: { createdAt: "desc" },
    });
    const filterCurrentActivity = omitId(currentActivity);
    const filterExperience = omitId(experiences);

    return NextResponse.json({
      success: true,
      data: {
        experiences: filterExperience,
        currentActivity: filterCurrentActivity,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
