-- AlterEnum
ALTER TYPE "ConversationState" ADD VALUE 'RESCHEDULING';

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "ownerPhone" TEXT,
ADD COLUMN     "trialStartedAt" TIMESTAMP(3);
