-- CreateEnum
CREATE TYPE "Country" AS ENUM ('EGYPT', 'GULF');

-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('TAP', 'PAYMOB');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- AlterTable: remove subscriptionTier, add country/credits/creditAlertSent
ALTER TABLE "tenants"
  DROP COLUMN IF EXISTS "subscriptionTier",
  ADD COLUMN "country"          "Country" NOT NULL DEFAULT 'GULF',
  ADD COLUMN "credits"          INTEGER   NOT NULL DEFAULT 0,
  ADD COLUMN "creditAlertSent"  BOOLEAN   NOT NULL DEFAULT false;

-- CreateTable: payments
CREATE TABLE "payments" (
  "id"         TEXT        NOT NULL,
  "tenantId"   TEXT        NOT NULL,
  "bundle"     TEXT        NOT NULL,
  "credits"    INTEGER     NOT NULL,
  "amount"     DOUBLE PRECISION NOT NULL,
  "currency"   TEXT        NOT NULL,
  "gateway"    "PaymentGateway" NOT NULL,
  "gatewayRef" TEXT,
  "status"     "PaymentStatus"  NOT NULL DEFAULT 'PENDING',
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL,

  CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payments_tenantId_idx" ON "payments"("tenantId");

-- AddForeignKey
ALTER TABLE "payments"
  ADD CONSTRAINT "payments_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
