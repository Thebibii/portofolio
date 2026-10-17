import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Pastikan tidak di-cache/di-prerender: selalu hit database saat dipanggil.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[cron/keep-alive] database query failed:", error);
    return NextResponse.json(
      { ok: false, error: "Database keep-alive query failed" },
      { status: 500 }
    );
  }
}
