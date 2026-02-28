import type { Conversation } from "@prisma/client";
import type { BotContext } from "../engine.js";
import { updateConversation } from "../conversation.js";
import { getServicesForTenant } from "@/modules/booking/services.js";

export async function handleMainMenu(
  ctx: BotContext,
  conversation: Conversation,
  selection: string
) {
  const isArabic = ctx.tenant.locale === "AR";

  switch (selection) {
    case "book":
      await startBookingFlow(ctx, conversation, isArabic);
      break;
    case "my_appointments":
      await updateConversation(conversation.id, { state: "SHOWING_APPOINTMENTS" });
      await ctx.send({
        type: "text",
        to: ctx.phone,
        body: isArabic ? "⏳ جاري تحميل مواعيدك..." : "⏳ Loading your appointments...",
      });
      break;
    case "cancel":
      await updateConversation(conversation.id, { state: "CANCELLING" });
      await ctx.send({
        type: "text",
        to: ctx.phone,
        body: isArabic
          ? "من فضلك أرسل رقم الموعد الذي تريد إلغاءه، أو أرسل 'مواعيدي' لعرض مواعيدك."
          : "Please send the appointment number you want to cancel, or send 'appointments' to view your upcoming bookings.",
      });
      break;
    default:
      // Unknown selection — re-show menu
      await updateConversation(conversation.id, { state: "IDLE" });
      break;
  }
}

async function startBookingFlow(
  ctx: BotContext,
  conversation: Conversation,
  isArabic: boolean
) {
  const services = await getServicesForTenant(ctx.tenant.id);

  if (!services.length) {
    await ctx.send({
      type: "text",
      to: ctx.phone,
      body: isArabic
        ? "عذراً، لا توجد خدمات متاحة حالياً. يرجى التواصل مع العيادة."
        : "Sorry, no services are available right now. Please contact the clinic.",
    });
    return;
  }

  await updateConversation(conversation.id, { state: "SELECTING_SERVICE" });

  await ctx.send({
    type: "list",
    to: ctx.phone,
    header: isArabic ? "🏥 حجز موعد" : "🏥 Book Appointment",
    body: isArabic ? "اختر الخدمة المطلوبة:" : "Select a service:",
    buttonText: isArabic ? "عرض الخدمات" : "View Services",
    sections: [
      {
        title: isArabic ? "الخدمات المتاحة" : "Available Services",
        rows: services.map((s) => ({
          id: s.id,
          title: isArabic ? s.nameAr : (s.nameEn ?? s.nameAr),
          description: s.price ? `${s.price} SAR` : undefined,
        })),
      },
    ],
  });
}
