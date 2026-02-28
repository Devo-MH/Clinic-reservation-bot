import type { Conversation, Patient } from "@prisma/client";
import type { BotContext } from "../engine.js";
import { updateConversation, resetConversation } from "../conversation.js";
import { prisma } from "@/lib/prisma.js";
import { scheduleReminders } from "@/modules/notifications/reminders.js";
import { sendDatePicker } from "./selectingDate.js";
import { parseISO } from "date-fns";

const TIER_LIMITS: Record<string, number> = {
  STARTER: 100,
  GROWTH: 300,
  CLINIC: Infinity,
};

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
      // Check monthly booking limit
      const limit = TIER_LIMITS[ctx.tenant.subscriptionTier] ?? 100;
      if (limit !== Infinity) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const thisMonthCount = await prisma.appointment.count({
          where: {
            tenantId: ctx.tenant.id,
            status: { notIn: ["CANCELLED"] },
            createdAt: { gte: startOfMonth },
          },
        });

        if (thisMonthCount >= limit) {
          await resetConversation(conversation.id);
          await ctx.send({
            type: "text",
            to: ctx.phone,
            body: isArabic
              ? "عذراً، وصلت العيادة للحد الأقصى من الحجوزات هذا الشهر. يرجى التواصل مع العيادة مباشرة."
              : "Sorry, the clinic has reached its monthly booking limit. Please contact the clinic directly.",
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

      await ctx.send({
        type: "text",
        to: ctx.phone,
        body: isArabic
          ? `✅ تم تأكيد موعدك بنجاح!\n\nرقم الموعد: ${appointment.id.slice(-6).toUpperCase()}\nسيصلك تذكير قبل الموعد بـ 24 ساعة و ساعتين.\n\nشكراً لاختيارك عيادتنا 🏥`
          : `✅ Your appointment is confirmed!\n\nRef: ${appointment.id.slice(-6).toUpperCase()}\nYou'll receive reminders 24h and 2h before your appointment.\n\nThank you for choosing our clinic 🏥`,
      });
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
