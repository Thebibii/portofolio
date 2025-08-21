// components/ui/drag-drop-uploader.tsx
("use client");

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileImage, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DragDropUploaderProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: string[];
  disabled?: boolean;
  className?: string;
}

export function DragDropUploader({
  onFilesSelected,
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = ["image/*"],
  disabled = false,
  className,
}: DragDropUploaderProps) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesSelected(acceptedFiles);
      setDragActive(false);
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: accept.reduce((acc, curr) => ({ ...acc, [curr]: [] }), {}),
      maxFiles,
      maxSize,
      disabled,
      onDragEnter: () => setDragActive(true),
      onDragLeave: () => setDragActive(false),
    });

  return (
    <div className={cn("space-y-2", className)}>
      <Card
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed transition-all cursor-pointer",
          isDragActive || dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 px-4">
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-2 text-center">
            {isDragActive ? (
              <>
                <Upload className="h-8 w-8 text-primary animate-bounce" />
                <p className="text-sm font-medium text-primary">
                  Drop files here
                </p>
              </>
            ) : (
              <>
                <FileImage className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Drag & drop images here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Up to {maxFiles} files, {Math.round(maxSize / 1024 / 1024)}MB
                  each
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {fileRejections.length > 0 && (
        <div className="space-y-1">
          {fileRejections.map(({ file, errors }, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 text-xs text-destructive"
            >
              <X className="h-3 w-3" />
              <span>
                {file.name}: {errors[0]?.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
