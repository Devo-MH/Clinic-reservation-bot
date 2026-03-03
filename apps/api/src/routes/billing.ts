import type { FastifyInstance } from "fastify";
import { prisma } from "@/lib/prisma.js";
import { createHmac } from "crypto";
import { env } from "@/config/env.js";

// ── Commission helper ──────────────────────────────────────────────────────────

async function createCommission(paymentId: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { tenant: { select: { sellerId: true } } },
    });

    if (!payment || !payment.tenant.sellerId) return;

    const seller = await prisma.seller.findUnique({
      where: { id: payment.tenant.sellerId },
      select: { commissionRate: true, isActive: true },
    });

    if (!seller || !seller.isActive) return;

    const amount = Math.round(payment.amount * seller.commissionRate * 100) / 100;

    await prisma.commission.upsert({
      where: { paymentId },
      create: {
        sellerId: payment.tenant.sellerId,
        paymentId,
        tenantId: payment.tenantId,
        amount,
        currency: payment.currency,
      },
      update: {},
    });
  } catch {
    // Non-critical — don't fail payment flow
  }
}

// ── Bundle definitions ─────────────────────────────────────────────────────────

export const BUNDLES = {
  STARTER_50: {
    credits: 50,
    prices: { SAR: 25, AED: 35, KWD: 8, QAR: 90, BHD: 9, EGP: 150 },
  },
  GROWTH_200: {
    credits: 200,
    prices: { SAR: 80, AED: 110, KWD: 25, QAR: 290, BHD: 30, EGP: 480 },
  },
  PRO_500: {
    credits: 500,
    prices: { SAR: 150, AED: 210, KWD: 48, QAR: 550, BHD: 57, EGP: 900 },
  },
} as const;

type BundleId = keyof typeof BUNDLES;

// Gulf currencies → Tap Payments; EGP → Paymob
const GULF_CURRENCIES = ["SAR", "AED", "KWD", "QAR", "BHD"];

// ── Helpers ────────────────────────────────────────────────────────────────────

function getCurrency(country: string): string {
  return country === "EGYPT" ? "EGP" : "SAR";
}

function getGateway(currency: string): "TAP" | "PAYMOB" {
  return GULF_CURRENCIES.includes(currency) ? "TAP" : "PAYMOB";
}

// ── Routes ─────────────────────────────────────────────────────────────────────

