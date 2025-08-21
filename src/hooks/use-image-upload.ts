import { useState } from "react";
import {
  uploadImage,
  uploadMultipleImages,
  UploadImageResult,
} from "@/lib/imageUpload";

export function useImageUpload(bucket?: string, folder?: string) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadSingle = async (
    file: File
  ): Promise<UploadImageResult | null> => {
    setUploading(true);
    setError(null);

    try {
      const result = await uploadImage(file, bucket, folder);
      if (result?.error) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadMultiple = async (
    files: FileList | File[]
  ): Promise<UploadImageResult[]> => {
    setUploading(true);
    setError(null);

    try {
      const results = await uploadMultipleImages(files, bucket, folder);
      const hasError = results.some((result) => result.error);
      if (hasError) {
        setError("Some uploads failed");
      }
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      return [];
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadSingle,
    uploadMultiple,
    uploading,
    error,
    clearError: () => setError(null),
  };
}
