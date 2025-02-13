import { Inngest, LogArg } from "inngest";

import { AppError } from "../error/AppError";

class CustomLogger {
  info(...args: LogArg[]): void {
    console.info(args);
  }
  warn(...args: LogArg[]): void {
    console.warn(args);
  }
  error(...args: LogArg[]): void {
    if (args.length === 1 && args[0] instanceof AppError) {
      console.error("[inngest-error]:", {
        code: args[0].code,
        context: args[0].context,
        message: args[0].message,
        statusCode: args[0].statusCode,
      });
    } else {
      console.error(args);
    }
  }
  debug(...args: LogArg[]): void {
    console.debug(args);
  }
}

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "hackathon-api",
  logger: new CustomLogger(),
});
