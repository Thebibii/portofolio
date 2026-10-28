import { withRouteHandler } from "@/lib/api-handler";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { parseJsonBody } from "@/lib/validate";
import { aboutProfileSchema } from "@/types/validation/about";
import { NextResponse } from "next/server";

const PROFILE_ID = "main";

export const GET = withRouteHandler("admin/about/profile", async () => {
  const { response } = await requireAdmin();
  if (response) return response;

  const data = await prisma.aboutProfile.findUnique({
    where: { id: PROFILE_ID },
  });

  return NextResponse.json({ success: true, data });
});

export const PUT = withRouteHandler("admin/about/profile", async (req) => {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = await parseJsonBody(req, aboutProfileSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const payload = {
    name: body.name,
    nickname: body.nickname,
    role: body.role || null,
    location: body.location || null,
    paragraphs: body.paragraphs,
    stackLine: body.stackLine,
    photoUrl: body.photoUrl || null,
    techStack: body.techStack,
  };

  const data = await prisma.aboutProfile.upsert({
    where: { id: PROFILE_ID },
    update: payload,
    create: { id: PROFILE_ID, ...payload },
  });

  return NextResponse.json({ success: true, data });
});
