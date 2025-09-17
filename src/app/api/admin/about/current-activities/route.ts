import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { currentActivities } = body;

    if (!currentActivities || !Array.isArray(currentActivities)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      currentActivities.map((act) => {
        if (act.dbId) {
          // kalau ada ID → upsert by id
          return prisma.currentActivity.upsert({
            where: { id: Number(act.dbId) }, // konversi ke Int
            update: {
              title: act.title,
              content: act.content,
            },
            create: {
              title: act.title,
              content: act.content,
            },
          });
        } else {
          // kalau tidak ada ID → create baru
          return prisma.currentActivity.create({
            data: {
              title: act.title,
              content: act.content,
            },
          });
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: results,
      message: "Data created succesfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
