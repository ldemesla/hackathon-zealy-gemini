import { redis } from "@/infrastructure/redis";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const uri = searchParams.get("uri");

  if (!uri) {
    return NextResponse.json(
      { error: "URI parameter is required" },
      { status: 400 }
    );
  }

  // Check if questions are being generated
  const isGenerating = await redis.get(`generating-questions:${uri}`);
  if (isGenerating) {
    return NextResponse.json({ status: "generating" }, { status: 202 });
  }

  // Try to get the generated questions
  const questions = await redis.get(uri);
  if (!questions) {
    return NextResponse.json({ error: "Questions not found" }, { status: 404 });
  }

  // Parse and return the questions
  const questionsJson = JSON.parse(questions);
  return NextResponse.json(questionsJson);
}
