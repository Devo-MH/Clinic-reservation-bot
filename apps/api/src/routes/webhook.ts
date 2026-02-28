import type { FastifyInstance } from "fastify";
import { verifyWebhook, receiveWebhook } from "@/modules/whatsapp/webhook.js";

export async function webhookRoutes(app: FastifyInstance) {
  app.get("/webhook/whatsapp", verifyWebhook);
  app.post("/webhook/whatsapp", receiveWebhook);
}
