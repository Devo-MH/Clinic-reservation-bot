import { useQuery } from "@tanstack/react-query";
import { getAnalytics, getAppointments } from "@/lib/api";
import { TENANT_ID, STATUS_COLORS, STATUS_LABELS } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar, CheckCircle, XCircle, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { data: analytics } = useQuery({
    queryKey: ["analytics", TENANT_ID],
    queryFn: () => getAnalytics(TENANT_ID),
  });

  const { data: todayAppointments } = useQuery({
    queryKey: ["appointments", TENANT_ID, "today"],
    queryFn: () =>
      getAppointments(TENANT_ID, { date: new Date().toISOString().split("T")[0] }),
  });

  const stats = [
    { label: "هذا الشهر", value: analytics?.thisMonth ?? 0, icon: TrendingUp, color: "text-blue-600 bg-blue-50" },
    { label: "مؤكدة", value: analytics?.confirmed ?? 0, icon: CheckCircle, color: "text-green-600 bg-green-50" },
    { label: "ملغاة", value: analytics?.cancelled ?? 0, icon: XCircle, color: "text-red-600 bg-red-50" },
    { label: "الإجمالي", value: analytics?.total ?? 0, icon: Calendar, color: "text-purple-600 bg-purple-50" },
  ];

  const usagePercent =
    analytics?.limit && analytics.limit > 0
      ? Math.min(100, Math.round((analytics.thisMonth / analytics.limit) * 100))
      : null;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">لوحة التحكم</h2>

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

      {/* Monthly usage bar */}
      {usagePercent !== null && analytics?.limit && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">استخدام الباقة هذا الشهر</span>
            <span className="text-sm text-gray-500">
              {analytics.thisMonth} / {analytics.limit} حجز
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${
                usagePercent >= 90 ? "bg-red-500" : usagePercent >= 70 ? "bg-yellow-500" : "bg-green-500"
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          {usagePercent >= 80 && (
            <p className="text-xs text-red-500 mt-2">
              ⚠️ اقتربت من الحد الأقصى للباقة. تواصل معنا للترقية.
            </p>
          )}
        </div>
      )}

      {/* Today's appointments */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          مواعيد اليوم ({todayAppointments?.length ?? 0})
        </h3>

        {!todayAppointments?.length ? (
          <p className="text-gray-400 text-sm">لا توجد مواعيد اليوم</p>
        ) : (
          <div className="space-y-3">
            {todayAppointments.map((appt) => (
              <div
                key={appt.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {appt.patient.nameAr ?? appt.patient.phone}
                  </p>
                  <p className="text-sm text-gray-500">
                    {appt.doctor.nameAr} · {appt.service?.nameAr}
                  </p>
                </div>
                <div className="text-left flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[appt.status]}`}>
                    {STATUS_LABELS[appt.status]}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {format(new Date(appt.scheduledAt), "HH:mm")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
