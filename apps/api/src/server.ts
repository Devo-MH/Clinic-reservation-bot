// deploy
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
import { authRoutes } from "./routes/auth.js";
import { billingRoutes } from "./routes/billing.js";
import { adminRoutes } from "./routes/admin.js";
import { sellerRoutes } from "./routes/seller.js";
import { onboardRoutes } from "./routes/onboard.js";
import "./jobs/worker.js";
import { startScheduler } from "./jobs/scheduler.js";

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
await app.register(authRoutes);
await app.register(billingRoutes);
await app.register(adminRoutes);
await app.register(sellerRoutes);
await app.register(onboardRoutes);

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

await startScheduler();

try {
  await app.listen({ port: env.PORT, host: "0.0.0.0" });
  console.log(`🚀 API server running on port ${env.PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
// Wed Mar  4 02:57:11 EET 2026
// Wed Mar  4 03:05:35 EET 2026
// Wed Mar  4 21:25:36 EET 2026
// deploy Wed Mar  4 21:36:02 EET 2026
// deploy Wed Mar  4 21:52:42 EET 2026
// Sat Mar 14 13:04:25 EET 2026
