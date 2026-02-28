import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDoctors, updateSchedule } from "@/lib/api";
import { TENANT_ID } from "@/lib/utils";
import { Save, Clock } from "lucide-react";

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

function buildSchedule(existingSchedules: { dayOfWeek: number; isActive: boolean; startTime: string; endTime: string; breakStart?: string | null; breakEnd?: string | null }[]): DaySchedule[] {
  return DAYS.map(({ day }) => {
    const s = existingSchedules.find((x) => x.dayOfWeek === day);
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

export default function SchedulePage() {
  const queryClient = useQueryClient();
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [saved, setSaved] = useState(false);

  const { data: doctors, isLoading } = useQuery({
    queryKey: ["doctors", TENANT_ID],
    queryFn: () => getDoctors(TENANT_ID),
  });

  // Set default doctor when data loads
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
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
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

  if (isLoading) return <div className="p-8 text-gray-400">جاري التحميل...</div>;
  if (!doctors?.length) return <div className="p-8 text-gray-400">لا يوجد أطباء.</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">إدارة المواعيد</h2>
        <button
          onClick={() => mutation.mutate(schedule)}
          disabled={mutation.isPending}
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-60 transition-colors"
        >
          <Save size={16} />
          {saved ? "✅ تم الحفظ" : mutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
        </button>
      </div>

      {/* Doctor selector */}
      {doctors.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">الطبيب</label>
          <select
            className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={selectedDoctorId ?? ""}
            onChange={(e) => handleDoctorChange(e.target.value)}
          >
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.nameAr}</option>
            ))}
          </select>
        </div>
      )}

      {/* Schedule grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center gap-2">
          <Clock size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">الجدول الأسبوعي</span>
        </div>

        <div className="divide-y divide-gray-100">
          {schedule.map((day) => {
            const dayLabel = DAYS.find((d) => d.day === day.dayOfWeek)?.label;
            return (
              <div key={day.dayOfWeek} className={`px-5 py-4 ${!day.isActive ? "bg-gray-50" : ""}`}>
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Toggle + day name */}
                  <div className="flex items-center gap-3 w-28">
                    <button
                      onClick={() => updateDay(day.dayOfWeek, "isActive", !day.isActive)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        day.isActive ? "bg-brand-600" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          day.isActive ? "translate-x-4" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span className={`text-sm font-medium ${day.isActive ? "text-gray-800" : "text-gray-400"}`}>
                      {dayLabel}
                    </span>
                  </div>

                  {day.isActive ? (
                    <>
                      {/* Working hours */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">من</span>
                        <input
                          type="time"
                          value={day.startTime}
                          onChange={(e) => updateDay(day.dayOfWeek, "startTime", e.target.value)}
                          className="border border-gray-200 rounded-lg text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <span className="text-xs text-gray-500">إلى</span>
                        <input
                          type="time"
                          value={day.endTime}
                          onChange={(e) => updateDay(day.dayOfWeek, "endTime", e.target.value)}
                          className="border border-gray-200 rounded-lg text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>

                      {/* Break */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">استراحة:</span>
                        <input
                          type="time"
                          value={day.breakStart}
                          onChange={(e) => updateDay(day.dayOfWeek, "breakStart", e.target.value)}
                          className="border border-gray-200 rounded-lg text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <span className="text-xs text-gray-400">—</span>
                        <input
                          type="time"
                          value={day.breakEnd}
                          onChange={(e) => updateDay(day.dayOfWeek, "breakEnd", e.target.value)}
                          className="border border-gray-200 rounded-lg text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">إجازة</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
