import type { Tenant } from "@prisma/client";
import { prisma } from "@/lib/prisma.js";
import { sendWhatsAppMessage } from "@/modules/whatsapp/sender.js";

const LOW_CREDIT_THRESHOLD = 20;

/**
 * Deduct 1 credit from the tenant after a message is processed.
 * Sends a low-credit alert when credits hit the threshold.
 * Returns false if credits are already exhausted (should not process message).
 */
export async function checkAndDeductCredit(tenant: Tenant): Promise<boolean> {
  // Re-fetch fresh credits (avoid race conditions)
  const fresh = await prisma.tenant.findUnique({
    where: { id: tenant.id },
    select: { credits: true, creditAlertSent: true, ownerPhone: true },
  });

  if (!fresh) return false;

  // No credits — block the message
  if (fresh.credits <= 0) return false;

  // Deduct 1 credit atomically
  const updated = await prisma.tenant.update({
    where: { id: tenant.id },
    data: { credits: { decrement: 1 } },
    select: { credits: true, creditAlertSent: true, ownerPhone: true },
  });

  // Send low-credit alert once
  if (
    updated.credits <= LOW_CREDIT_THRESHOLD &&
    !updated.creditAlertSent &&
    updated.ownerPhone
  ) {
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { creditAlertSent: true },
    });

    await sendWhatsAppMessage(tenant.phoneNumberId, tenant.accessToken, {
      type: "text",
      to: updated.ownerPhone,
      body:
        tenant.locale === "AR"
          ? `⚠️ تنبيه: باقي ${updated.credits} رصيد فقط في حساب عيادتك على موعدك.\n\nللاستمرار في استقبال المرضى، يرجى شحن رصيدك الآن.\n\nتواصل معنا للشحن.`
          : `⚠️ Warning: Only ${updated.credits} credits remaining in your Maw3idak account.\n\nTo keep receiving patients, please top up your credits now.\n\nContact us to recharge.`,
    }).catch(() => {}); // don't fail if alert message fails
  }

  return true;
}

/**
 * Send a "credits exhausted" message to the patient explaining the bot is paused.
 */
export async function sendCreditsExhaustedMessage(
  tenant: Tenant,
  patientPhone: string
): Promise<void> {
  await sendWhatsAppMessage(tenant.phoneNumberId, tenant.accessToken, {
    type: "text",
    to: patientPhone,
    body:
      tenant.locale === "AR"
        ? "عذراً، خدمة الحجز متوقفة مؤقتاً. يرجى التواصل مع العيادة مباشرة."
        : "Sorry, the booking service is temporarily paused. Please contact the clinic directly.",
  }).catch(() => {});
}
