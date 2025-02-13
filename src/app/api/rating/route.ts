import { redis } from "@/infrastructure/redis";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const uri = request.nextUrl.searchParams.get("uri");

  if (!uri) {
    return Response.json({ error: "URI is required" }, { status: 400 });
  }

  // Check if rating is being processed
  const isProcessing = await redis.get(`rate-answers:${uri}`);
  if (isProcessing) {
    return Response.json({ status: "processing" }, { status: 202 });
  }

  // Get rating results
  const rating = await redis.get(uri);
  if (!rating) {
    return Response.json({ error: "Rating not found" }, { status: 404 });
  }

  return Response.json(JSON.parse(rating));
}
