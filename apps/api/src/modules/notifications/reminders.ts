import { Queue } from "bullmq";
import { redisConnection } from "@/lib/redis.js";

export const reminderQueue = new Queue("reminders", { connection: redisConnection });

/**
 * Schedules 24h and 2h reminder jobs for an appointment.
 */
export async function scheduleReminders(appointmentId: string, scheduledAt: Date) {
  const now = Date.now();
  const apptTime = scheduledAt.getTime();

  const delay24h = apptTime - 24 * 60 * 60 * 1000 - now;
  const delay2h = apptTime - 2 * 60 * 60 * 1000 - now;

  if (delay24h > 0) {
    await reminderQueue.add(
      "reminder-24h",
      { appointmentId, type: "24h" },
      { delay: delay24h, jobId: `${appointmentId}-24h`, removeOnComplete: true }
    );
  }

  if (delay2h > 0) {
    await reminderQueue.add(
      "reminder-2h",
      { appointmentId, type: "2h" },
      { delay: delay2h, jobId: `${appointmentId}-2h`, removeOnComplete: true }
    );
  }
}

export async function cancelReminders(appointmentId: string) {
  await Promise.all([
    reminderQueue.remove(`${appointmentId}-24h`),
    reminderQueue.remove(`${appointmentId}-2h`),
  ]);
}
