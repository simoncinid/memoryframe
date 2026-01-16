"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { validateImageFile, formatFileSize } from "@/lib/utils";
import { copy } from "@/content/copy";

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
  value?: File | null;
  onClear?: () => void;
  label?: string;
  guidelines?: readonly string[];
}

export function UploadDropzone({
  onFileSelect,
  value,
  onClear,
  label,
  guidelines = copy.create.uploadGuidelines,
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error || "Invalid file");
        return;
      }

      setError(null);
      onFileSelect(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleClear = useCallback(() => {
    setPreview(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onClear?.();
  }, [onClear]);

  if (preview && value) {
    return (
      <div className="relative rounded-xl border-2 border-[#FFDFB9] overflow-hidden bg-[#FFF5EB]">
        <div className="aspect-square relative">
          <Image
            src={preview}
            alt="Uploaded preview"
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <p className="text-sm font-medium truncate max-w-[180px]">
                {value.name}
              </p>
              <p className="text-xs text-white/70">
                {formatFileSize(value.size)}
              </p>
            </div>
            <button
              onClick={handleClear}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Remove image"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Guidelines */}
      {guidelines.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {guidelines.map((guideline, index) => (
            <span
              key={index}
              className="text-xs text-[#7D132E] bg-[#FFE8D1] px-2 py-1 rounded-full"
            >
              {guideline}
            </span>
          ))}
        </div>
      )}

      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative rounded-xl border-2 border-dashed cursor-pointer transition-colors aspect-square flex flex-col items-center justify-center p-6 text-center",
          isDragging
            ? "border-[#A4193D] bg-[#FFE8D1]"
            : "border-[#FFDFB9] hover:border-[#A4193D] bg-[#FFF5EB]"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleInputChange}
          className="sr-only"
          aria-label={label || "Upload image"}
        />

        <div className="w-12 h-12 rounded-full bg-[#FFDFB9] flex items-center justify-center mb-4">
          <svg
            className="w-6 h-6 text-[#7D132E]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        <p className="text-sm font-medium text-[#A4193D] mb-1">
          {label || "Click to upload or drag and drop"}
        </p>
        <p className="text-xs text-[#7D132E]">JPG, PNG, WebP up to 10MB</p>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

