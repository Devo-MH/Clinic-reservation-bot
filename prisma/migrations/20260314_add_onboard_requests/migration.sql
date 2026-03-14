-- CreateEnum
CREATE TYPE "OnboardRequestStatus" AS ENUM ('PENDING', 'DONE');

-- CreateTable
CREATE TABLE "onboard_requests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "ownerPhone" TEXT NOT NULL,
    "locale" "Locale" NOT NULL DEFAULT 'AR',
    "country" "Country" NOT NULL DEFAULT 'GULF',
    "status" "OnboardRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "onboard_requests_pkey" PRIMARY KEY ("id")
);
