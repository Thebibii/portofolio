/**
 * CLIENT-safe Supabase Storage helpers.
 *
 * Uploads/deletes go through the session-protected `/api/admin/upload` route,
 * which performs the actual Supabase writes with the service role key. Keep
 * this module free of `@supabase/supabase-js` so it can run in the browser and
 * in route handlers (server files reuse `extractPathFromUrl`).
 */

export type UploadImageResult = {
  url: string;
  path: string;
  error?: string;
};

type UploadApiResponse = {
  url?: string;
  path?: string;
  error?: string | string[];
};

const UPLOAD_ENDPOINT = "/api/admin/upload";
const MAX_PATHS_PER_REQUEST = 100;

function toErrorMessage(payload: UploadApiResponse | null, status: number): string {
  const error = payload?.error;
  if (typeof error === "string" && error.length > 0) return error;
  if (Array.isArray(error) && error.length > 0) return error.join(", ");
  return `Upload failed (${status})`;
}

async function uploadSingleFile(
  file: File,
  bucket: string,
  folder?: string
): Promise<UploadImageResult> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", bucket);
    if (folder) formData.append("folder", folder);

    const response = await fetch(UPLOAD_ENDPOINT, {
      method: "POST",
      body: formData,
    });

    const payload = (await response
      .json()
      .catch(() => null)) as UploadApiResponse | null;

    if (!response.ok || !payload?.url || !payload?.path) {
      return {
        url: "",
        path: "",
        error: toErrorMessage(payload, response.status),
      };
    }

    return { url: payload.url, path: payload.path };
  } catch (error) {
    console.error("Upload error:", error);
    return { url: "", path: "", error: "Upload failed" };
  }
}

async function requestDelete(
  bucket: string,
  paths: string[]
): Promise<boolean> {
  try {
    const response = await fetch(UPLOAD_ENDPOINT, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bucket, paths }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      console.error("Delete error:", payload ?? response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Delete error:", error);
    return false;
  }
}

/**
 * Upload single image to Supabase Storage (via the admin API route)
 */
export async function uploadImage(
  file: File,
  bucket: string = "images",
  folder?: string
): Promise<UploadImageResult | null> {
  return uploadSingleFile(file, bucket, folder);
}

/**
 * Upload multiple images to Supabase Storage (via the admin API route)
 */
export async function uploadMultipleImages(
  files: FileList | File[],
  bucket: string = "images",
  folder?: string
): Promise<UploadImageResult[]> {
  const filesArray = Array.from(files);
  return Promise.all(
    filesArray.map((file) => uploadSingleFile(file, bucket, folder))
  );
}

/**
 * Delete image from Supabase Storage (via the admin API route)
 */
export async function deleteImage(
  path: string,
  bucket: string = "images"
): Promise<boolean> {
  if (!path) return false;
  return requestDelete(bucket, [path]);
}

/**
 * Delete multiple images from Supabase Storage (via the admin API route)
 */
export async function deleteMultipleImages(
  paths: string[],
  bucket: string = "images"
): Promise<boolean> {
  const validPaths = paths.filter(Boolean);
  if (validPaths.length === 0) return true;

  for (let i = 0; i < validPaths.length; i += MAX_PATHS_PER_REQUEST) {
    const batch = validPaths.slice(i, i + MAX_PATHS_PER_REQUEST);
    const success = await requestDelete(bucket, batch);
    if (!success) return false;
  }

  return true;
}

/**
 * Extract path from Supabase URL for deletion
 */
export function extractPathFromUrl(url: string): string | null {
  try {
    // Pattern: https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[path]
    const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Error extracting path:", error);
    return null;
  }
}

/**
 * Parse bucket + path from a Supabase public URL (CLIENT-safe, pure).
 */
export function parseImageUrl(
  url: string
): { bucket: string; path: string } | null {
  try {
    const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
    if (!match) return null;
    return { bucket: match[1], path: match[2] };
  } catch {
    return null;
  }
}
