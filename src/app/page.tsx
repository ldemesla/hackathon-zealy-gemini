"use client";

import { Button } from "@/components/Button";
import { Dropzone } from "@/components/Dropzone";
import { useState } from "react";
import { uploadPdf } from "@/actions/uploadPdf";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a PDF file first");
      return;
    }

    try {
      setIsUploading(true);
      setError("");
      const response = await uploadPdf(selectedFile);

      // Assuming uploadPdf returns { uri: string } on success
      if (response.file.uri) {
        router.push(`/questions?uri=${encodeURIComponent(response.file.uri)}`);
      } else {
        throw new Error("Upload failed - no URI received");
      }
    } catch (error) {
      setError("Failed to upload PDF");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
      <Dropzone onFileSelect={setSelectedFile} selectedFile={selectedFile} />
      <Button
        size="lg"
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
      >
        {isUploading ? "Uploading..." : "Test your knowledge"}
      </Button>
      {error && <p className="text-sm text-destructive text-center">{error}</p>}
    </div>
  );
}
