import { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Generate a readable, unique clinic code from a clinic name */
async function generateUniqueClinicCode(name: string): Promise<string> {
  // Strip Arabic/spaces, take first 4 Latin chars, uppercase
  const latin = name
    .replace(/[\u0600-\u06FF\s]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  const base = (latin.slice(0, 4) || "CLIN").padEnd(4, "X");

  for (let i = 0; i < 10; i++) {
    const candidate = i === 0 ? base : `${base}${10 + i}`;
    const existing = await prisma.tenant.findUnique({ where: { clinicCode: candidate } });
    if (!existing) return candidate;
  }
  // Fallback: random suffix
  return `${base}${Math.floor(Math.random() * 90 + 10)}`;
}

/** Generate a clean 8-char password (no visually ambiguous chars) */
function generatePassword(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// ── Route ──────────────────────────────────────────────────────────────────────

export async function onboardRoutes(app: FastifyInstance) {

  /**
   * POST /onboard/request
   * Saves a manual onboarding request for the admin to process.
   */
  app.post("/onboard/request", {
    config: { rateLimit: { max: 5, timeWindow: "10 minutes" } },
  }, async (req, reply) => {
    const { name, ownerName, ownerPhone, locale, country } = req.body as {
      name: string;
      ownerName: string;
      ownerPhone: string;
      locale: "AR" | "EN";
      country: "GULF" | "EGYPT";
    };

    if (!name?.trim() || !ownerName?.trim() || !ownerPhone?.trim()) {
      return reply.status(400).send({ error: "يرجى ملء جميع الحقول" });
    }

    await prisma.onboardRequest.create({
      data: { name, ownerName, ownerPhone, locale: locale ?? "AR", country: country ?? "GULF" },
    });

    return { ok: true };
  });

  /**
   * GET /admin/onboard-requests
   * Returns all pending onboard requests (admin only).
   */
  app.get("/admin/onboard-requests", async (req, reply) => {
    const secret = (req.headers["x-admin-secret"] as string) ?? "";
    if (secret !== env.ADMIN_SECRET) return reply.status(401).send({ error: "Unauthorized" });

    const requests = await prisma.onboardRequest.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });
    return requests;
  });

  /**
   * PATCH /admin/onboard-requests/:id/done
   * Marks a request as done after admin creates the tenant manually.
   */
  app.patch("/admin/onboard-requests/:id/done", async (req, reply) => {
    const secret = (req.headers["x-admin-secret"] as string) ?? "";
    if (secret !== env.ADMIN_SECRET) return reply.status(401).send({ error: "Unauthorized" });

    const { id } = req.params as { id: string };
    await prisma.onboardRequest.update({ where: { id }, data: { status: "DONE" } });
    return { ok: true };
  });

  /**
   * POST /onboard/complete
   * Receives a Meta Embedded Signup authorization code + clinic details.
   * Exchanges the code for an access token, extracts the WABA ID and Phone
   * Number ID from the Meta Graph API, then creates the tenant automatically.
   */
  app.post("/onboard/complete", {
    config: {
      rateLimit: { max: 5, timeWindow: "10 minutes" },
    },
  }, async (req, reply) => {
    const { code, name, ownerPhone, locale, country } = req.body as {
      code: string;
      name: string;
      ownerPhone: string;
      locale: "AR" | "EN";
      country: "GULF" | "EGYPT";
    };

    if (!code || !name || !ownerPhone) {
      return reply.status(400).send({ error: "Missing required fields" });
    }

    if (!env.META_APP_ID || !env.META_APP_SECRET || !env.META_CONFIG_ID) {
      app.log.warn("META env vars not configured — onboarding disabled");
      return reply.status(503).send({ error: "Onboarding is not configured yet" });
    }

    // 1. Exchange authorization code → user access token
    let userAccessToken: string;
    try {
      const tokenRes = await fetch(
        `https://graph.facebook.com/v19.0/oauth/access_token` +
        `?client_id=${env.META_APP_ID}` +
        `&client_secret=${env.META_APP_SECRET}` +
        `&code=${encodeURIComponent(code)}`
      );
      const tokenData = await tokenRes.json() as {
        access_token?: string;
        error?: { message: string };
      };
      if (!tokenData.access_token) {
        app.log.error({ tokenData }, "Meta code exchange failed");
        return reply.status(400).send({ error: "رمز التفويض غير صالح أو منتهي الصلاحية. يرجى المحاولة مرة أخرى." });
      }
      userAccessToken = tokenData.access_token;
    } catch (err) {
      app.log.error(err, "Meta token exchange network error");
      return reply.status(502).send({ error: "تعذر الاتصال بـ Meta. يرجى المحاولة مرة أخرى." });
    }

    // 2. Inspect token to find WABA IDs
    let wabaId: string;
    let phoneNumberId: string;
    try {
      const appToken = `${env.META_APP_ID}|${env.META_APP_SECRET}`;
      const debugRes = await fetch(
        `https://graph.facebook.com/debug_token` +
        `?input_token=${encodeURIComponent(userAccessToken)}` +
        `&access_token=${encodeURIComponent(appToken)}`
      );
      const debugData = await debugRes.json() as {
        data?: {
          granular_scopes?: Array<{ scope: string; target_ids?: string[] }>;
        };
        error?: { message: string };
      };

      const wabaScope = debugData.data?.granular_scopes?.find(
        (s) => s.scope === "whatsapp_business_management"
      );
      const wabaIds = wabaScope?.target_ids ?? [];
      if (wabaIds.length === 0) {
        return reply.status(400).send({
          error: "لم يتم العثور على حساب واتساب للأعمال. يرجى إكمال خطوات الربط في نافذة ميتا.",
        });
      }
      wabaId = wabaIds[0];

      // 3. Get phone number ID from WABA
      const phoneRes = await fetch(
        `https://graph.facebook.com/v19.0/${wabaId}/phone_numbers` +
        `?fields=id,display_phone_number` +
        `&access_token=${encodeURIComponent(userAccessToken)}`
      );
      const phoneData = await phoneRes.json() as {
        data?: Array<{ id: string; display_phone_number: string }>;
        error?: { message: string };
      };

      if (!phoneData.data || phoneData.data.length === 0) {
        return reply.status(400).send({
          error: "لم يتم العثور على رقم هاتف على هذا الحساب. يرجى إضافة رقم في Meta Business.",
        });
      }
      phoneNumberId = phoneData.data[0].id;

    } catch (err) {
      app.log.error(err, "Meta API calls failed");
      return reply.status(502).send({ error: "فشل استرداد تفاصيل حساب واتساب." });
    }

    // 4. Check for duplicate registration
    const existing = await prisma.tenant.findUnique({ where: { phoneNumberId } });
    if (existing) {
      return reply.status(409).send({
        error: "هذا الرقم مسجل بالفعل في ClinicBot. تواصل مع الدعم إذا كنت بحاجة إلى مساعدة.",
      });
    }

    // 5. Generate credentials
    const clinicCode = await generateUniqueClinicCode(name);
    const rawPassword = generatePassword(8);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const timezone = country === "EGYPT" ? "Africa/Cairo" : "Asia/Riyadh";

    // 6. Create tenant
    try {
      const tenant = await prisma.tenant.create({
        data: {
          name,
          clinicCode,
          dashboardPassword: hashedPassword,
          phoneNumberId,
          wabaId,
          accessToken: userAccessToken,
          ownerPhone,
          locale: locale ?? "AR",
          country: country ?? "GULF",
          timezone,
          credits: 100,
        },
      });

      app.log.info({ tenantId: tenant.id, clinicCode }, "New tenant onboarded via Embedded Signup");

      return {
        clinicCode: tenant.clinicCode,
        password: rawPassword,
        tenantName: tenant.name,
      };

    } catch (err: unknown) {
      const e = err as { code?: string };
      if (e.code === "P2002") {
        return reply.status(409).send({ error: "هذا الرقم مسجل بالفعل." });
      }
      throw err;
    }
  });
}
