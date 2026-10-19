import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { withRouteHandler } from "@/lib/api-handler";
import { NextResponse } from "next/server";

export const GET = withRouteHandler("admin/about", async () => {
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
});
