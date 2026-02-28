import type { Tenant } from "@prisma/client";
import type { IncomingMessage } from "@/modules/whatsapp/webhook.js";
import { prisma } from "@/lib/prisma.js";
import { sendWhatsAppMessage } from "@/modules/whatsapp/sender.js";
import { extractIntent } from "@/modules/ai/intent.js";
import { getOrCreateConversation, updateConversation } from "./conversation.js";
import { handleIdle } from "./states/idle.js";
import { handleMainMenu } from "./states/mainMenu.js";
import { handleSelectingService } from "./states/selectingService.js";
import { handleSelectingDoctor } from "./states/selectingDoctor.js";
import { handleSelectingDate } from "./states/selectingDate.js";
import { handleSelectingTime } from "./states/selectingTime.js";
import { handleConfirming } from "./states/confirming.js";
import { handleCancelling } from "./states/cancelling.js";

export type BotContext = {
  tenant: Tenant;
  phone: string;
  send: (msg: Parameters<typeof sendWhatsAppMessage>[2]) => Promise<void>;
};

export async function handleIncomingMessage(tenant: Tenant, message: IncomingMessage) {
  if (message.type === "text" && !message.text?.body) return;

  const phone = message.from;
  const conversation = await getOrCreateConversation(tenant.id, phone);

  // Ensure or create patient record
  const patient = await prisma.patient.upsert({
    where: { tenantId_phone: { tenantId: tenant.id, phone } },
    create: { tenantId: tenant.id, phone, lastInteractionAt: new Date() },
    update: { lastInteractionAt: new Date() },
  });

  if (!conversation.patientId) {
    await updateConversation(conversation.id, { patientId: patient.id });
  }

  const ctx: BotContext = {
    tenant,
    phone,
    send: (msg) => sendWhatsAppMessage(tenant.phoneNumberId, tenant.accessToken, msg),
  };

  // Extract raw text from any message type
  const userText =
    message.text?.body ??
    message.interactive?.button_reply?.id ??
    message.interactive?.list_reply?.id ??
    "";

  // Route to the correct state handler
  switch (conversation.state) {
    case "IDLE":
      await handleIdle(ctx, conversation, userText, patient, tenant.locale);
      break;
    case "MAIN_MENU":
      await handleMainMenu(ctx, conversation, userText);
      break;
    case "SELECTING_SERVICE":
      await handleSelectingService(ctx, conversation, userText);
      break;
    case "SELECTING_DOCTOR":
      await handleSelectingDoctor(ctx, conversation, userText);
      break;
    case "SELECTING_DATE":
      await handleSelectingDate(ctx, conversation, userText, tenant.locale);
      break;
    case "SELECTING_TIME":
      await handleSelectingTime(ctx, conversation, userText);
      break;
    case "CONFIRMING":
      await handleConfirming(ctx, conversation, userText, patient);
      break;
    case "CANCELLING":
    case "CONFIRM_CANCEL":
      await handleCancelling(ctx, conversation, userText, patient);
      break;
    default:
      await handleIdle(ctx, conversation, userText, patient, tenant.locale);
  }
}
