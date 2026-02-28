import { prisma } from "@/lib/prisma.js";
import { format, startOfDay, endOfDay, addMinutes, parseISO, setHours, setMinutes } from "date-fns";

const SLOT_DURATION_MINUTES = 30;

/**
 * Returns available time slots ("HH:mm") for a doctor on a given date.
 */
export async function getAvailableSlots(doctorId: string, date: Date): Promise<string[]> {
  const dayOfWeek = date.getDay(); // 0=Sunday

  const [schedule, exception, existingAppointments] = await Promise.all([
    prisma.schedule.findUnique({ where: { doctorId_dayOfWeek: { doctorId, dayOfWeek } } }),
    prisma.scheduleException.findUnique({
      where: { doctorId_date: { doctorId, date: startOfDay(date) } },
    }),
    prisma.appointment.findMany({
      where: {
        doctorId,
        scheduledAt: { gte: startOfDay(date), lte: endOfDay(date) },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    }),
  ]);

  // Check if this day is closed (exception overrides schedule)
  if (exception?.isClosed) return [];
  if (!schedule?.isActive && !exception?.customHours) return [];

  // Determine working hours
  let startTime: string;
  let endTime: string;
  let breakStart: string | null = null;
  let breakEnd: string | null = null;

  if (exception?.customHours) {
    const custom = exception.customHours as { start: string; end: string };
    startTime = custom.start;
    endTime = custom.end;
  } else if (schedule) {
    startTime = schedule.startTime;
    endTime = schedule.endTime;
    breakStart = schedule.breakStart;
    breakEnd = schedule.breakEnd;
  } else {
    return [];
  }

  // Generate all slots
  const slots: string[] = [];
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  let current = setMinutes(setHours(date, startH), startM);
  const end = setMinutes(setHours(date, endH), endM);

  const bookedTimes = new Set(
    existingAppointments.map((a) => format(a.scheduledAt, "HH:mm"))
  );

  while (addMinutes(current, SLOT_DURATION_MINUTES) <= end) {
    const slotTime = format(current, "HH:mm");

    // Skip break time
    const inBreak =
      breakStart &&
      breakEnd &&
      slotTime >= breakStart &&
      slotTime < breakEnd;

    // Skip if in the past (today only)
    const now = new Date();
    const isToday = format(date, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");
    const isPast = isToday && current <= now;

    if (!inBreak && !isPast && !bookedTimes.has(slotTime)) {
      slots.push(slotTime);
    }

    current = addMinutes(current, SLOT_DURATION_MINUTES);
  }

  return slots;
}
