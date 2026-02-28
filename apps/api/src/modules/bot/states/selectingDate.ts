import type { Conversation } from "@prisma/client";
import type { BotContext } from "../engine.js";
import { updateConversation } from "../conversation.js";
import { getAvailableSlots } from "@/modules/booking/availability.js";
import { extractIntent } from "@/modules/ai/intent.js";
import { format, addDays, parseISO } from "date-fns";
import { ar } from "date-fns/locale";

/** Sends the next 7 available dates as a list message */
export async function sendDatePicker(
  ctx: BotContext,
  conversation: Conversation,
  isArabic: boolean
) {
  const context = conversation.context as Record<string, unknown>;
  const doctorId = context.doctorId as string;

  // Build next 7 days
  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => addDays(today, i + 1));

  // Filter to days that have slots
  const availableDates: Date[] = [];
  for (const date of dates) {
    const slots = await getAvailableSlots(doctorId, date);
    if (slots.length > 0) availableDates.push(date);
    if (availableDates.length >= 5) break; // show max 5 dates
  }

  if (!availableDates.length) {
    await ctx.send({
      type: "text",
      to: ctx.phone,
      body: isArabic
        ? "عذراً، لا توجد مواعيد متاحة خلال الأسبوع القادم. يرجى التواصل مع العيادة."
        : "Sorry, no available slots in the next week. Please contact the clinic directly.",
    });
    return;
  }

  await ctx.send({
    type: "list",
    to: ctx.phone,
    header: isArabic ? "📅 اختر التاريخ" : "📅 Choose a Date",
    body: isArabic ? "المواعيد المتاحة:" : "Available dates:",
    buttonText: isArabic ? "عرض التواريخ" : "View Dates",
    sections: [
      {
        rows: availableDates.map((date) => ({
          id: format(date, "yyyy-MM-dd"),
          title: format(date, isArabic ? "EEEE، dd MMMM" : "EEEE, MMM dd", {
            locale: isArabic ? ar : undefined,
          }),
        })),
      },
    ],
  });
}

export async function handleSelectingDate(
  ctx: BotContext,
  conversation: Conversation,
  input: string, // could be "yyyy-MM-dd" from list or natural language
  locale: "AR" | "EN"
) {
  const isArabic = locale === "AR";
  let dateStr = input;

  // If not a valid date string, use AI to parse
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const extracted = await extractIntent(input, locale);
    if (extracted.entities.date) {
      dateStr = extracted.entities.date;
    } else {
      await ctx.send({
        type: "text",
        to: ctx.phone,
        body: isArabic
          ? "لم أفهم التاريخ. من فضلك اختر من القائمة أو أرسل التاريخ بالصيغة: يوم-شهر-سنة"
          : "I didn't understand the date. Please choose from the list or type: DD-MM-YYYY",
      });
      return;
    }
  }

  const existingContext = conversation.context as Record<string, unknown>;
  const doctorId = existingContext.doctorId as string;
  const context = { ...existingContext, date: dateStr };

  await updateConversation(conversation.id, {
    state: "SELECTING_TIME",
    context: context as never,
  });

  // Fetch slots for chosen date
  const slots = await getAvailableSlots(doctorId, parseISO(dateStr));

  if (!slots.length) {
    await ctx.send({
      type: "text",
      to: ctx.phone,
      body: isArabic
        ? "لا توجد أوقات متاحة في هذا اليوم. اختر تاريخاً آخر:"
        : "No slots available on that day. Please choose another date:",
    });
    await updateConversation(conversation.id, { state: "SELECTING_DATE" });
    await sendDatePicker(ctx, conversation, isArabic);
    return;
  }

  // WhatsApp list max = 10 rows — split into morning / afternoon sections
  const morning = slots.filter((s) => s < "13:00").slice(0, 5);
  const afternoon = slots.filter((s) => s >= "14:00").slice(0, 5);

  const sections = [];
  if (morning.length)
    sections.push({
      title: isArabic ? "صباحاً" : "Morning",
      rows: morning.map((s) => ({ id: s, title: s })),
    });
  if (afternoon.length)
    sections.push({
      title: isArabic ? "مساءً" : "Afternoon",
      rows: afternoon.map((s) => ({ id: s, title: s })),
    });

  await ctx.send({
    type: "list",
    to: ctx.phone,
    header: isArabic ? "⏰ اختر الوقت" : "⏰ Choose a Time",
    body: isArabic ? "الأوقات المتاحة:" : "Available time slots:",
    buttonText: isArabic ? "عرض الأوقات" : "View Times",
    sections,
  });
}
