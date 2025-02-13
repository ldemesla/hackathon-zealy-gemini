import { z } from "zod";

const env = process.env.NODE_ENV ?? "development";

const isTestOrCiEnv = ["test", "ci"].includes(env);
export const isDevelopment = () => env === "development" || isTestOrCiEnv;

const config = {
  env,
  frontendUrl:
    process.env.VERCEL_ENV === "preview"
      ? `https://${process.env.VERCEL_URL}`
      : process.env.FRONTEND_URL,
  redis: {
    url: process.env.REDIS_URL,
  },
  database: {
    url:
      env === "test" ? process.env.DATABASE_URL_TEST : process.env.DATABASE_URL,
  },
};

const schema = z.object({
  env: z.enum(["production", "development", "staging", "test"]),
  frontendUrl: z.string(),
  redis: z.object({
    url: z.string(),
  }),
  database: z.object({
    url: z.string(),
  }),
});

const result = schema.safeParse(config);

if (!result.success) {
  const keys = result.error.errors.map(({ path }) => path.join("."));
  throw new Error(`Missing env keys: ${JSON.stringify(keys, null, 2)}`);
}

export const serverConfig: z.infer<typeof schema> = result.data;
