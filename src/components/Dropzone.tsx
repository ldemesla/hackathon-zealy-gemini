"use client";

import { useState, useCallback } from "react";
import { FileIcon, UploadIcon } from "lucide-react";
import type { DragEvent } from "react";

interface DropzoneProps {
  onFileSelect?: (file: File | null) => void;
  selectedFile: File | null;
}

export function Dropzone({ onFileSelect, selectedFile }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>("");

  const handleDrag = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFile = useCallback((file: File) => {
    if (!file.type.includes("pdf")) {
      setError("Please upload a PDF file");
      return false;
    }
    setError("");
    return true;
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setError("");

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && validateFile(droppedFile)) {
        onFileSelect?.(droppedFile);
      }
    },
    [onFileSelect, validateFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError("");
      const selectedFile = e.target.files?.[0];
      if (selectedFile && validateFile(selectedFile)) {
        onFileSelect?.(selectedFile);
      }
    },
    [onFileSelect, validateFile]
  );

  return (
    <div className="w-2/5 max-w-2xl mx-auto">
      <div
        className={`relative group rounded-lg border-2 border-dashed transition-colors duration-150
          ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          }
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          aria-label="Upload PDF"
        />

        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          {selectedFile ? (
            <div className="flex items-center gap-2 text-primary">
              <FileIcon className="h-8 w-8" />
              <span className="font-medium">{selectedFile.name}</span>
            </div>
          ) : (
            <>
              <UploadIcon
                className={`h-8 w-8 mb-4 transition-colors duration-150
                  ${isDragging ? "text-primary" : "text-muted-foreground/50"}
                `}
              />
              <p
                className={`text-lg font-medium mb-1 transition-colors duration-150
                ${isDragging ? "text-primary" : "text-muted-foreground"}
              `}
              >
                Select a PDF
              </p>
              <p className="text-sm text-muted-foreground">
                Drag and drop or click to select
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-destructive text-center">{error}</p>
      )}
    </div>
  );
}
