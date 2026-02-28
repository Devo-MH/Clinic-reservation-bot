import type { Conversation } from "@prisma/client";
import type { BotContext } from "../engine.js";
import { updateConversation } from "../conversation.js";
import { getDoctorsForService } from "@/modules/booking/services.js";
import { sendDatePicker } from "./selectingDate.js";

export async function handleSelectingService(
  ctx: BotContext,
  conversation: Conversation,
  serviceId: string
) {
  const isArabic = ctx.tenant.locale === "AR";

  const doctors = await getDoctorsForService(ctx.tenant.id, serviceId);
  const context = { ...(conversation.context as Record<string, unknown>), serviceId };

  if (doctors.length === 0) {
    await ctx.send({
      type: "text",
      to: ctx.phone,
      body: isArabic
        ? "عذراً، لا يوجد أطباء متاحون لهذه الخدمة حالياً."
        : "Sorry, no doctors are available for this service right now.",
    });
    return;
  }

  if (doctors.length === 1) {
    // Skip doctor selection step
    const updated = await updateConversation(conversation.id, {
      state: "SELECTING_DATE",
      context: { ...context, doctorId: doctors[0].id } as never,
    });
    await sendDatePicker(ctx, updated, isArabic);
    return;
  }

  await updateConversation(conversation.id, {
    state: "SELECTING_DOCTOR",
    context: context as never,
  });

  await ctx.send({
    type: "list",
    to: ctx.phone,
    header: isArabic ? "👨‍⚕️ اختر الطبيب" : "👨‍⚕️ Choose a Doctor",
    body: isArabic ? "الأطباء المتاحون:" : "Available doctors:",
    buttonText: isArabic ? "عرض الأطباء" : "View Doctors",
    sections: [
      {
        rows: doctors.map((d) => ({
          id: d.id,
          title: isArabic ? d.nameAr : (d.nameEn ?? d.nameAr),
          description: d.specialty ?? undefined,
        })),
      },
    ],
  });
}
