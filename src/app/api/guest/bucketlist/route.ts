import { withRouteHandler } from "@/lib/api-handler";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

/** Daftar impian publik — read-only, urut sesuai `order` manual. */
export const GET = withRouteHandler("guest/bucketlist", async () => {
  const data = await prisma.bucketItem.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ success: true, data });
});
