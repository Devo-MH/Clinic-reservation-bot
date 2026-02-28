import { prisma } from "@/lib/prisma.js";
import type { Conversation, ConversationState, Prisma } from "@prisma/client";

const CONVERSATION_TTL_MINUTES = 30;

export async function getOrCreateConversation(
  tenantId: string,
  phone: string
): Promise<Conversation> {
  const expiresAt = new Date(Date.now() + CONVERSATION_TTL_MINUTES * 60 * 1000);

  return prisma.conversation.upsert({
    where: { tenantId_phone: { tenantId, phone } },
    create: { tenantId, phone, state: "IDLE", context: {}, expiresAt },
    update: { expiresAt }, // refresh TTL on each interaction
  });
}

export async function updateConversation(
  id: string,
  data: Partial<{
    state: ConversationState;
    context: Prisma.InputJsonObject;
    patientId: string;
    expiresAt: Date;
  }>
): Promise<Conversation> {
  return prisma.conversation.update({ where: { id }, data });
}

export async function resetConversation(id: string): Promise<void> {
  await prisma.conversation.update({
    where: { id },
    data: { state: "IDLE", context: {} },
  });
}
