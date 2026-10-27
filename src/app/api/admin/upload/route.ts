import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { withRouteHandler } from "@/lib/api-handler";
import { errors, jsonError } from "@/lib/api-error";
import { requireAdmin } from "@/lib/require-admin";
import {
  isAllowedBucket,
  isAllowedFolder,
  isValidStoragePath,
  removeObjects,
  uploadObject,
} from "@/lib/storage-server";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const MAX_DELETE_PATHS = 100;

const EXTRA_ALLOWED_CONTENT_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/csv",
]);

const BLOCKED_CONTENT_TYPES = new Set([
  "text/html",
  "text/css",
  "text/javascript",
  "application/javascript",
  "application/x-javascript",
]);

function normalizeContentType(contentType: string): string {
  return contentType.split(";")[0]?.trim().toLowerCase() ?? "";
}

function isAllowedContentType(contentType: string): boolean {
  const normalized = normalizeContentType(contentType);
  if (!normalized) return false;
  if (BLOCKED_CONTENT_TYPES.has(normalized)) return false;
  if (
    normalized.startsWith("image/") ||
    normalized.startsWith("video/") ||
    normalized.startsWith("audio/")
  ) {
    return true;
  }
  return EXTRA_ALLOWED_CONTENT_TYPES.has(normalized);
}

const deleteSchema = z.object({
  bucket: z
    .string()
    .refine((value) => isAllowedBucket(value), { message: "Invalid bucket" }),
  paths: z
    .array(
      z.string().refine((value) => isValidStoragePath(value), {
        message: "Invalid storage path",
      })
    )
    .min(1, "paths must contain at least one path")
    .max(
      MAX_DELETE_PATHS,
      `Cannot delete more than ${MAX_DELETE_PATHS} paths per request`
    ),
});

export const POST = withRouteHandler(
  "admin/upload",
  async (req: NextRequest) => {
    const { response } = await requireAdmin();
    if (response) return response;

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return jsonError(400, "Invalid form data");
    }

    const file = formData.get("file");
    const bucketValue = formData.get("bucket");
    const folderValue = formData.get("folder");

    if (!(file instanceof File)) {
      return jsonError(400, "File is required");
    }

    const bucket = typeof bucketValue === "string" ? bucketValue : "";
    if (!isAllowedBucket(bucket)) {
      return jsonError(400, "Invalid bucket");
    }

    const folder =
      typeof folderValue === "string" && folderValue.length > 0
        ? folderValue
        : undefined;
    if (folder !== undefined && !isAllowedFolder(folder)) {
      return jsonError(400, "Invalid folder");
    }

    if (file.size === 0) {
      return jsonError(400, "File is empty");
    }

    if (file.size > MAX_FILE_SIZE) {
      return jsonError(413, "File size must not exceed 15MB");
    }

    if (!isAllowedContentType(file.type)) {
      return jsonError(415, "File type is not allowed");
    }

    const result = await uploadObject({ bucket, folder, file });

    if ("error" in result) {
      return jsonError(400, result.error);
    }

    return NextResponse.json(
      { url: result.url, path: result.path },
      { status: 201 }
    );
  }
);

export const DELETE = withRouteHandler(
  "admin/upload",
  async (req: NextRequest) => {
    const { response } = await requireAdmin();
    if (response) return response;

    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return jsonError(400, "Invalid JSON body");
    }

    const parsed = deleteSchema.safeParse(raw);
    if (!parsed.success) {
      return errors.badRequest(parsed.error.issues.map((issue) => issue.message));
    }

    const { bucket, paths } = parsed.data;
    const success = await removeObjects(bucket, paths);

    if (!success) {
      return jsonError(500, "Failed to delete files");
    }

    return NextResponse.json({ success: true });
  }
);
