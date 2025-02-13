"use server";
import "@/infrastructure/event/subscriptions";
import { eventService } from "@/infrastructure/event/event.service";
import { redis } from "@/infrastructure/redis";

interface Answer {
  question: string;
  answer: string;
}

export async function rateAnswers(answers: Answer[], uri: string) {
  try {
    await redis.set(`rate-answers:${uri}`, "true", "EX", 60);

    await eventService.send("rate-answers", { answers, uri });

    return { success: true };
  } catch (error) {
    console.error("Error rating answers:", error);
    throw new Error("Failed to rate answers");
  }
}
