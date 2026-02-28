import { Worker } from "bullmq";
import { redisConnection } from "@/lib/redis.js";
import { prisma } from "@/lib/prisma.js";
import { sendWhatsAppMessage } from "@/modules/whatsapp/sender.js";
import { format } from "date-fns";
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

console.log("[Worker] Reminder worker started");
