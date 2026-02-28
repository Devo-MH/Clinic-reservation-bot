import type { Conversation, Patient } from "@prisma/client";
import type { BotContext } from "../engine.js";
import { updateConversation } from "../conversation.js";

const GREETINGS_AR = ["مرحبا", "أهلا", "هلا", "السلام عليكم", "وعليكم", "صباح", "مساء"];

function isGreeting(text: string): boolean {
  return GREETINGS_AR.some((g) => text.includes(g)) ||
    /^(hi|hello|hey|سلام)/i.test(text);
}

export async function handleIdle(
  ctx: BotContext,
  conversation: Conversation,
  userText: string,
  patient: Patient,
  locale: "AR" | "EN"
) {
  const text = userText.trim();
  const isArabic = locale === "AR";

  // Show main menu on any input
  await updateConversation(conversation.id, { state: "MAIN_MENU" });

  const name = patient.nameAr ?? patient.nameEn ?? "";
  const greeting = isGreeting(text)
    ? isArabic
      ? `أهلاً وسهلاً${name ? ` ${name}` : ""} 👋`
      : `Welcome${name ? ` ${name}` : ""}! 👋`
    : isArabic
    ? `أهلاً بك في عيادتنا 👋`
    : `Welcome to our clinic 👋`;

  await ctx.send({
    type: "button",
    to: ctx.phone,
    body: isArabic
      ? `${greeting}\n\nكيف يمكنني مساعدتك اليوم؟`
      : `${greeting}\n\nHow can I help you today?`,
    buttons: [
      { id: "book", title: isArabic ? "📅 حجز موعد" : "📅 Book Appointment" },
      { id: "my_appointments", title: isArabic ? "📋 مواعيدي" : "📋 My Appointments" },
      { id: "cancel", title: isArabic ? "❌ إلغاء موعد" : "❌ Cancel Appointment" },
    ],
  });
}
