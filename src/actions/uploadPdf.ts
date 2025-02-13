"use server";
import "@/infrastructure/event/subscriptions";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { join } from "path";
import { writeFile } from "fs/promises";
import { tmpdir } from "os";
import { eventService } from "@/infrastructure/event/event.service";
import { redis } from "@/infrastructure/redis";

const client = new GoogleAIFileManager(process.env.GOOGLE_API_KEY!);

export async function uploadPdf(file: File) {
  try {
    // Create a temporary file path
    const tempFilePath = join(tmpdir(), file.name);

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Write the file to temp directory
    await writeFile(tempFilePath, Buffer.from(arrayBuffer));

    // Upload the file using the path
    const response = await client.uploadFile(tempFilePath, {
      mimeType: "application/pdf",
    });

    await redis.set(
      `generating-questions:${response.file.uri}`,
      "true",
      "EX",
      60
    );

    await eventService.send("upload-pdf", response.file);

    return response;
  } catch (error) {
    console.error("Error uploading PDF:", error);
    throw new Error("Failed to upload PDF");
  }
}
