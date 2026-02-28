import type { FastifyInstance } from "fastify";
import { prisma } from "@/lib/prisma.js";

const TIER_LIMITS: Record<string, number | null> = {
  STARTER: 100,
  GROWTH: 300,
  CLINIC: null, // unlimited
};

export async function apiRoutes(app: FastifyInstance) {
  // ── Appointments ──────────────────────────────────────────────────────────

  app.get("/api/appointments", async (req, reply) => {
    const { tenantId, doctorId, status, date } = req.query as Record<string, string>;
    if (!tenantId) return reply.status(400).send({ error: "tenantId required" });

    const where: Record<string, unknown> = { tenantId };
    if (doctorId) where.doctorId = doctorId;
    if (status) where.status = status;
    if (date) {
      const d = new Date(date);
      where.scheduledAt = {
        gte: new Date(d.setHours(0, 0, 0, 0)),
        lte: new Date(d.setHours(23, 59, 59, 999)),
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: { patient: true, doctor: true, service: true },
      orderBy: { scheduledAt: "asc" },
    });

    return appointments;
  });

  // ── Appointment status update ──────────────────────────────────────────────

  app.patch("/api/appointments/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const { status } = req.body as { status: string };

    const valid = ["PENDING", "CONFIRMED", "CANCELLED", "NO_SHOW", "COMPLETED"];
    if (!valid.includes(status)) {
      return reply.status(400).send({ error: "Invalid status" });
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: status as never },
      include: { patient: true, doctor: true, service: true },
    });

    return appointment;
  });

  // ── Doctors ───────────────────────────────────────────────────────────────

  app.get("/api/doctors", async (req, reply) => {
    const { tenantId } = req.query as { tenantId: string };
    if (!tenantId) return reply.status(400).send({ error: "tenantId required" });

    return prisma.doctor.findMany({
      where: { tenantId },
      include: { schedules: { orderBy: { dayOfWeek: "asc" } }, services: true },
    });
  });

  app.post("/api/doctors", async (req, reply) => {
    const body = req.body as {
      tenantId: string;
      nameAr: string;
      nameEn?: string;
      specialty?: string;
    };

    const doctor = await prisma.doctor.create({ data: body });
    return reply.status(201).send(doctor);
  });

  // ── Schedule ───────────────────────────────────────────────────────────────

  app.get("/api/schedule", async (req, reply) => {
    const { doctorId } = req.query as { doctorId: string };
    if (!doctorId) return reply.status(400).send({ error: "doctorId required" });

    return prisma.schedule.findMany({
      where: { doctorId },
      orderBy: { dayOfWeek: "asc" },
    });
  });

  app.put("/api/schedule", async (req, reply) => {
    const { doctorId, dayOfWeek, startTime, endTime, breakStart, breakEnd, isActive } =
      req.body as {
        doctorId: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        breakStart?: string;
        breakEnd?: string;
        isActive: boolean;
      };

    const schedule = await prisma.schedule.upsert({
      where: { doctorId_dayOfWeek: { doctorId, dayOfWeek } },
      create: { doctorId, dayOfWeek, startTime, endTime, breakStart, breakEnd, isActive },
      update: { startTime, endTime, breakStart, breakEnd: breakEnd ?? null, isActive },
    });

    return schedule;
  });

  // ── Doctor analytics ──────────────────────────────────────────────────────

  app.get("/api/analytics/doctor", async (req, reply) => {
    const { doctorId, tenantId } = req.query as { doctorId: string; tenantId: string };
    if (!doctorId || !tenantId) return reply.status(400).send({ error: "doctorId and tenantId required" });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 86400000 - 1);

    const [today, thisMonth, confirmed, upcoming] = await Promise.all([
      prisma.appointment.count({
        where: { tenantId, doctorId, scheduledAt: { gte: startOfToday, lte: endOfToday } },
      }),
      prisma.appointment.count({
        where: { tenantId, doctorId, createdAt: { gte: startOfMonth }, status: { notIn: ["CANCELLED"] } },
      }),
      prisma.appointment.count({
        where: { tenantId, doctorId, status: "CONFIRMED" },
      }),
      prisma.appointment.count({
        where: { tenantId, doctorId, status: "CONFIRMED", scheduledAt: { gte: now } },
      }),
    ]);

    return { today, thisMonth, confirmed, upcoming };
  });

  // ── Analytics ─────────────────────────────────────────────────────────────

  app.get("/api/analytics/overview", async (req, reply) => {
    const { tenantId } = req.query as { tenantId: string };
    if (!tenantId) return reply.status(400).send({ error: "tenantId required" });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [tenant, total, confirmed, cancelled, thisMonth, noShows] = await Promise.all([
      prisma.tenant.findUnique({ where: { id: tenantId }, select: { subscriptionTier: true } }),
      prisma.appointment.count({ where: { tenantId } }),
      prisma.appointment.count({ where: { tenantId, status: "CONFIRMED" } }),
      prisma.appointment.count({ where: { tenantId, status: "CANCELLED" } }),
      prisma.appointment.count({ where: { tenantId, createdAt: { gte: startOfMonth } } }),
      prisma.appointment.count({ where: { tenantId, status: "NO_SHOW" } }),
    ]);

    const limit = tenant ? (TIER_LIMITS[tenant.subscriptionTier] ?? null) : null;

    return { total, confirmed, cancelled, thisMonth, noShows, limit };
  });
}
