import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { parseId } from "@/lib/validate";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;

    const body = await req.json();

    const { experiences } = body;

    if (!experiences || !Array.isArray(experiences)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const invalidId = experiences.some(
      (exp) => exp.dbId && parseId(exp.dbId) === null
    );
    if (invalidId) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
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
