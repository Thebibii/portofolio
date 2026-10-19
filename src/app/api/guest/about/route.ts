import { withRouteHandler } from "@/lib/api-handler";
import { omitId } from "@/lib/helper";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = withRouteHandler("guest/about", async () => {
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
});
