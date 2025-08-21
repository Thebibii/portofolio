import { supabase } from "./supabase";

export type UploadImageResult = {
  url: string;
  path: string;
  error?: string;
};

/**
 * Upload single image to Supabase Storage
 */
export async function uploadImage(
  file: File,
  bucket: string = "images",
  folder?: string
): Promise<UploadImageResult | null> {
  try {
    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload errorrr:", error);
      return { url: "", path: "", error: error.message };
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: publicUrlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error("Upload errorr:", error);
    return { url: "", path: "", error: "Upload failed" };
  }
}

/**
 * Upload multiple images to Supabase Storage
 */
export async function uploadMultipleImages(
  files: FileList | File[],
  bucket: string = "images",
  folder?: string
): Promise<UploadImageResult[]> {
  const filesArray = Array.from(files);
  const uploadPromises = filesArray.map((file) =>
    uploadImage(file, bucket, folder)
  );

  const results = await Promise.all(uploadPromises);
  return results.filter((result) => result !== null) as UploadImageResult[];
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImage(
  path: string,
  bucket: string = "images"
): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      console.error("Delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Delete error:", error);
    return false;
  }
}

/**
 * Delete multiple images from Supabase Storage
 */
export async function deleteMultipleImages(
  paths: string[],
  bucket: string = "images"
): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(bucket).remove(paths);

    if (error) {
      console.error("Delete multiple error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Delete multiple error:", error);
    return false;
  }
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
