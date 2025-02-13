import { eventService } from "@/infrastructure/event/subscriptions";
import { inngest } from "@/infrastructure/inngest";
import { serve } from "inngest/next";

// Increase max duration to 120 seconds (we had a timeout on this function)
// https://vercel.com/docs/functions/configuring-functions/duration#maximum-duration-for-different-runtimes
export const maxDuration = 300;

// Create an API that serves inngest functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: eventService.getTransport("inngest").getFunctions(),
});
