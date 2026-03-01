import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getDoctors, updateSchedule } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Clock } from "lucide-react";

const TENANT_ID = localStorage.getItem("clinic_tenant_id") ?? import.meta.env.VITE_TENANT_ID ?? "";

const DAYS = [
  { day: 0, label: "الأحد" },
  { day: 1, label: "الاثنين" },
  { day: 2, label: "الثلاثاء" },
  { day: 3, label: "الأربعاء" },
  { day: 4, label: "الخميس" },
  { day: 5, label: "الجمعة" },
  { day: 6, label: "السبت" },
];

type DaySchedule = {
  dayOfWeek: number;
  isActive: boolean;
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
};

function buildSchedule(
  existing: { dayOfWeek: number; isActive: boolean; startTime: string; endTime: string; breakStart?: string | null; breakEnd?: string | null }[]
): DaySchedule[] {
  return DAYS.map(({ day }) => {
    const s = existing.find((x) => x.dayOfWeek === day);
    return {
      dayOfWeek: day,
      isActive: s?.isActive ?? false,
      startTime: s?.startTime ?? "09:00",
      endTime: s?.endTime ?? "17:00",
      breakStart: s?.breakStart ?? "13:00",
      breakEnd: s?.breakEnd ?? "14:00",
    };
  });
}

// Reusable toggle switch
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        checked ? "bg-primary" : "bg-muted-foreground/30"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

// Time input styled to match shadcn/ui Input
function TimeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring w-[7rem]"
    />
  );
}

export default function SchedulePage() {
  const queryClient = useQueryClient();
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);

  const { data: doctors, isLoading } = useQuery({
    queryKey: ["doctors", TENANT_ID],
    queryFn: () => getDoctors(TENANT_ID),
  });

  useEffect(() => {
    if (doctors?.length && !selectedDoctorId) {
      setSelectedDoctorId(doctors[0].id);
      setSchedule(buildSchedule(doctors[0].schedules));
    }
  }, [doctors, selectedDoctorId]);

  const mutation = useMutation({
    mutationFn: async (days: DaySchedule[]) => {
      for (const day of days) {
        await updateSchedule({ doctorId: selectedDoctorId!, ...day });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      toast.success("تم حفظ الجدول");
    },
    onError: () => toast.error("حدث خطأ أثناء الحفظ"),
  });

  const handleDoctorChange = (doctorId: string) => {
    const doctor = doctors?.find((d) => d.id === doctorId);
    if (doctor) {
      setSelectedDoctorId(doctorId);
      setSchedule(buildSchedule(doctor.schedules));
    }
  };

  const updateDay = (dayOfWeek: number, field: keyof DaySchedule, value: string | boolean) => {
    setSchedule((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d))
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!doctors?.length) {
    return (
      <div className="p-4 md:p-6 flex flex-col items-center justify-center py-24 text-muted-foreground">
        <Clock className="w-10 h-10 opacity-30 mb-3" />
        <p>أضف طبيباً أولاً من صفحة الأطباء</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-5 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">الجداول</h1>
          <p className="text-sm text-muted-foreground mt-0.5">أوقات العمل الأسبوعية</p>
        </div>
        <Button
          onClick={() => mutation.mutate(schedule)}
          disabled={mutation.isPending}
          className="gap-2 flex-shrink-0"
        >
          <Save className="w-4 h-4" />
          <span className="hidden sm:inline">حفظ التغييرات</span>
          <span className="sm:hidden">حفظ</span>
        </Button>
      </div>

      {/* ── Doctor selector ──────────────────────────────────────── */}
      {doctors.length > 1 && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-foreground flex-shrink-0">الطبيب:</label>
          <select
            className="flex-1 max-w-xs h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={selectedDoctorId ?? ""}
            onChange={(e) => handleDoctorChange(e.target.value)}
          >
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.nameAr}</option>
            ))}
          </select>
        </div>
      )}

      {/* ── Schedule cards ───────────────────────────────────────── */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader className="pb-0 px-4 md:px-5 pt-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            الجدول الأسبوعي
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {schedule.map((day) => {
              const dayLabel = DAYS.find((d) => d.day === day.dayOfWeek)?.label;
              return (
                <div
                  key={day.dayOfWeek}
                  className={`px-4 md:px-5 py-3.5 transition-colors ${!day.isActive ? "bg-muted/30" : ""}`}
                >
                  {/* Row: toggle + day name */}
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="flex items-center gap-2.5 w-28 md:w-32 flex-shrink-0 pt-0.5">
                      <Toggle
                        checked={day.isActive}
                        onChange={() => updateDay(day.dayOfWeek, "isActive", !day.isActive)}
                      />
                      <span className={`text-sm font-medium ${day.isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {dayLabel}
                      </span>
                    </div>

                    {day.isActive ? (
                      /* Wrap on narrow screens */
                      <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
                        {/* Work hours */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground">من</span>
                          <TimeInput value={day.startTime} onChange={(v) => updateDay(day.dayOfWeek, "startTime", v)} />
                          <span className="text-xs text-muted-foreground">إلى</span>
                          <TimeInput value={day.endTime} onChange={(v) => updateDay(day.dayOfWeek, "endTime", v)} />
                        </div>
                        {/* Break */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground/70">استراحة:</span>
                          <TimeInput value={day.breakStart} onChange={(v) => updateDay(day.dayOfWeek, "breakStart", v)} />
                          <span className="text-xs text-muted-foreground/70">–</span>
                          <TimeInput value={day.breakEnd} onChange={(v) => updateDay(day.dayOfWeek, "breakEnd", v)} />
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/60 pt-1">إجازة</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
