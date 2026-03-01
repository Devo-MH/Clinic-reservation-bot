-- AlterTable
ALTER TABLE "tenants" ADD COLUMN "clinicCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "tenants_clinicCode_key" ON "tenants"("clinicCode");
