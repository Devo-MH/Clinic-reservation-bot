import type { Conversation, Patient } from "@prisma/client";
import type { BotContext } from "../engine.js";
import { updateConversation, resetConversation } from "../conversation.js";
import { prisma } from "@/lib/prisma.js";
import { sendDatePicker } from "./selectingDate.js";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

/** Called from mainMenu — immediately shows upcoming appointments to pick */
export async function startReschedulingFlow(
  ctx: BotContext,
  conversation: Conversation,
  patient: Patient,
  isArabic: boolean
) {
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
    await ctx.send({
      type: "text",
      to: ctx.phone,
      body: isArabic
        ? "لا توجد مواعيد قادمة لتعديلها."
        : "You have no upcoming appointments to reschedule.",
    });
    return;
  }

  await updateConversation(conversation.id, { state: "RESCHEDULING" });

  await ctx.send({
    type: "list",
    to: ctx.phone,
    header: isArabic ? "✏️ تعديل موعد" : "✏️ Reschedule Appointment",
    body: isArabic ? "اختر الموعد الذي تريد تعديله:" : "Select the appointment to reschedule:",
    buttonText: isArabic ? "عرض المواعيد" : "View Appointments",
    sections: [
      {
        rows: appointments.map((appt) => {
          const doctorName = isArabic
            ? appt.doctor.nameAr
            : (appt.doctor.nameEn ?? appt.doctor.nameAr);
          const dateStr = format(
            appt.scheduledAt,
            isArabic ? "dd/MM/yyyy - HH:mm" : "MMM dd, yyyy - h:mm a",
            { locale: isArabic ? ar : undefined }
          );
          return { id: appt.id, title: doctorName, description: dateStr };
        }),
      },
    ],
  });
}

/** Called from engine when state = RESCHEDULING — input is the selected appointment ID */
export async function handleRescheduling(
  ctx: BotContext,
  conversation: Conversation,
  input: string,
  patient: Patient
) {
  const isArabic = ctx.tenant.locale === "AR";

  const appointment = await prisma.appointment.findFirst({
    where: { id: input, patientId: patient.id, tenantId: ctx.tenant.id, status: "CONFIRMED" },
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

  const updated = await updateConversation(conversation.id, {
    state: "SELECTING_DATE",
    context: {
      ...(conversation.context as Record<string, unknown>),
      reschedulingAppointmentId: appointment.id,
      doctorId: appointment.doctorId,
    } as never,
  });

  await sendDatePicker(ctx, updated, isArabic);
}
