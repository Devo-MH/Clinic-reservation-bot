import { Queue } from "bullmq";
import { redisConnection } from "@/lib/redis.js";

const schedulerQueue = new Queue("scheduler", { connection: redisConnection });

export async function startScheduler() {
  // Daily trial-expiry check at 9 AM UTC
  await schedulerQueue.add(
    "trial-check",
    {},
    {
      repeat: { pattern: "0 9 * * *" },
      jobId: "trial-check-daily",
    }
  );
  console.log("[Scheduler] Trial expiry check registered (daily 9:00 UTC)");
}
