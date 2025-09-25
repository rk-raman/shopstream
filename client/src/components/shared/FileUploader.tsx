"use client";

import React, { useCallback, useMemo, useRef } from "react";
import { useUpload } from "@/lib/uploads/useUpload";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X } from "lucide-react";

export type FileUploaderValue = Array<{ public_id: string; url: string }>;

export interface FileUploaderProps {
  categoryPath: string; // e.g., "categories/<id>/image" or any folder path
  label?: string;
  description?: string;
  multiple?: boolean;
  accept?: string; // e.g., "image/*"
  maxFiles?: number;
  disabled?: boolean;
  // Controlled value of uploaded assets (public_id/url pairs)
  value?: FileUploaderValue;
  defaultValue?: FileUploaderValue;
  onChange?: (value: FileUploaderValue) => void;
  className?: string;
}

export default function FileUploader({
  categoryPath,
  label = "Upload files",
  description,
  multiple = false,
  accept = "image/*",
  maxFiles = 10,
  disabled = false,
  value,
  defaultValue = [],
  onChange,
  className,
}: FileUploaderProps) {
  const initial = useMemo(() => value ?? defaultValue, [value, defaultValue]);
  const { assets, onFilesSelected, deleteRemote, cleanup } = useUpload({
    categoryPath,
    multiple,
    initial,
    onChange,
  });

  const inputRef = useRef<HTMLInputElement | null>(null);

  const openFileDialog = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      const files = Array.from(e.target.files);
      if (!multiple && files.length > 1) files.splice(1);
      if (files.length > maxFiles) files.splice(maxFiles);
      onFilesSelected(files);
      // reset input so re-selecting same file works
      e.target.value = "";
    },
    [maxFiles, multiple, onFilesSelected]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (disabled) return;
      const dt = e.dataTransfer;
      const files = Array.from(dt.files || []);
      if (!files.length) return;
      if (!multiple && files.length > 1) files.splice(1);
      if (files.length > maxFiles) files.splice(maxFiles);
      onFilesSelected(files);
    },
    [disabled, maxFiles, multiple, onFilesSelected]
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  React.useEffect(() => () => cleanup(), [cleanup]);

  return (
    <div className={className}>
      {(label || description) && (
        <div className="mb-2">
          {label && <div className="text-sm font-medium">{label}</div>}
          {description && (
            <div className="text-xs text-muted-foreground">{description}</div>
          )}
        </div>
      )}

      <div
        onClick={openFileDialog}
        onDrop={onDrop}
        onDragOver={onDragOver}
        className={`border border-dashed rounded-md p-4 cursor-pointer transition-colors ${
          disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-muted/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={onInputChange}
          className="hidden"
          disabled={disabled}
        />
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-sm">Drag & drop or click to select</div>
            <div className="text-xs text-muted-foreground">
              {multiple ? `Up to ${maxFiles} files` : "Single file"}
            </div>
          </div>
          <Button variant="secondary" type="button" disabled={disabled}>
            Browse
          </Button>
        </div>
      </div>

      {!!assets.length && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {assets.map((a) => (
            <div
              key={a.id}
              className="relative rounded-md border overflow-hidden bg-muted/20"
            >
              {a.previewUrl || a.url ? (
                <img
                  src={a.previewUrl || a.url}
                  alt={a.name}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="w-full h-32 flex items-center justify-center text-xs text-muted-foreground">
                  No Preview
                </div>
              )}

              {a.status === "uploading" && (
                <div className="absolute left-0 right-0 bottom-0 p-2 bg-background/70 backdrop-blur">
                  <Progress value={a.progress} className="h-2" />
                </div>
              )}

              <button
                type="button"
                className="absolute top-1 right-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-background/80 hover:bg-background border"
                onClick={() => deleteRemote(a.id)}
                aria-label="Remove"
              >
                <X className="h-3 w-3" />
              </button>

              {a.status === "error" && (
                <div className="absolute inset-x-0 bottom-0 p-2 bg-red-500/80 text-white text-[10px]">
                  {a.error || "Upload failed"}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
