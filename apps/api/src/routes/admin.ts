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
        sellerId: true,
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
      ownerPhone, locale, country, timezone, credits, sellerId,
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
      sellerId?: string;
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
          sellerId: sellerId ?? null,
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

  // ── Seller routes ────────────────────────────────────────────────────────────

  // GET /admin/sellers — list all sellers with commission totals
  app.get("/admin/sellers", async (req, reply) => {
    if (requireAdmin(req as never, reply as never)) return;

    const sellers = await prisma.seller.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { tenants: true, commissions: true } },
        commissions: { select: { amount: true, status: true } },
      },
    });

    return sellers.map((s) => ({
      id: s.id,
      name: s.name,
      phone: s.phone,
      referralCode: s.referralCode,
      commissionRate: s.commissionRate,
      isActive: s.isActive,
      createdAt: s.createdAt,
      tenantCount: s._count.tenants,
      totalEarned: s.commissions.reduce((sum, c) => sum + c.amount, 0),
      pendingPayout: s.commissions.filter((c) => c.status === "PENDING").reduce((sum, c) => sum + c.amount, 0),
    }));
  });

  // POST /admin/sellers — create new seller
  app.post("/admin/sellers", async (req, reply) => {
    if (requireAdmin(req as never, reply as never)) return;

    const { name, phone, referralCode, password, commissionRate } = req.body as {
      name: string; phone: string; referralCode: string; password: string; commissionRate?: number;
    };

    if (!name || !phone || !referralCode || !password) {
      return reply.status(400).send({ error: "name, phone, referralCode, password required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const seller = await prisma.seller.create({
        data: {
          name, phone,
          referralCode: referralCode.toUpperCase(),
          password: hashedPassword,
          commissionRate: commissionRate ?? 0.25,
        },
      });
      return { id: seller.id, name: seller.name, referralCode: seller.referralCode };
    } catch (err: unknown) {
      const e = err as { code?: string };
      if (e.code === "P2002") return reply.status(409).send({ error: "referralCode already exists" });
      throw err;
    }
  });

  // PATCH /admin/sellers/:id — update seller
  app.patch("/admin/sellers/:id", async (req, reply) => {
    if (requireAdmin(req as never, reply as never)) return;
    const { id } = req.params as { id: string };
    const { isActive, commissionRate, name, password } = req.body as {
      isActive?: boolean; commissionRate?: number; name?: string; password?: string;
    };
    const data: Record<string, unknown> = {};
    if (isActive !== undefined) data.isActive = isActive;
    if (commissionRate !== undefined) data.commissionRate = commissionRate;
    if (name !== undefined) data.name = name;
    if (password) data.password = await bcrypt.hash(password, 10);
    const seller = await prisma.seller.update({ where: { id }, data });
    return { id: seller.id, name: seller.name, isActive: seller.isActive };
  });

  // PATCH /admin/commissions/:id/pay — mark commission as paid
  app.patch("/admin/commissions/:id/pay", async (req, reply) => {
    if (requireAdmin(req as never, reply as never)) return;
    const { id } = req.params as { id: string };
    await prisma.commission.update({ where: { id }, data: { status: "PAID" } });
    return { ok: true };
  });

  // PATCH /admin/sellers/:id/pay-all — mark all PENDING commissions as paid
  app.patch("/admin/sellers/:id/pay-all", async (req, reply) => {
    if (requireAdmin(req as never, reply as never)) return;
    const { id } = req.params as { id: string };
    await prisma.commission.updateMany({
      where: { sellerId: id, status: "PENDING" },
      data: { status: "PAID" },
    });
    return { ok: true };
  });
}
