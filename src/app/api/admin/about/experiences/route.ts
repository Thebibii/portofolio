import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { experiences } = body;

    if (!experiences || !Array.isArray(experiences)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      experiences.map((exp) => {
        if (exp.dbId) {
          // kalau ada ID → upsert by id
          return prisma.experience.upsert({
            where: { id: Number(exp.dbId) }, // konversi ke Int
            update: {
              position: exp.position,
              company: exp.company,
              location: exp.location || null,
              startDate: exp.startDate
                ? { set: new Date(exp.startDate) }
                : undefined,
              endDate: exp.endDate
                ? { set: new Date(exp.endDate) }
                : { set: null },
              duration: exp.duration,
              description: exp.description,
            },
            create: {
              position: exp.position,
              company: exp.company,
              location: exp.location || null,
              startDate: new Date(exp.startDate),
              endDate: exp.endDate ? new Date(exp.endDate) : null,
              duration: exp.duration,
              description: exp.description,
            },
          });
        } else {
          // kalau tidak ada ID → create baru
          return prisma.experience.create({
            data: {
              position: exp.position,
              company: exp.company,
              location: exp.location || null,
              startDate: new Date(exp.startDate),
              endDate: exp.endDate ? new Date(exp.endDate) : null,
              duration: exp.duration,
              description: exp.description,
            },
          });
        }
      })
    );

    // return NextResponse.json({ success: true, data: "as" });
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
