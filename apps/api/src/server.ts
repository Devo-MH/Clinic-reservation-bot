import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import staticFiles from "@fastify/static";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import { existsSync } from "fs";
import { env } from "./config/env.js";
import { webhookRoutes } from "./routes/webhook.js";
import { apiRoutes } from "./routes/api.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = Fastify({
  logger: { level: env.LOG_LEVEL },
});

// ── Plugins ───────────────────────────────────────────────────────────────────

await app.register(helmet, { contentSecurityPolicy: false });
await app.register(cors, { origin: "*" });
await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });

// ── Routes ────────────────────────────────────────────────────────────────────

await app.register(webhookRoutes);
await app.register(apiRoutes);

// ── Health check ──────────────────────────────────────────────────────────────

app.get("/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));

// ── Serve React dashboard (production) ────────────────────────────────────────

const webDist = join(__dirname, "../../../apps/web/dist");
if (existsSync(webDist)) {
  await app.register(staticFiles, { root: webDist, prefix: "/" });
  app.setNotFoundHandler(async (_req, reply) => {
    return reply.sendFile("index.html");
  });
}

// ── Start ─────────────────────────────────────────────────────────────────────

try {
  await app.listen({ port: env.PORT, host: "0.0.0.0" });
  console.log(`🚀 API server running on port ${env.PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
