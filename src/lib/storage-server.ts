import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase Storage helper for SERVER-side writes only.
 *
 * Browser code must never talk to Supabase Storage directly once the anon
 * INSERT/UPDATE/DELETE policies are dropped; it goes through
 * `/api/admin/upload` which authenticates the session and uses the service role
 * key from this module.
 */

export const ALLOWED_BUCKETS = ["posts", "projects", "profile"] as const;

export type StorageBucket = (typeof ALLOWED_BUCKETS)[number];

const ALLOWED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "avif",
  "svg",
  "pdf",
  "txt",
  "csv",
  "mp4",
  "webm",
  "mp3",
  "wav",
  "ogg",
]);

/** One folder segment: safe characters only, 1-32 chars. */
const FOLDER_SEGMENT_PATTERN = /^[a-zA-Z0-9_-]{1,32}$/;

const MAX_FOLDER_LENGTH = 128;
const MAX_FOLDER_DEPTH = 3;
const MAX_PATH_LENGTH = 512;
const MAX_REMOVE_BATCH = 100;

let supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdmin) return supabaseAdmin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is not configured; cannot access Supabase Storage."
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured (server-only); storage writes are disabled."
    );
  }

  supabaseAdmin = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return supabaseAdmin;
}

export function isAllowedBucket(bucket: string): bucket is StorageBucket {
  return (ALLOWED_BUCKETS as readonly string[]).includes(bucket);
}

/**
 * Folders may be a single segment (`main`, `gallery`) or a nested path such as
 * `blog/description` (used by the post editor config). Every segment must match
 * the safe-character pattern, which also rejects `..` traversal segments.
 */
export function isAllowedFolder(folder: string): boolean {
  if (!folder || folder.length > MAX_FOLDER_LENGTH) return false;
  const segments = folder.split("/");
  if (segments.length > MAX_FOLDER_DEPTH) return false;
  return segments.every((segment) => FOLDER_SEGMENT_PATTERN.test(segment));
}

/** Rejects absolute paths, traversal, empty segments and control characters. */
export function isValidStoragePath(path: string): boolean {
  if (!path || path.length > MAX_PATH_LENGTH) return false;
  if (path.startsWith("/") || path.endsWith("/")) return false;
  if (path.includes("\\") || path.includes("?") || path.includes("#")) {
    return false;
  }
  if (/[\u0000-\u001f\u007f]/.test(path)) return false;

  return path
    .split("/")
    .every(
      (segment) =>
        segment.length > 0 &&
        segment.length <= 128 &&
        segment !== "." &&
        segment !== ".."
    );
}

function randomString(length: number): string {
  const charset = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += charset[Math.floor(Math.random() * charset.length)];
  }
  return result;
}

/** Extension is derived from the original file name (never from file.type). */
function getFileExtension(fileName: string): string | null {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot <= 0 || lastDot === fileName.length - 1) return null;
  const ext = fileName.slice(lastDot + 1).toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext) ? ext : null;
}

export type UploadObjectOptions = {
  bucket: string;
  folder?: string;
  file: File;
};

export type UploadObjectResult =
  | { url: string; path: string }
  | { error: string };

export async function uploadObject({
  bucket,
  folder,
  file,
}: UploadObjectOptions): Promise<UploadObjectResult> {
  if (!isAllowedBucket(bucket)) {
    return { error: "Invalid bucket" };
  }

  if (folder !== undefined && folder !== "" && !isAllowedFolder(folder)) {
    return { error: "Invalid folder" };
  }

  const ext = getFileExtension(file.name);
  if (!ext) {
    return { error: "Unsupported file extension" };
  }

  const fileName = `${Date.now()}-${randomString(11)}.${ext}`;
  const objectPath = folder ? `${folder}/${fileName}` : fileName;

  if (!isValidStoragePath(objectPath)) {
    return { error: "Invalid storage path" };
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(objectPath, file, {
        cacheControl: "3600",
        contentType: file.type || undefined,
        upsert: false,
      });

    if (error) {
      console.error("[storage] upload error:", error.message);
      return { error: "Upload failed" };
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl, path: data.path };
  } catch (error) {
    console.error("[storage] upload error:", error);
    return { error: "Upload failed" };
  }
}

export async function removeObjects(
  bucket: string,
  paths: string[]
): Promise<boolean> {
  if (!isAllowedBucket(bucket)) {
    console.error("[storage] removeObjects: invalid bucket");
    return false;
  }

  if (paths.length === 0) return true;

  if (!paths.every((path) => isValidStoragePath(path))) {
    console.error("[storage] removeObjects: invalid path");
    return false;
  }

  try {
    const supabase = getSupabaseAdmin();

    for (let i = 0; i < paths.length; i += MAX_REMOVE_BATCH) {
      const batch = paths.slice(i, i + MAX_REMOVE_BATCH);
      const { error } = await supabase.storage.from(bucket).remove(batch);

      if (error) {
        console.error("[storage] delete error:", error.message);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("[storage] delete error:", error);
    return false;
  }
}
