import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDoctors, getAppointments, getDoctorAnalytics, updateAppointmentStatus } from "@/lib/api";
import { TENANT_ID, STATUS_COLORS, STATUS_LABELS } from "@/lib/utils";
import { format } from "date-fns";
import { ArrowRight, Calendar, CheckCircle, Clock, Users, CheckCircle2, XCircle } from "lucide-react";

const DAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default function DoctorDashboardPage() {
  const { id: doctorId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);

  const { data: doctors } = useQuery({
    queryKey: ["doctors", TENANT_ID],
    queryFn: () => getDoctors(TENANT_ID),
  });

  const doctor = doctors?.find((d) => d.id === doctorId);

  const { data: analytics } = useQuery({
    queryKey: ["doctor-analytics", doctorId],
    queryFn: () => getDoctorAnalytics(doctorId!, TENANT_ID),
    enabled: !!doctorId,
  });

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["appointments", TENANT_ID, doctorId, dateFilter],
    queryFn: () => getAppointments(TENANT_ID, { doctorId: doctorId!, date: dateFilter }),
    enabled: !!doctorId,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateAppointmentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", TENANT_ID, doctorId] });
      queryClient.invalidateQueries({ queryKey: ["doctor-analytics", doctorId] });
    },
  });

  if (!doctor) return <div className="p-8 text-gray-400">جاري التحميل...</div>;

  const stats = [
    { label: "مواعيد اليوم", value: analytics?.today ?? 0, icon: Calendar, color: "text-blue-600 bg-blue-50" },
    { label: "هذا الشهر", value: analytics?.thisMonth ?? 0, icon: Users, color: "text-purple-600 bg-purple-50" },
    { label: "مؤكدة", value: analytics?.confirmed ?? 0, icon: CheckCircle, color: "text-green-600 bg-green-50" },
    { label: "قادمة", value: analytics?.upcoming ?? 0, icon: Clock, color: "text-orange-600 bg-orange-50" },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/doctors")}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowRight size={18} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{doctor.nameAr}</h2>
          {doctor.specialty && <p className="text-sm text-gray-500">{doctor.specialty}</p>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{label}</span>
              <div className={`p-2 rounded-lg ${color}`}>
                <Icon size={18} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Appointments */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">المواعيد</h3>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-gray-200 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {isLoading ? (
            <p className="px-5 py-8 text-gray-400 text-sm text-center">جاري التحميل...</p>
          ) : !appointments?.length ? (
            <p className="px-5 py-8 text-gray-400 text-sm text-center">لا توجد مواعيد في هذا اليوم</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {appointments.map((appt) => (
                <div key={appt.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700 w-12">
                      {format(new Date(appt.scheduledAt), "HH:mm")}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {appt.patient.nameAr ?? appt.patient.phone}
                      </p>
                      {appt.service && (
                        <p className="text-xs text-gray-400">{appt.service.nameAr}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[appt.status]}`}>
                      {STATUS_LABELS[appt.status]}
                    </span>
                    {(appt.status === "PENDING" || appt.status === "CONFIRMED") && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => mutation.mutate({ id: appt.id, status: "COMPLETED" })}
                          className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                          title="مكتمل"
                        >
                          <CheckCircle2 size={15} />
                        </button>
                        <button
                          onClick={() => mutation.mutate({ id: appt.id, status: "NO_SHOW" })}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                          title="لم يحضر"
                        >
                          <Clock size={15} />
                        </button>
                        <button
                          onClick={() => mutation.mutate({ id: appt.id, status: "CANCELLED" })}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                          title="إلغاء"
                        >
                          <XCircle size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">أوقات العمل</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {DAYS_AR.map((dayName, idx) => {
              const s = doctor.schedules.find((sch) => sch.dayOfWeek === idx);
              return (
                <div key={idx} className={`px-5 py-3 flex justify-between items-center ${!s?.isActive ? "opacity-40" : ""}`}>
                  <span className="text-sm text-gray-700">{dayName}</span>
                  {s?.isActive ? (
                    <span className="text-xs text-gray-500">{s.startTime} – {s.endTime}</span>
                  ) : (
                    <span className="text-xs text-gray-400">إجازة</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
