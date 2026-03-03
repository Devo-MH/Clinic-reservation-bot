-- ── Sellers & Commissions migration ──────────────────────────────────────────

-- 1. Commission status enum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'PAID');

-- 2. Sellers table
CREATE TABLE "sellers" (
  "id"             TEXT NOT NULL,
  "name"           TEXT NOT NULL,
  "phone"          TEXT NOT NULL,
  "referralCode"   TEXT NOT NULL,
  "password"       TEXT NOT NULL,
  "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.25,
  "isActive"       BOOLEAN NOT NULL DEFAULT true,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sellers_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "sellers_referralCode_key" ON "sellers"("referralCode");

-- 3. Add sellerId to tenants
ALTER TABLE "tenants" ADD COLUMN "sellerId" TEXT;
ALTER TABLE "tenants"
  ADD CONSTRAINT "tenants_sellerId_fkey"
  FOREIGN KEY ("sellerId") REFERENCES "sellers"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. Commissions table
CREATE TABLE "commissions" (
  "id"        TEXT NOT NULL,
  "sellerId"  TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "tenantId"  TEXT NOT NULL,
  "amount"    DOUBLE PRECISION NOT NULL,
  "currency"  TEXT NOT NULL,
  "status"    "CommissionStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "commissions_paymentId_key" ON "commissions"("paymentId");
CREATE INDEX "commissions_sellerId_idx" ON "commissions"("sellerId");

ALTER TABLE "commissions"
  ADD CONSTRAINT "commissions_sellerId_fkey"
  FOREIGN KEY ("sellerId") REFERENCES "sellers"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "commissions"
  ADD CONSTRAINT "commissions_paymentId_fkey"
  FOREIGN KEY ("paymentId") REFERENCES "payments"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
