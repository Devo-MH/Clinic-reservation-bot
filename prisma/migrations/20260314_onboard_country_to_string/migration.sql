ALTER TABLE "onboard_requests" ALTER COLUMN "country" TYPE TEXT USING country::TEXT;
ALTER TABLE "onboard_requests" ALTER COLUMN "country" SET DEFAULT '';
