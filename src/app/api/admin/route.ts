import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const count = {
      project: prisma.project.count(),
      writing: prisma.post.count({ where: { type: "WRITING" } }),
      blog: prisma.post.count({ where: { type: "BLOG" } }),
    };

    return NextResponse.json({ count });
  } catch (error) {}
}
