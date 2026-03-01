import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3001),

  // Database
  DATABASE_URL: z.string().url(),

  // Auth
  JWT_SECRET: z.string().default("change-me-in-production-please"),

  // Redis
  REDIS_URL: z.string().default("redis://localhost:6379"),

  // WhatsApp (Meta Cloud API)
  WHATSAPP_VERIFY_TOKEN: z.string(),
  WHATSAPP_APP_SECRET: z.string(),

  // OpenAI (optional — bot works without it using keyword fallback)
  OPENAI_API_KEY: z.string().default(""),

  // Optional
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
