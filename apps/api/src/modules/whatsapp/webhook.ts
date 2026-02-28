import type { FastifyRequest, FastifyReply } from "fastify";
import { env } from "@/config/env.js";
import { handleIncomingMessage } from "@/modules/bot/engine.js";
import { prisma } from "@/lib/prisma.js";

// ── Webhook verification (GET) ────────────────────────────────────────────────

export async function verifyWebhook(req: FastifyRequest, reply: FastifyReply) {
  const query = req.query as Record<string, string>;
  const mode = query["hub.mode"];
  const token = query["hub.verify_token"];
  const challenge = query["hub.challenge"];

  if (mode === "subscribe" && token === env.WHATSAPP_VERIFY_TOKEN) {
    return reply.send(challenge);
  }
  return reply.status(403).send("Forbidden");
}

// ── Incoming message handler (POST) ───────────────────────────────────────────

export async function receiveWebhook(req: FastifyRequest, reply: FastifyReply) {
  const body = req.body as WebhookPayload;

  // Always respond 200 immediately — Meta requires < 20s acknowledgement
  reply.status(200).send("OK");

  try {
    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value;
        if (!value?.messages?.length) continue;

        const phoneNumberId = value.metadata.phone_number_id;
        const tenant = await prisma.tenant.findUnique({ where: { phoneNumberId } });

        if (!tenant || !tenant.isActive) continue;

        for (const message of value.messages) {
          await handleIncomingMessage(tenant, message);
        }
      }
    }
  } catch (err) {
    console.error("[Webhook] Processing error:", err);
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

type WebhookPayload = {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        metadata: { phone_number_id: string; display_phone_number: string };
        messages?: IncomingMessage[];
        statuses?: unknown[];
      };
      field: string;
    }>;
  }>;
};

export type IncomingMessage = {
  id: string;
  from: string; // sender's phone number
  timestamp: string;
  type: "text" | "interactive" | "image" | "audio" | "document";
  text?: { body: string };
  interactive?: {
    type: "button_reply" | "list_reply";
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string };
  };
};
