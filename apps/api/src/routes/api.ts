import type { FastifyInstance } from "fastify";
import { prisma } from "@/lib/prisma.js";
import { subDays, startOfDay, endOfDay } from "date-fns";

const TIER_LIMITS: Record<string, number | null> = {
  STARTER: 150,
  SOLO: 500,
  GROWTH: 1000,
  CLINIC: null,
};

export async function apiRoutes(app: FastifyInstance) {
  // ── Appointments ────────────────────────────────────────────────────────────

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

    return prisma.appointment.findMany({
      where,
      include: { patient: true, doctor: true, service: true },
      orderBy: { scheduledAt: "asc" },
    });
  });

  app.post("/api/appointments", async (req, reply) => {
    const body = req.body as {
      tenantId: string; patientPhone: string; doctorId: string;
      serviceId?: string; scheduledAt: string; notes?: string;
    };

    const patient = await prisma.patient.upsert({
      where: { tenantId_phone: { tenantId: body.tenantId, phone: body.patientPhone } },
      create: { tenantId: body.tenantId, phone: body.patientPhone },
      update: {},
    });

    const appointment = await prisma.appointment.create({
      data: {
        tenantId: body.tenantId, patientId: patient.id, doctorId: body.doctorId,
        serviceId: body.serviceId, scheduledAt: new Date(body.scheduledAt),
        status: "CONFIRMED", notes: body.notes,
      },
      include: { patient: true, doctor: true, service: true },
    });

    return reply.status(201).send(appointment);
  });

  app.patch("/api/appointments/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const { status } = req.body as { status: string };
    const valid = ["PENDING", "CONFIRMED", "CANCELLED", "NO_SHOW", "COMPLETED"];
    if (!valid.includes(status)) return reply.status(400).send({ error: "Invalid status" });

    return prisma.appointment.update({
      where: { id }, data: { status: status as never },
      include: { patient: true, doctor: true, service: true },
    });
  });

  // ── Doctors ─────────────────────────────────────────────────────────────────

  app.get("/api/doctors", async (req, reply) => {
    const { tenantId } = req.query as { tenantId: string };
    if (!tenantId) return reply.status(400).send({ error: "tenantId required" });
    return prisma.doctor.findMany({
      where: { tenantId },
      include: { schedules: { orderBy: { dayOfWeek: "asc" } }, services: true },
    });
  });

  app.post("/api/doctors", async (req, reply) => {
    const body = req.body as { tenantId: string; nameAr: string; nameEn?: string; specialty?: string };
    return reply.status(201).send(await prisma.doctor.create({ data: body }));
  });

  app.patch("/api/doctors/:id", async (req) => {
    const { id } = req.params as { id: string };
    const body = req.body as { nameAr?: string; nameEn?: string; specialty?: string; isActive?: boolean };
    return prisma.doctor.update({ where: { id }, data: body });
  });

  // ── Services ────────────────────────────────────────────────────────────────

  app.get("/api/services", async (req, reply) => {
    const { tenantId } = req.query as { tenantId: string };
    if (!tenantId) return reply.status(400).send({ error: "tenantId required" });
    return prisma.service.findMany({ where: { tenantId, isActive: true }, orderBy: { nameAr: "asc" } });
  });

  app.post("/api/services", async (req, reply) => {
    const body = req.body as {
      tenantId: string; nameAr: string; nameEn?: string;
      durationMinutes?: number; price?: number; doctorId?: string;
    };
    return reply.status(201).send(await prisma.service.create({ data: body }));
  });

  app.patch("/api/services/:id", async (req) => {
    const { id } = req.params as { id: string };
    const body = req.body as { nameAr?: string; nameEn?: string; durationMinutes?: number; price?: number; isActive?: boolean };
    return prisma.service.update({ where: { id }, data: body });
  });

  app.delete("/api/services/:id", async (req) => {
    await prisma.service.update({ where: { id: (req.params as { id: string }).id }, data: { isActive: false } });
    return { ok: true };
  });

  // ── Schedule ────────────────────────────────────────────────────────────────

  app.get("/api/schedule", async (req, reply) => {
    const { doctorId } = req.query as { doctorId: string };
    if (!doctorId) return reply.status(400).send({ error: "doctorId required" });
    return prisma.schedule.findMany({ where: { doctorId }, orderBy: { dayOfWeek: "asc" } });
  });

  app.put("/api/schedule", async (req) => {
    const { doctorId, dayOfWeek, startTime, endTime, breakStart, breakEnd, isActive } = req.body as {
      doctorId: string; dayOfWeek: number; startTime: string; endTime: string;
      breakStart?: string; breakEnd?: string; isActive: boolean;
    };
    return prisma.schedule.upsert({
      where: { doctorId_dayOfWeek: { doctorId, dayOfWeek } },
      create: { doctorId, dayOfWeek, startTime, endTime, breakStart, breakEnd, isActive },
      update: { startTime, endTime, breakStart, breakEnd: breakEnd ?? null, isActive },
    });
  });

  // ── Analytics ───────────────────────────────────────────────────────────────

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

  app.get("/api/analytics/weekly", async (req, reply) => {
    const { tenantId } = req.query as { tenantId: string };
    if (!tenantId) return reply.status(400).send({ error: "tenantId required" });

    const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
    return Promise.all(
      days.map(async (day) => ({
        day: day.toLocaleDateString("ar-EG", { weekday: "short" }),
        date: day.toISOString().split("T")[0],
        count: await prisma.appointment.count({
          where: {
            tenantId,
            scheduledAt: { gte: startOfDay(day), lte: endOfDay(day) },
            status: { notIn: ["CANCELLED"] },
          },
        }),
      }))
    );
  });

  app.get("/api/analytics/doctor", async (req, reply) => {
    const { doctorId, tenantId } = req.query as { doctorId: string; tenantId: string };
    if (!doctorId || !tenantId) return reply.status(400).send({ error: "doctorId and tenantId required" });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [today, thisMonth, confirmed, upcoming] = await Promise.all([
      prisma.appointment.count({ where: { tenantId, doctorId, scheduledAt: { gte: startOfDay(now), lte: endOfDay(now) } } }),
      prisma.appointment.count({ where: { tenantId, doctorId, createdAt: { gte: startOfMonth }, status: { notIn: ["CANCELLED"] } } }),
      prisma.appointment.count({ where: { tenantId, doctorId, status: "CONFIRMED" } }),
      prisma.appointment.count({ where: { tenantId, doctorId, status: "CONFIRMED", scheduledAt: { gte: now } } }),
    ]);

    return { today, thisMonth, confirmed, upcoming };
  });
}
