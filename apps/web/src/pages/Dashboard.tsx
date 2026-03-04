import { useQuery } from "@tanstack/react-query";
import { getAnalytics, getAppointments, getWeeklyData } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  CalendarDays, CheckCircle2, XCircle, AlertTriangle,
  TrendingUp, Clock, User,
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const TENANT_ID = localStorage.getItem("clinic_tenant_id") ?? import.meta.env.VITE_TENANT_ID ?? "";

const STATUS_BADGE: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary" | "info" }> = {
  CONFIRMED: { label: "مؤكد", variant: "success" },
  PENDING: { label: "قيد الانتظار", variant: "warning" },
  CANCELLED: { label: "ملغي", variant: "destructive" },
  NO_SHOW: { label: "لم يحضر", variant: "secondary" },
  COMPLETED: { label: "مكتمل", variant: "info" },
};

const KPI_CARDS = [
  {
    key: "thisMonth" as const,
    label: "هذا الشهر",
    icon: CalendarDays,
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-t-teal-500",
  },
  {
    key: "confirmed" as const,
    label: "مؤكدة",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-t-emerald-500",
  },
  {
    key: "cancelled" as const,
    label: "ملغاة",
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-t-red-500",
  },
  {
    key: "noShows" as const,
    label: "لم يحضروا",
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-t-amber-500",
  },
];

const STATUS_LEFT_BORDER: Record<string, string> = {
  CONFIRMED: "border-l-emerald-500",
  PENDING: "border-l-amber-400",
  CANCELLED: "border-l-red-400",
  NO_SHOW: "border-l-gray-300",
  COMPLETED: "border-l-teal-500",
};

export default function DashboardPage() {
  const today = new Date().toISOString().split("T")[0];

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["analytics", TENANT_ID],
    queryFn: () => getAnalytics(TENANT_ID),
    refetchInterval: 30_000,
  });

  const { data: todayAppts, isLoading: apptLoading } = useQuery({
    queryKey: ["appointments", TENANT_ID, today],
    queryFn: () => getAppointments(TENANT_ID, { date: today }),
    refetchInterval: 30_000,
  });

  const { data: weeklyData } = useQuery({
    queryKey: ["weekly", TENANT_ID],
    queryFn: () => getWeeklyData(TENANT_ID),
    refetchInterval: 60_000,
  });

  const usagePct = analytics?.limit
    ? Math.min(Math.round((analytics.thisMonth / analytics.limit) * 100), 100)
    : 0;

  const progressColor =
    usagePct >= 90 ? "bg-red-500" : usagePct >= 70 ? "bg-amber-500" : "bg-primary";

  const todayLabel = format(new Date(), "EEEE، dd MMMM yyyy", { locale: ar });

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 animate-fade-in">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-l from-teal-700 to-teal-900 p-4 md:p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-teal-200 text-sm">{todayLabel}</p>
            <h1 className="text-2xl font-bold mt-1">مرحباً بك 👋</h1>
            <p className="text-teal-200/80 text-sm mt-1">
              لديك{" "}
              <span className="text-white font-semibold">
                {apptLoading ? "..." : (todayAppts?.length ?? 0)}
              </span>{" "}
              موعد اليوم
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
            <TrendingUp className="w-4 h-4 text-teal-300" />
            <span className="text-sm text-teal-100">
              {analytics?.thisMonth ?? "—"} موعد هذا الشهر
            </span>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {KPI_CARDS.map(({ key, label, icon: Icon, color, bg, border }) => (
          <Card key={key} className={`border-0 border-t-2 ${border} shadow-sm hover:shadow-md transition-shadow`}>
            <CardContent className="p-4 md:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-xs font-medium">{label}</p>
                  {analyticsLoading ? (
                    <Skeleton className="h-8 w-12 mt-2" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {analytics?.[key] ?? 0}
                    </p>
                  )}
                </div>
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Weekly Chart ───────────────────────────────────────────── */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">المواعيد - آخر 7 أيام</CardTitle>
          </CardHeader>
          <CardContent>
            {!weeklyData ? (
              <Skeleton className="h-48 w-full rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f766e" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: 12 }}
                    labelFormatter={(l) => `يوم: ${l}`}
                    formatter={(v) => [v, "موعد"]}
                  />
                  <Area
                    type="monotone" dataKey="count" stroke="#0f766e" strokeWidth={2}
                    fill="url(#tealGrad)" dot={{ fill: "#0f766e", r: 3 }} activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* ── Usage ──────────────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">استخدام الاشتراك</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analyticsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المواعيد هذا الشهر</span>
                  <span className="font-semibold">
                    {analytics?.thisMonth}
                    {analytics?.limit ? ` / ${analytics.limit}` : " (∞)"}
                  </span>
                </div>
                {analytics?.limit && (
                  <>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${progressColor}`}
                        style={{ width: `${usagePct}%` }}
                      />
                    </div>
                    <p className={`text-xs ${usagePct >= 90 ? "text-red-500" : usagePct >= 70 ? "text-amber-500" : "text-muted-foreground"}`}>
                      {usagePct}% من الحصة المتاحة
                      {usagePct >= 80 && " — يُنصح بالترقية"}
                    </p>
                  </>
                )}

                <div className="pt-2 border-t space-y-2">
                  {[
                    { label: "إجمالي الكل", value: analytics?.total },
                    { label: "ملغاة", value: analytics?.cancelled },
                    { label: "لم يحضروا", value: analytics?.noShows },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Today's Appointments ───────────────────────────────────── */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">مواعيد اليوم</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {todayAppts?.length ?? 0} موعد
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {apptLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-16 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : !todayAppts?.length ? (
            <div className="flex flex-col items-center py-10 text-muted-foreground">
              <CalendarDays className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">لا توجد مواعيد اليوم</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayAppts.map((appt) => {
                const badge = STATUS_BADGE[appt.status];
                const time = format(new Date(appt.scheduledAt), "HH:mm");
                const patientName = appt.patient.nameAr ?? appt.patient.nameEn ?? appt.patient.phone;
                return (
                  <div
                    key={appt.id}
                    className={`flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors border-l-2 ${STATUS_LEFT_BORDER[appt.status] ?? "border-l-gray-200"}`}
                  >
                    {/* Time pill */}
                    <div className="flex-shrink-0 w-14 h-11 rounded-xl bg-teal-50 flex flex-col items-center justify-center border border-teal-100">
                      <Clock className="w-3 h-3 text-teal-600 mb-0.5" />
                      <span className="text-xs font-bold text-teal-700">{time}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <p className="text-sm font-medium truncate">{patientName}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        د. {appt.doctor.nameAr}
                        {appt.service && ` • ${appt.service.nameAr}`}
                      </p>
                    </div>

                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
