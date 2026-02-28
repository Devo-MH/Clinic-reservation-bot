import OpenAI from "openai";
import { env } from "@/config/env.js";

const openai = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

export type Intent =
  | "BOOK_APPOINTMENT"
  | "VIEW_APPOINTMENTS"
  | "CANCEL_APPOINTMENT"
  | "GREETING"
  | "HELP"
  | "UNKNOWN";

export type ExtractedIntent = {
  intent: Intent;
  confidence: number;
  entities: {
    date?: string;       // ISO date string if detected
    time?: string;       // "HH:mm" if detected
    doctorName?: string;
    serviceName?: string;
  };
};

function keywordFallback(userMessage: string): ExtractedIntent {
  const text = userMessage.toLowerCase();
  const bookKeywords = ["book", "حجز", "أحجز", "موعد", "appointment", "reserve"];
  const cancelKeywords = ["cancel", "إلغاء", "ألغي", "إلغي"];
  const viewKeywords = ["view", "show", "مواعيدي", "appointments", "my"];
  const greetKeywords = ["hi", "hello", "hey", "مرحبا", "أهلا", "هلا", "سلام"];

  let intent: Intent = "UNKNOWN";
  if (greetKeywords.some((k) => text.includes(k))) intent = "GREETING";
  else if (bookKeywords.some((k) => text.includes(k))) intent = "BOOK_APPOINTMENT";
  else if (cancelKeywords.some((k) => text.includes(k))) intent = "CANCEL_APPOINTMENT";
  else if (viewKeywords.some((k) => text.includes(k))) intent = "VIEW_APPOINTMENTS";

  return { intent, confidence: 0.6, entities: {} };
}

export async function extractIntent(
  userMessage: string,
  locale: "AR" | "EN"
): Promise<ExtractedIntent> {
  if (!openai) return keywordFallback(userMessage);

  const systemPrompt = `You are an intent classifier for a medical clinic WhatsApp bot.
Extract the user's intent and any relevant entities from their message.
The user communicates in ${locale === "AR" ? "Arabic (Gulf dialect)" : "English"}.

Respond ONLY with valid JSON matching this schema:
{
  "intent": "BOOK_APPOINTMENT" | "VIEW_APPOINTMENTS" | "CANCEL_APPOINTMENT" | "GREETING" | "HELP" | "UNKNOWN",
  "confidence": 0.0-1.0,
  "entities": {
    "date": "ISO date or null (handle informal dates like 'tomorrow', 'بكره', 'الأسبوع الجاي')",
    "time": "HH:mm or null",
    "doctorName": "string or null",
    "serviceName": "string or null"
  }
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    response_format: { type: "json_object" },
    temperature: 0,
    max_tokens: 200,
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  return JSON.parse(raw) as ExtractedIntent;
}
