import type { Conversation } from "@prisma/client";
import type { BotContext } from "../engine.js";
import { updateConversation } from "../conversation.js";
import { sendDatePicker } from "./selectingDate.js";

export async function handleSelectingDoctor(
  ctx: BotContext,
  conversation: Conversation,
  doctorId: string
) {
  const isArabic = ctx.tenant.locale === "AR";
  const context = {
    ...(conversation.context as Record<string, unknown>),
    doctorId,
  };

  const updated = await updateConversation(conversation.id, {
    state: "SELECTING_DATE",
    context: context as never,
  });

  await sendDatePicker(ctx, updated, isArabic);
}
