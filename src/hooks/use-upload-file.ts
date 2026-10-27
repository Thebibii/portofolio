import * as React from "react";
import { toast } from "sonner";
import { z } from "zod";
import { deleteImage, uploadImage } from "@/lib/imageUpload";

export type UploadedFile = {
  key: string;
  url: string;
  name: string;
  size: number;
  type: string;
  path: string;
};

type FileCategory = "image" | "text" | "blob" | "pdf" | "video" | "audio";

interface UseUploadFileProps {
  bucket?: string;
  folder?: string;
  maxSize?: number; // in bytes
  allowedTypes?: FileCategory[] | string[];
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (error: unknown) => void;
  onUploadProgress?: (progress: number) => void;
}

export function useUploadFile({
  bucket = "projects",
  folder = "description",
  maxSize = 5 * 1024 * 1024, // 5MB default
  allowedTypes = ["image", "text", "blob", "pdf", "video", "audio"],
  onUploadComplete,
  onUploadError,
  onUploadProgress,
}: UseUploadFileProps = {}) {
  const [uploadedFile, setUploadedFile] = React.useState<UploadedFile>();
  const [uploadingFile, setUploadingFile] = React.useState<File>();
  const [progress, setProgress] = React.useState<number>(0);
  const [isUploading, setIsUploading] = React.useState(false);

  // Map category to MIME types
  const getCategoryMimeTypes = (category: string): string[] => {
    const mimeTypeMap: Record<string, string[]> = {
      image: [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
      ],
      text: [
        "text/plain",
        "text/csv",
        "text/html",
        "text/css",
        "text/javascript",
      ],
      blob: ["*/*"], // Accept any file type
      pdf: ["application/pdf"],
      video: [
        "video/mp4",
        "video/mpeg",
        "video/webm",
        "video/ogg",
        "video/quicktime",
      ],
      audio: [
        "audio/mpeg",
        "audio/mp3",
        "audio/wav",
        "audio/ogg",
        "audio/webm",
        "audio/aac",
      ],
    };

    return mimeTypeMap[category] || [category];
  };

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      return false;
    }

    // Build allowed MIME types list
    const allowedMimeTypes: string[] = [];
    allowedTypes.forEach((type) => {
      if (typeof type === "string") {
        // Check if it's a category or direct MIME type
        if (["image", "text", "blob", "pdf", "video", "audio"].includes(type)) {
          allowedMimeTypes.push(...getCategoryMimeTypes(type));
        } else {
          allowedMimeTypes.push(type);
        }
      }
    });

    // Check file type
    const isAllowed = allowedMimeTypes.some((mimeType) => {
      if (mimeType === "*/*") return true;
      if (mimeType.endsWith("/*")) {
        const baseType = mimeType.split("/")[0];
        return file.type.startsWith(baseType + "/");
      }
      return file.type === mimeType;
    });

    if (!isAllowed) {
      toast.error("File type not allowed");
      return false;
    }

    return true;
  };

  const uploadFile = async (file: File): Promise<UploadedFile | undefined> => {
    if (!validateFile(file)) {
      return undefined;
    }

    setIsUploading(true);
    setUploadingFile(file);
    setProgress(0);

    try {
      // Simulate progress for small files (the upload API doesn't expose
      // native progress events)
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 10;
          onUploadProgress?.(newProgress);
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 100);

      // Upload through the session-protected admin API route
      const result = await uploadImage(file, bucket, folder);

      clearInterval(progressInterval);

      if (!result || result.error || !result.url || !result.path) {
        throw new Error(result?.error || "Upload failed");
      }

      const fileName = result.path.split("/").pop() || file.name;

      const uploadedFileData: UploadedFile = {
        key: fileName,
        url: result.url,
        name: file.name,
        size: file.size,
        type: file.type,
        path: result.path,
      };

      setProgress(100);
      onUploadProgress?.(100);
      setUploadedFile(uploadedFileData);
      onUploadComplete?.(uploadedFileData);

      toast.success("File uploaded successfully");

      return uploadedFileData;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      onUploadError?.(error);

      return undefined;
    } finally {
      // Reset after a short delay to show 100% completion
      setTimeout(() => {
        setProgress(0);
        setIsUploading(false);
        setUploadingFile(undefined);
      }, 500);
    }
  };

  const deleteFile = async (filePath: string): Promise<boolean> => {
    try {
      const success = await deleteImage(filePath, bucket);

      if (!success) {
        throw new Error("Failed to delete file");
      }

      toast.success("File deleted successfully");
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      return false;
    }
  };

  return {
    uploadFile,
    isUploading,
    progress,
    uploadedFile,
    uploadingFile,
    deleteFile,
  };
}

export function getErrorMessage(err: unknown): string {
  const unknownError = "Something went wrong, please try again later.";

  if (err instanceof z.ZodError) {
    const errors = err.issues.map((issue) => issue.message);
    return errors.join("\n");
  }

  if (err instanceof Error) {
    return err.message;
  }

  if (typeof err === "object" && err !== null && "message" in err) {
    return String(err.message);
  }

  return unknownError;
}

export function showErrorToast(err: unknown): void {
  const errorMessage = getErrorMessage(err);
  toast.error(errorMessage);
}
