import type { Conversation, Patient } from "@prisma/client";
import type { BotContext } from "../engine.js";
import { updateConversation, resetConversation } from "../conversation.js";
import { prisma } from "@/lib/prisma.js";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export async function handleCancelling(
  ctx: BotContext,
  conversation: Conversation,
  input: string,
  patient: Patient
) {
  const isArabic = ctx.tenant.locale === "AR";
  const context = conversation.context as Record<string, unknown>;

  // In CANCELLING state — show upcoming appointments
  if (conversation.state === "CANCELLING") {
    const appointments = await prisma.appointment.findMany({
      where: {
        patientId: patient.id,
        tenantId: ctx.tenant.id,
        status: "CONFIRMED",
        scheduledAt: { gte: new Date() },
      },
      include: { doctor: true },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    });

    if (!appointments.length) {
      await resetConversation(conversation.id);
      await ctx.send({
        type: "text",
        to: ctx.phone,
        body: isArabic
          ? "لا توجد مواعيد قادمة لإلغائها."
          : "You have no upcoming appointments to cancel.",
      });
      return;
    }

    await updateConversation(conversation.id, { state: "CONFIRM_CANCEL" });

    await ctx.send({
      type: "list",
      to: ctx.phone,
      header: isArabic ? "❌ إلغاء موعد" : "❌ Cancel Appointment",
      body: isArabic ? "اختر الموعد الذي تريد إلغاءه:" : "Select the appointment to cancel:",
      buttonText: isArabic ? "عرض المواعيد" : "View Appointments",
      sections: [
        {
          rows: appointments.map((appt) => {
            const doctorName = isArabic ? appt.doctor.nameAr : (appt.doctor.nameEn ?? appt.doctor.nameAr);
            const dateStr = format(
              appt.scheduledAt,
              isArabic ? "dd/MM/yyyy - HH:mm" : "MMM dd, yyyy - h:mm a"
            );
            return {
              id: appt.id,
              title: `${doctorName}`,
              description: dateStr,
            };
          }),
        },
      ],
    });
    return;
  }

  // In CONFIRM_CANCEL state — input is the appointment ID
  const appointmentId = input;
  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, patientId: patient.id, status: "CONFIRMED" },
    include: { doctor: true },
  });

  if (!appointment) {
    await resetConversation(conversation.id);
    await ctx.send({
      type: "text",
      to: ctx.phone,
      body: isArabic ? "لم يتم العثور على الموعد." : "Appointment not found.",
    });
    return;
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED" },
  });

  await resetConversation(conversation.id);

  const doctorName = isArabic ? appointment.doctor.nameAr : (appointment.doctor.nameEn ?? appointment.doctor.nameAr);
  const dateStr = format(appointment.scheduledAt, isArabic ? "dd/MM/yyyy الساعة HH:mm" : "MMM dd, yyyy at h:mm a");

  await ctx.send({
    type: "text",
    to: ctx.phone,
    body: isArabic
      ? `✅ تم إلغاء موعدك مع ${doctorName} بتاريخ ${dateStr} بنجاح.\n\nأرسل أي رسالة للعودة للقائمة.`
      : `✅ Your appointment with ${doctorName} on ${dateStr} has been cancelled.\n\nSend any message to return to the menu.`,
  });
}
