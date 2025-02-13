import Redis from "ioredis";

import { serverConfig } from "../config/server.config";

export const redis = new Redis(serverConfig.redis.url, {
  maxRetriesPerRequest: null,
});
