import { env } from "@/config/env.js";

/**
 * Parse a Redis URL into BullMQ-compatible connection options.
 * BullMQ bundles its own ioredis — passing plain options avoids version conflicts.
 */
function parseRedisUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname || "localhost",
    port: parseInt(parsed.port || "6379", 10),
    password: parsed.password || undefined,
    db: parsed.pathname ? parseInt(parsed.pathname.slice(1), 10) || 0 : 0,
    tls: parsed.protocol === "rediss:" ? {} : undefined,
    maxRetriesPerRequest: null as null, // required by BullMQ
  };
}

export const redisConnection = parseRedisUrl(env.REDIS_URL);
