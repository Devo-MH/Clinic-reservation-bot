import type { Conversation, Patient } from "@prisma/client";
import type { BotContext } from "../engine.js";
import { updateConversation, resetConversation } from "../conversation.js";
import { prisma } from "@/lib/prisma.js";
import { scheduleReminders, cancelReminders } from "@/modules/notifications/reminders.js";
import { sendDatePicker } from "./selectingDate.js";
import { parseISO } from "date-fns";
import { env } from "@/config/env.js";

const LOW_CREDIT_THRESHOLD = 10;

export async function handleConfirming(
  ctx: BotContext,
  conversation: Conversation,
  selection: string,
  patient: Patient
) {
  const isArabic = ctx.tenant.locale === "AR";
  const context = conversation.context as Record<string, unknown>;

  switch (selection) {
    case "confirm": {
      const reschedulingId = context.reschedulingAppointmentId as string | undefined;

      if (reschedulingId) {
        // ── Reschedule: update existing appointment ──────────────────────────
        await cancelReminders(reschedulingId);

        const appointment = await prisma.appointment.update({
          where: { id: reschedulingId },
          data: {
            scheduledAt: parseISO(context.scheduledAt as string),
            reminder24hSent: false,
            reminder2hSent: false,
          },
          include: { doctor: true },
        });

        await scheduleReminders(appointment.id, appointment.scheduledAt);
        await resetConversation(conversation.id);

        const doctorName = isArabic
          ? appointment.doctor.nameAr
          : (appointment.doctor.nameEn ?? appointment.doctor.nameAr);

        await ctx.send({
          type: "text",
          to: ctx.phone,
          body: isArabic
            ? `✅ تم تعديل موعدك بنجاح!\n\n👨‍⚕️ الطبيب: ${doctorName}\n📅 ${appointment.scheduledAt.toLocaleString("ar-EG")}\n\nسيصلك تذكير قبل الموعد بـ 24 ساعة وساعتين. 🏥`
            : `✅ Your appointment has been rescheduled!\n\n👨‍⚕️ Doctor: ${doctorName}\n📅 ${appointment.scheduledAt.toLocaleString()}\n\nYou'll receive reminders 24h and 2h before. 🏥`,
        });
      } else {
        // ── New booking ───────────────────────────────────────────────────────
        if (!env.BETA_MODE) {
          // Credit check — only enforced outside beta
          const tenant = await prisma.tenant.findUnique({
            where: { id: ctx.tenant.id },
            select: { credits: true, creditAlertSent: true, ownerPhone: true },
          });

          if (!tenant || tenant.credits <= 0) {
            await resetConversation(conversation.id);
            await ctx.send({
              type: "text",
              to: ctx.phone,
              body: isArabic
                ? "عذراً، العيادة لا تقبل حجوزات جديدة حالياً. يرجى التواصل مع العيادة مباشرة."
                : "Sorry, the clinic is not accepting new bookings at the moment. Please contact the clinic directly.",
            });
            return;
          }
        }

        const appointment = await prisma.appointment.create({
          data: {
            tenantId: ctx.tenant.id,
            patientId: patient.id,
            doctorId: context.doctorId as string,
            serviceId: (context.serviceId as string) ?? undefined,
            scheduledAt: parseISO(context.scheduledAt as string),
            status: "CONFIRMED",
          },
          include: { doctor: true, service: true },
        });

        await scheduleReminders(appointment.id, appointment.scheduledAt);
        await resetConversation(conversation.id);

        if (!env.BETA_MODE) {
          // Deduct 1 credit and check for low balance
          const updated = await prisma.tenant.update({
            where: { id: ctx.tenant.id },
            data: { credits: { decrement: 1 } },
            select: { credits: true, creditAlertSent: true, ownerPhone: true },
          });

          if (
            updated.credits <= LOW_CREDIT_THRESHOLD &&
            !updated.creditAlertSent &&
            updated.ownerPhone
          ) {
            await prisma.tenant.update({
              where: { id: ctx.tenant.id },
              data: { creditAlertSent: true },
            });
            await ctx.send({
              type: "text",
              to: updated.ownerPhone,
              body: isArabic
                ? `⚠️ تنبيه: رصيد الحجوزات في عيادتك أصبح منخفضاً (${updated.credits} حجوزات متبقية).\nيرجى شراء رصيد إضافي من لوحة التحكم لضمان استمرار الخدمة.`
                : `⚠️ Low credit alert: Your clinic has ${updated.credits} bookings remaining.\nPlease top up from the dashboard to ensure uninterrupted service.`,
            });
          }
        }

        await ctx.send({
          type: "text",
          to: ctx.phone,
          body: isArabic
            ? `✅ تم تأكيد موعدك بنجاح!\n\nرقم الموعد: ${appointment.id.slice(-6).toUpperCase()}\nسيصلك تذكير قبل الموعد بـ 24 ساعة و ساعتين.\n\nشكراً لاختيارك عيادتنا 🏥`
            : `✅ Your appointment is confirmed!\n\nRef: ${appointment.id.slice(-6).toUpperCase()}\nYou'll receive reminders 24h and 2h before your appointment.\n\nThank you for choosing our clinic 🏥`,
        });
      }
      break;
    }

    case "change_date": {
      const updated = await updateConversation(conversation.id, { state: "SELECTING_DATE" });
      await sendDatePicker(ctx, updated, isArabic);
      break;
    }

    case "cancel_flow":
    default:
      await resetConversation(conversation.id);
      await ctx.send({
        type: "text",
        to: ctx.phone,
        body: isArabic
          ? "تم إلغاء عملية الحجز. أرسل أي رسالة للعودة للقائمة."
          : "Booking cancelled. Send any message to return to the menu.",
      });
  }
}
