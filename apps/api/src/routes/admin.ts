import type { FastifyInstance } from "fastify";
import { prisma } from "@/lib/prisma.js";
import { env } from "@/config/env.js";
import bcrypt from "bcryptjs";

// ── Auth guard ─────────────────────────────────────────────────────────────────

function requireAdmin(req: { headers: Record<string, string | string[] | undefined> }, reply: { status: (n: number) => { send: (b: unknown) => unknown } }) {
  const secret = req.headers["x-admin-secret"];
  if (!secret || secret !== env.ADMIN_SECRET) {
    return reply.status(401).send({ error: "Unauthorized" });
  }
}

// ── Routes ─────────────────────────────────────────────────────────────────────

export async function adminRoutes(app: FastifyInstance) {

  // GET /admin/stats — system-wide overview
  app.get("/admin/stats", async (req, reply) => {
    if (requireAdmin(req as never, reply as never)) return;

    const [tenantCount, appointmentCount, patientCount] = await Promise.all([
      prisma.tenant.count(),
      prisma.appointment.count(),
      prisma.patient.count(),
    ]);

    return { tenantCount, appointmentCount, patientCount };
  });

  // GET /admin/tenants — list all tenants with stats
  app.get("/admin/tenants", async (req, reply) => {
    if (requireAdmin(req as never, reply as never)) return;

    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        clinicCode: true,
        country: true,
        locale: true,
        isActive: true,
        credits: true,
        ownerPhone: true,
        phoneNumberId: true,
        createdAt: true,
        _count: {
          select: { appointments: true, patients: true, doctors: true },
        },
      },
    });

    return tenants;
  });

  // POST /admin/tenants — create new tenant
  app.post("/admin/tenants", async (req, reply) => {
    if (requireAdmin(req as never, reply as never)) return;

    const {
      name, clinicCode, dashboardPassword,
      phoneNumberId, wabaId, accessToken,
      ownerPhone, locale, country, timezone, credits,
    } = req.body as {
      name: string;
      clinicCode: string;
      dashboardPassword: string;
      phoneNumberId: string;
      wabaId: string;
      accessToken: string;
      ownerPhone?: string;
      locale?: "AR" | "EN";
      country?: "GULF" | "EGYPT";
      timezone?: string;
      credits?: number;
    };

    if (!name || !clinicCode || !dashboardPassword || !phoneNumberId || !wabaId || !accessToken) {
      return reply.status(400).send({ error: "name, clinicCode, dashboardPassword, phoneNumberId, wabaId, accessToken are required" });
    }

    const hashedPassword = await bcrypt.hash(dashboardPassword, 10);

    try {
      const tenant = await prisma.tenant.create({
        data: {
          name,
          clinicCode: clinicCode.toUpperCase(),
          dashboardPassword: hashedPassword,
          phoneNumberId,
          wabaId,
          accessToken,
          ownerPhone: ownerPhone ?? null,
          locale: locale ?? "AR",
          country: country ?? "GULF",
          timezone: timezone ?? "Asia/Riyadh",
          credits: credits ?? 100,
        },
      });

      return { id: tenant.id, name: tenant.name, clinicCode: tenant.clinicCode };
    } catch (err: unknown) {
      const e = err as { code?: string };
      if (e.code === "P2002") {
        return reply.status(409).send({ error: "clinicCode or phoneNumberId already exists" });
      }
      throw err;
    }
  });

  // PATCH /admin/tenants/:id — update credits, isActive, name
  app.patch("/admin/tenants/:id", async (req, reply) => {
    if (requireAdmin(req as never, reply as never)) return;

    const { id } = req.params as { id: string };
    const { credits, isActive, name, dashboardPassword } = req.body as {
      credits?: number;
      isActive?: boolean;
      name?: string;
      dashboardPassword?: string;
    };

    const data: Record<string, unknown> = {};
    if (credits !== undefined) data.credits = credits;
    if (isActive !== undefined) data.isActive = isActive;
    if (name !== undefined) data.name = name;
    if (dashboardPassword) data.dashboardPassword = await bcrypt.hash(dashboardPassword, 10);

    const tenant = await prisma.tenant.update({ where: { id }, data });
    return { id: tenant.id, name: tenant.name, credits: tenant.credits, isActive: tenant.isActive };
  });

  // DELETE /admin/tenants/:id — hard delete (careful!)
  app.delete("/admin/tenants/:id", async (req, reply) => {
    if (requireAdmin(req as never, reply as never)) return;
    const { id } = req.params as { id: string };
    await prisma.tenant.delete({ where: { id } });
    return { ok: true };
  });
}
