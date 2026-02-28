import type { Conversation } from "@prisma/client";
import type { BotContext } from "../engine.js";
import { updateConversation } from "../conversation.js";
import { prisma } from "@/lib/prisma.js";
import { format, parseISO, set } from "date-fns";
import { ar } from "date-fns/locale";

export async function handleSelectingTime(
  ctx: BotContext,
  conversation: Conversation,
  time: string // "HH:mm"
) {
  const isArabic = ctx.tenant.locale === "AR";
  const context = conversation.context as Record<string, unknown>;

  const dateStr = context.date as string;
  const doctorId = context.doctorId as string;
  const serviceId = context.serviceId as string | undefined;

  const [hours, minutes] = time.split(":").map(Number);
  const scheduledAt = set(parseISO(dateStr), { hours, minutes, seconds: 0, milliseconds: 0 });

  const [doctor, service] = await Promise.all([
    prisma.doctor.findUnique({ where: { id: doctorId } }),
    serviceId ? prisma.service.findUnique({ where: { id: serviceId } }) : Promise.resolve(null),
  ]);

  const updatedContext = { ...context, time, scheduledAt: scheduledAt.toISOString() };

  await updateConversation(conversation.id, {
    state: "CONFIRMING",
    context: updatedContext as never,
  });

  const doctorName = isArabic ? doctor?.nameAr : (doctor?.nameEn ?? doctor?.nameAr);
  const serviceName = service
    ? isArabic
      ? service.nameAr
      : (service.nameEn ?? service.nameAr)
    : null;

  const dateFormatted = format(scheduledAt, isArabic ? "EEEE، dd MMMM yyyy" : "EEEE, MMM dd yyyy", {
    locale: isArabic ? ar : undefined,
  });

  const summary = isArabic
    ? [
        "📋 *تأكيد الموعد*",
        "",
        serviceName ? `🏥 الخدمة: ${serviceName}` : "",
        `👨‍⚕️ الطبيب: ${doctorName}`,
        `📅 التاريخ: ${dateFormatted}`,
        `⏰ الوقت: ${time}`,
        "",
        "هل تريد تأكيد الحجز؟",
      ]
        .filter(Boolean)
        .join("\n")
    : [
        "📋 *Appointment Summary*",
        "",
        serviceName ? `🏥 Service: ${serviceName}` : "",
        `👨‍⚕️ Doctor: ${doctorName}`,
        `📅 Date: ${dateFormatted}`,
        `⏰ Time: ${time}`,
        "",
        "Would you like to confirm?",
      ]
        .filter(Boolean)
        .join("\n");

  await ctx.send({
    type: "button",
    to: ctx.phone,
    body: summary,
    buttons: [
      { id: "confirm", title: isArabic ? "✅ تأكيد" : "✅ Confirm" },
      { id: "change_date", title: isArabic ? "📅 تغيير التاريخ" : "📅 Change Date" },
      { id: "cancel_flow", title: isArabic ? "❌ إلغاء" : "❌ Cancel" },
    ],
  });
}
