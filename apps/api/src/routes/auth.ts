import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma.js";
import { env } from "@/config/env.js";

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/login", async (req, reply) => {
    const { tenantId, password } = req.body as { tenantId: string; password: string };

    if (!tenantId || !password) {
      return reply.status(400).send({ error: "tenantId and password required" });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true, dashboardPassword: true, isActive: true },
    });

    if (!tenant || !tenant.isActive) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    if (!tenant.dashboardPassword) {
      return reply.status(401).send({ error: "Dashboard not configured" });
    }

    const valid = await bcrypt.compare(password, tenant.dashboardPassword);
    if (!valid) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { tenantId: tenant.id, tenantName: tenant.name },
      env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return { token, tenantId: tenant.id, tenantName: tenant.name };
  });

  // Setup endpoint: set dashboard password (only if not set yet or with old password)
  app.post("/auth/setup", async (req, reply) => {
    const { tenantId, password } = req.body as { tenantId: string; password: string };

    if (!tenantId || !password || password.length < 6) {
      return reply.status(400).send({ error: "tenantId and password (min 6 chars) required" });
    }

    const existing = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { dashboardPassword: true },
    });

    if (!existing) return reply.status(404).send({ error: "Tenant not found" });

    // Only allow setup if no password set yet
    if (existing.dashboardPassword) {
      return reply.status(403).send({ error: "Password already set. Contact support to reset." });
    }

    const hash = await bcrypt.hash(password, 10);
    await prisma.tenant.update({ where: { id: tenantId }, data: { dashboardPassword: hash } });

    return { ok: true };
  });
}
