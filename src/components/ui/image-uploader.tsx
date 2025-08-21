// components/ui/image-uploader.tsx
"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { deleteImage, extractPathFromUrl } from "@/lib/imageUpload";
import { cn } from "@/lib/utils";
import { useImageUpload } from "@/hooks/use-image-upload";

interface SingleImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  bucket?: string;
  folder?: string;
  className?: string;
  placeholder?: string;
}

export function SingleImageUploader({
  value,
  onChange,
  onRemove,
  bucket = "projects",
  folder = "main",
  className,
  placeholder = "Upload main image",
}: SingleImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadSingle, uploading, error } = useImageUpload(bucket, folder);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    // Delete old image if exists
    if (value) {
      const oldPath = extractPathFromUrl(value);
      if (oldPath) {
        await deleteImage(oldPath, bucket);
      }
    }

    const result = await uploadSingle(file);
    if (result && !result.error) {
      onChange(result.url);
    }
  };

  const handleRemove = async () => {
    if (value) {
      const path = extractPathFromUrl(value);
      if (path) {
        await deleteImage(path, bucket);
      }
      onRemove();
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <Card className="relative overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-video">
              <img
                src={value}
                alt="Uploaded image"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={handleRemove}
                  disabled={uploading}
                  className="absolute top-2 right-2"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={triggerFileInput}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Replace
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card
          className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer"
          onClick={triggerFileInput}
        >
          <CardContent className="flex flex-col items-center justify-center py-8 px-4">
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">{placeholder}</p>
                <p className="text-xs text-muted-foreground">
                  Click to browse or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, WEBP up to 5MB
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

interface MultipleImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  bucket?: string;
  folder?: string;
  maxImages?: number;
  className?: string;
}

export function MultipleImageUploader({
  value = [],
  onChange,
  bucket = "projects",
  folder = "gallery",
  maxImages = 10,
  className,
}: MultipleImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadMultiple, uploading, error } = useImageUpload(bucket, folder);

  const handleFilesSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);

    // Validate file types and sizes
    const validFiles = filesArray.filter((file) => {
      if (!file.type.startsWith("image/")) return false;
      if (file.size > 5 * 1024 * 1024) return false; // 5MB limit
      return true;
    });

    if (validFiles.length === 0) return;

    // Check if adding these files would exceed the limit
    if (value.length + validFiles.length > maxImages) {
      return;
    }

    const results = await uploadMultiple(validFiles);
    const successfulUploads = results
      .filter((result) => !result.error)
      .map((result) => result.url);

    if (successfulUploads.length > 0) {
      onChange([...value, ...successfulUploads]);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = async (urlToRemove: string) => {
    const path = extractPathFromUrl(urlToRemove);
    if (path) {
      await deleteImage(path, bucket);
    }
    onChange(value.filter((url) => url !== urlToRemove));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {value.length < maxImages && (
        <Card
          className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer"
          onClick={triggerFileInput}
        >
          <CardContent className="flex flex-col items-center justify-center py-6 px-4">
            {uploading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Uploading images...
                </p>
              </>
            ) : (
              <>
                <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Add images to gallery</p>
                <p className="text-xs text-muted-foreground">
                  {value.length}/{maxImages} images
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilesSelect}
        className="hidden"
        disabled={uploading}
      />

      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((imageUrl, index) => (
            <Card key={index} className="relative overflow-hidden group">
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  <img
                    src={imageUrl}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemove(imageUrl)}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Badge
                    variant="secondary"
                    className="absolute bottom-2 left-2 text-xs"
                  >
                    {index + 1}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      {value.length >= maxImages && (
        <p className="text-xs text-muted-foreground text-center">
          Maximum {maxImages} images reached
        </p>
      )}
    </div>
  );
}
