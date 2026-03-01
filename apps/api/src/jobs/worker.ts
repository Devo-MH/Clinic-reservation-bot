import { Worker } from "bullmq";
import { redisConnection } from "@/lib/redis.js";
import { prisma } from "@/lib/prisma.js";
import { sendWhatsAppMessage } from "@/modules/whatsapp/sender.js";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { ar } from "date-fns/locale";

type ReminderJob = {
  appointmentId: string;
  type: "24h" | "2h";
};

const worker = new Worker<ReminderJob>(
  "reminders",
  async (job) => {
    const { appointmentId, type } = job.data;

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true, doctor: true, tenant: true },
    });

    if (!appointment || appointment.status !== "CONFIRMED") return;

    const { patient, doctor, tenant } = appointment;
    const isArabic = patient.languagePreference === "AR";

    const doctorName = isArabic ? doctor.nameAr : (doctor.nameEn ?? doctor.nameAr);
    const dateStr = format(
      appointment.scheduledAt,
      isArabic ? "EEEE، dd MMMM yyyy الساعة HH:mm" : "EEEE, MMM dd yyyy at h:mm a",
      { locale: isArabic ? ar : undefined }
    );

    const body =
      type === "24h"
        ? isArabic
          ? `🔔 تذكير: لديك موعد غداً\n\n👨‍⚕️ الطبيب: ${doctorName}\n📅 ${dateStr}\n\nللإلغاء أو التعديل، تواصل معنا.`
          : `🔔 Reminder: You have an appointment tomorrow\n\n👨‍⚕️ Doctor: ${doctorName}\n📅 ${dateStr}\n\nTo cancel or reschedule, contact us.`
        : isArabic
        ? `🔔 تذكير: موعدك بعد ساعتين\n\n👨‍⚕️ الطبيب: ${doctorName}\n📅 ${dateStr}`
        : `🔔 Reminder: Your appointment is in 2 hours\n\n👨‍⚕️ Doctor: ${doctorName}\n📅 ${dateStr}`;

    await sendWhatsAppMessage(tenant.phoneNumberId, tenant.accessToken, {
      type: "text",
      to: patient.phone,
      body,
    });

    // Mark as sent
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: type === "24h" ? { reminder24hSent: true } : { reminder2hSent: true },
    });

    console.log(`[Worker] Sent ${type} reminder for appointment ${appointmentId}`);
  },
  { connection: redisConnection, concurrency: 10 }
);

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);
});

// ── Trial expiry check worker ─────────────────────────────────────────────────

const schedulerWorker = new Worker(
  "scheduler",
  async (job) => {
    if (job.name !== "trial-check") return;

    const twelveDaysAgo = subDays(new Date(), 12);
    const tenants = await prisma.tenant.findMany({
      where: {
        trialStartedAt: {
          gte: startOfDay(twelveDaysAgo),
          lte: endOfDay(twelveDaysAgo),
        },
        ownerPhone: { not: null },
        isActive: true,
      },
    });

    for (const tenant of tenants) {
      const isArabic = tenant.locale === "AR";
      await sendWhatsAppMessage(tenant.phoneNumberId, tenant.accessToken, {
        type: "text",
        to: tenant.ownerPhone!,
        body: isArabic
          ? `⚠️ تذكير: تنتهي فترة تجربتك المجانية بعد يومين.\n\nللاستمرار في استخدام الخدمة دون انقطاع، يرجى الاشتراك قبل انتهاء المدة.\n\nتواصل معنا على هذا الرقم للاشتراك.`
          : `⚠️ Reminder: Your free trial ends in 2 days.\n\nTo continue without interruption, please subscribe before the trial ends.\n\nReply to this message to subscribe.`,
      });
    }

    console.log(`[Scheduler] Trial check: notified ${tenants.length} tenant(s)`);
  },
  { connection: redisConnection, concurrency: 1 }
);

schedulerWorker.on("failed", (job, err) => {
  console.error(`[Scheduler] Job ${job?.id} failed:`, err.message);
});

console.log("[Worker] Reminder + scheduler workers started");
