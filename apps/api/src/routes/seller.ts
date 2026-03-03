import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma.js";
import { env } from "@/config/env.js";

function verifySeller(req: { headers: Record<string, string | string[] | undefined> }): string | null {
  const auth = req.headers["authorization"] as string | undefined;
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    const payload = jwt.verify(auth.slice(7), env.JWT_SECRET) as { sellerId?: string; role?: string };
    if (payload.role !== "seller" || !payload.sellerId) return null;
    return payload.sellerId;
  } catch {
    return null;
  }
}

export async function sellerRoutes(app: FastifyInstance) {

  // POST /seller/login
  app.post("/seller/login", async (req, reply) => {
    const { referralCode, password } = req.body as { referralCode: string; password: string };
    if (!referralCode || !password) {
      return reply.status(400).send({ error: "referralCode and password required" });
    }

    const seller = await prisma.seller.findUnique({
      where: { referralCode: referralCode.trim().toUpperCase() },
    });

    if (!seller || !seller.isActive) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, seller.password);
    if (!valid) return reply.status(401).send({ error: "Invalid credentials" });

    const token = jwt.sign(
      { sellerId: seller.id, role: "seller" },
      env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return { token, sellerId: seller.id, sellerName: seller.name, referralCode: seller.referralCode };
  });

  // GET /seller/dashboard — seller's own stats + commissions
  app.get("/seller/dashboard", async (req, reply) => {
    const sellerId = verifySeller(req as never);
    if (!sellerId) return reply.status(401).send({ error: "Unauthorized" });

    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      select: { id: true, name: true, referralCode: true, commissionRate: true },
    });
    if (!seller) return reply.status(404).send({ error: "Not found" });

    const [tenants, commissions] = await Promise.all([
      prisma.tenant.findMany({
        where: { sellerId },
        select: {
          id: true, name: true, clinicCode: true, country: true, isActive: true, createdAt: true,
          _count: { select: { appointments: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.commission.findMany({
        where: { sellerId },
        include: {
          payment: { select: { bundle: true, amount: true, currency: true, createdAt: true } },
          seller: { select: { tenants: { where: { id: { not: "" } }, select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    // get tenant names for commissions
    const tenantMap = Object.fromEntries(tenants.map((t) => [t.id, t.name]));

    const totalEarned = commissions.reduce((s, c) => s + c.amount, 0);
    const pendingPayout = commissions.filter((c) => c.status === "PENDING").reduce((s, c) => s + c.amount, 0);

    return {
      seller,
      stats: { tenantCount: tenants.length, totalEarned, pendingPayout },
      tenants,
      commissions: commissions.map((c) => ({
        id: c.id,
        tenantName: tenantMap[c.tenantId] ?? c.tenantId,
        bundle: c.payment.bundle,
        paymentAmount: c.payment.amount,
        commissionAmount: c.amount,
        currency: c.currency,
        status: c.status,
        createdAt: c.createdAt,
      })),
    };
  });
}