export async function billingRoutes(app: FastifyInstance) {

  // GET /billing/balance — credits + recent payments
  app.get("/billing/balance", async (req, reply) => {
    const { tenantId } = req.query as Record<string, string>;
    if (!tenantId) return reply.status(400).send({ error: "tenantId required" });

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { credits: true, country: true },
    });
    if (!tenant) return reply.status(404).send({ error: "tenant not found" });

    const payments = await prisma.payment.findMany({
      where: { tenantId, status: "PAID" },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return {
      credits: tenant.credits,
      country: tenant.country,
      currency: getCurrency(tenant.country),
      bundles: BUNDLES,
      payments,
    };
  });

  // POST /billing/checkout — create payment record + return gateway URL
  app.post("/billing/checkout", async (req, reply) => {
    const { tenantId, bundleId, currency } = req.body as {
      tenantId: string;
      bundleId: BundleId;
      currency: string;
    };
    if (!tenantId || !bundleId || !currency) {
      return reply.status(400).send({ error: "tenantId, bundleId, currency required" });
    }

    const bundle = BUNDLES[bundleId];
    if (!bundle) return reply.status(400).send({ error: "invalid bundleId" });

    const amount = bundle.prices[currency as keyof typeof bundle.prices];
    if (!amount) return reply.status(400).send({ error: "unsupported currency" });

    const gateway = getGateway(currency);

    // Create pending payment record
    const payment = await prisma.payment.create({
      data: {
        tenantId,
        bundle: bundleId,
        credits: bundle.credits,
        amount,
        currency,
        gateway,
        status: "PENDING",
      },
    });

    // Guard: ensure gateway credentials are configured
    if (gateway === "TAP" && !env.TAP_SECRET_KEY) {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
      return reply.status(503).send({ error: "Payment gateway not configured. Please contact support." });
    }
    if (gateway === "PAYMOB" && !env.PAYMOB_API_KEY) {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
      return reply.status(503).send({ error: "Payment gateway not configured. Please contact support." });
    }

    const callbackBase = `https://${env.RAILWAY_PUBLIC_DOMAIN ?? "localhost:3001"}`;

    if (gateway === "TAP") {
      // Tap Payments — create charge
      const tapRes = await fetch("https://api.tap.company/v2/charges", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.TAP_SECRET_KEY ?? ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency,
          customer_initiated: true,
          threeDSecure: true,
          save_card: false,
          description: `ClinicBot - ${bundleId}`,
          metadata: { paymentId: payment.id, tenantId },
          reference: { transaction: payment.id, order: payment.id },
          receipt: { email: false, sms: false },
          redirect: { url: `${callbackBase}/billing/tap/return?paymentId=${payment.id}` },
        }),
      }).then((r) => r.json() as Promise<{ id?: string; transaction?: { url?: string } }>);

      if (!tapRes?.transaction?.url) {
        return reply.status(502).send({ error: "Tap payment initiation failed" });
      }

      await prisma.payment.update({
        where: { id: payment.id },
        data: { gatewayRef: tapRes.id },
      });

      return { paymentId: payment.id, redirectUrl: tapRes.transaction.url };

    } else {
      // Paymob — create order then payment key
      const authRes = await fetch("https://accept.paymob.com/api/auth/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: env.PAYMOB_API_KEY ?? "" }),
      }).then((r) => r.json() as Promise<{ token?: string }>);

      if (!authRes.token) return reply.status(502).send({ error: "Paymob auth failed" });

      const orderRes = await fetch("https://accept.paymob.com/api/ecommerce/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authRes.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount_cents: Math.round(amount * 100),
          currency,
          items: [{ name: `ClinicBot ${bundleId}`, quantity: 1, amount_cents: Math.round(amount * 100) }],
          merchant_order_id: payment.id,
        }),
      }).then((r) => r.json() as Promise<{ id?: number }>);

      if (!orderRes.id) return reply.status(502).send({ error: "Paymob order creation failed" });

      const keyRes = await fetch("https://accept.paymob.com/api/acceptance/payment_keys", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authRes.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount_cents: Math.round(amount * 100),
          expiration: 3600,
          order_id: orderRes.id,
          currency,
          integration_id: env.PAYMOB_INTEGRATION_ID ?? "",
          billing_data: {
            first_name: "Clinic", last_name: "Owner",
            email: "clinic@clinicbot.app", phone_number: "NA",
            apartment: "NA", floor: "NA", street: "NA",
            building: "NA", city: "Cairo", country: "EG",
            state: "Cairo", postal_code: "NA",
          },
        }),
      }).then((r) => r.json() as Promise<{ token?: string }>);

      if (!keyRes.token) return reply.status(502).send({ error: "Paymob payment key failed" });

      await prisma.payment.update({
        where: { id: payment.id },
        data: { gatewayRef: String(orderRes.id) },
      });

      return {
        paymentId: payment.id,
        redirectUrl: `https://accept.paymob.com/api/acceptance/iframes/${env.PAYMOB_IFRAME_ID}?payment_token=${keyRes.token}`,
      };
    }
  });

  // GET /billing/paymob/return — Paymob iframe redirect URL after payment
  app.get("/billing/paymob/return", async (req, reply) => {
    const { success, merchant_order_id, id } = req.query as Record<string, string>;
    if (!merchant_order_id) return reply.redirect("/billing?failed=1");

    if (success === "true") {
      const payment = await prisma.payment.update({
        where: { id: merchant_order_id },
        data: { status: "PAID", gatewayRef: id },
      });
      await prisma.tenant.update({
        where: { id: payment.tenantId },
        data: { credits: { increment: payment.credits }, creditAlertSent: false },
      });
      await createCommission(merchant_order_id);
      return reply.redirect("/billing?success=1");
    }

    await prisma.payment.update({ where: { id: merchant_order_id }, data: { status: "FAILED" } });
    return reply.redirect("/billing?failed=1");
  });

  // GET /billing/tap/return — Tap redirects here after payment
  app.get("/billing/tap/return", async (req, reply) => {
    const { paymentId, tap_id, status } = req.query as Record<string, string>;
    if (!paymentId) return reply.redirect("/?billing=failed");

    if (status === "CAPTURED") {
      const payment = await prisma.payment.update({
        where: { id: paymentId },
        data: { status: "PAID", gatewayRef: tap_id },
      });
      await prisma.tenant.update({
        where: { id: payment.tenantId },
        data: { credits: { increment: payment.credits }, creditAlertSent: false },
      });
      await createCommission(paymentId);
      return reply.redirect("/billing?success=1");
    }

    await prisma.payment.update({ where: { id: paymentId }, data: { status: "FAILED" } });
    return reply.redirect("/billing?failed=1");
  });

  // POST /billing/tap/webhook — Tap server-to-server notification
  app.post("/billing/tap/webhook", async (req, reply) => {
    const body = req.body as { id?: string; status?: string; metadata?: { paymentId?: string } };
    const paymentId = body.metadata?.paymentId;
    if (!paymentId) return reply.send({ ok: true });

    if (body.status === "CAPTURED") {
      const payment = await prisma.payment.update({
        where: { id: paymentId },
        data: { status: "PAID", gatewayRef: body.id },
      });
      await prisma.tenant.update({
        where: { id: payment.tenantId },
        data: { credits: { increment: payment.credits }, creditAlertSent: false },
      });
      await createCommission(paymentId);
    } else if (body.status === "FAILED" || body.status === "CANCELLED") {
      await prisma.payment.update({ where: { id: paymentId }, data: { status: "FAILED" } });
    }

    return reply.send({ ok: true });
  });

  // POST /billing/paymob/webhook — Paymob transaction processed callback
  app.post("/billing/paymob/webhook", async (req, reply) => {
    const body = req.body as {
      type?: string;
      obj?: {
        success?: boolean;
        merchant_order_id?: string;
        id?: number;
        hmac?: string;
      };
    };

    if (body.type !== "TRANSACTION" || !body.obj) return reply.send({ ok: true });

    // Verify HMAC
    const hmacSecret = env.PAYMOB_HMAC_SECRET ?? "";
    if (hmacSecret) {
      const o = body.obj;
      const dataString = [
        o.id, "", "", "", "", "", "", o.success, o.merchant_order_id,
      ].join("");
      const computed = createHmac("sha512", hmacSecret).update(dataString).digest("hex");
      if (computed !== o.hmac) return reply.status(401).send({ error: "invalid hmac" });
    }

    const paymentId = body.obj.merchant_order_id;
    if (!paymentId) return reply.send({ ok: true });

    if (body.obj.success) {
      const payment = await prisma.payment.update({
        where: { id: paymentId },
        data: { status: "PAID", gatewayRef: String(body.obj.id) },
      });
      await prisma.tenant.update({
        where: { id: payment.tenantId },
        data: { credits: { increment: payment.credits }, creditAlertSent: false },
      });
      await createCommission(paymentId);
    } else {
      await prisma.payment.update({ where: { id: paymentId }, data: { status: "FAILED" } });
    }

    return reply.send({ ok: true });
  });
}
