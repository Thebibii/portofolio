import { withRouteHandler } from "@/lib/api-handler";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { parseJsonBody } from "@/lib/validate";
import { bucketReorderSchema } from "@/types/validation/bucketlist";
import { NextResponse } from "next/server";

/** Simpan urutan baru hasil drag/up-down di admin. */
export const POST = withRouteHandler("admin/bucketlist/reorder", async (req) => {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = await parseJsonBody(req, bucketReorderSchema);
  if (!parsed.ok) return parsed.response;
  const { ids } = parsed.data;

  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.bucketItem.update({ where: { id }, data: { order: index } })
    )
  );

  return NextResponse.json({ success: true, message: "Urutan diperbarui" });
});
