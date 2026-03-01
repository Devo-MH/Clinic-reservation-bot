import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { getDoctors, getAppointments, getDoctorAnalytics, updateAppointmentStatus } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight, Calendar, CheckCircle, Clock, Users,
  CheckCircle2, XCircle, Stethoscope,
} from "lucide-react";

const TENANT_ID = localStorage.getItem("clinic_tenant_id") ?? import.meta.env.VITE_TENANT_ID ?? "";

const DAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

const STATUS_META: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary" | "info" }> = {
  CONFIRMED: { label: "مؤكد", variant: "success" },
  PENDING:   { label: "انتظار", variant: "warning" },
  CANCELLED: { label: "ملغي", variant: "destructive" },
  NO_SHOW:   { label: "غائب", variant: "secondary" },
  COMPLETED: { label: "مكتمل", variant: "info" },
};

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
    refetchInterval: 30_000,
  });

  const { data: appointments, isLoading: apptLoading } = useQuery({
    queryKey: ["appointments", TENANT_ID, doctorId, dateFilter],
    queryFn: () => getAppointments(TENANT_ID, { doctorId: doctorId!, date: dateFilter }),
    enabled: !!doctorId,
    refetchInterval: 30_000,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateAppointmentStatus(id, status),
    onSuccess: (_, vars) => {
      const labels: Record<string, string> = {
        COMPLETED: "مكتمل", NO_SHOW: "لم يحضر", CANCELLED: "ملغي",
      };
      toast.success(`تم تحديث الحالة إلى: ${labels[vars.status] ?? vars.status}`);
      queryClient.invalidateQueries({ queryKey: ["appointments", TENANT_ID, doctorId] });
      queryClient.invalidateQueries({ queryKey: ["doctor-analytics", doctorId] });
    },
    onError: () => toast.error("حدث خطأ"),
  });

  if (!doctor) {
    return (
      <div className="p-4 md:p-6 flex flex-col items-center justify-center py-24 text-muted-foreground">
        <Stethoscope className="w-10 h-10 opacity-30 mb-3" />
        <p>جاري التحميل...</p>
      </div>
    );
  }

  const stats = [
    { label: "اليوم", value: analytics?.today ?? 0, icon: Calendar, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "الشهر", value: analytics?.thisMonth ?? 0, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "مؤكدة", value: analytics?.confirmed ?? 0, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "قادمة", value: analytics?.upcoming ?? 0, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  const activeSchedules = doctor.schedules.filter(s => s.isActive);

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-5 animate-fade-in">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/doctors")}
          className="flex-shrink-0 h-9 w-9"
        >
          <ArrowRight className="w-4 h-4" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-foreground truncate">{doctor.nameAr}</h1>
          {doctor.specialty && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
              <Stethoscope className="w-3.5 h-3.5" />
              {doctor.specialty}
            </p>
          )}
        </div>
      </div>

      {/* ── KPI Stats ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  {analytics ? (
                    <p className="text-2xl font-bold mt-1">{value}</p>
                  ) : (
                    <Skeleton className="h-7 w-10 mt-1" />
                  )}
                </div>
                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Content grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">

        {/* Appointments — takes 2/3 on desktop */}
        <Card className="lg:col-span-2 border-0 shadow-sm overflow-hidden">
          <CardHeader className="pb-0 px-4 md:px-5 pt-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <CardTitle className="text-sm font-semibold">المواعيد</CardTitle>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="h-8 w-auto text-sm"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 mt-3">
            {apptLoading ? (
              <div className="space-y-px">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="px-4 md:px-5 py-3 flex items-center gap-3">
                    <Skeleton className="h-4 w-12 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-6 w-14 rounded-full" />
                  </div>
                ))}
              </div>
            ) : !appointments?.length ? (
              <div className="flex flex-col items-center py-12 text-muted-foreground">
                <Calendar className="w-8 h-8 opacity-25 mb-2" />
                <p className="text-sm">لا توجد مواعيد في هذا اليوم</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {appointments.map((appt) => {
                  const badge = STATUS_META[appt.status];
                  const canAct = appt.status === "PENDING" || appt.status === "CONFIRMED";
                  return (
                    <div key={appt.id} className="flex items-center gap-3 px-4 md:px-5 py-3 hover:bg-muted/30 transition-colors">
                      {/* Time */}
                      <span className="text-sm font-mono font-semibold text-foreground w-12 flex-shrink-0">
                        {format(new Date(appt.scheduledAt), "HH:mm")}
                      </span>

                      {/* Patient */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {appt.patient.nameAr ?? appt.patient.phone}
                        </p>
                        {appt.service && (
                          <p className="text-xs text-muted-foreground truncate">{appt.service.nameAr}</p>
                        )}
                      </div>

                      {/* Status + actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Badge variant={badge.variant} className="text-xs hidden sm:inline-flex">
                          {badge.label}
                        </Badge>
                        {canAct && (
                          <div className="flex gap-0.5">
                            <button
                              onClick={() => mutation.mutate({ id: appt.id, status: "COMPLETED" })}
                              className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                              title="مكتمل"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => mutation.mutate({ id: appt.id, status: "NO_SHOW" })}
                              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                              title="لم يحضر"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => mutation.mutate({ id: appt.id, status: "CANCELLED" })}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-destructive transition-colors"
                              title="إلغاء"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schedule — 1/3 on desktop */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="px-4 md:px-5 pt-4 pb-0">
            <CardTitle className="text-sm font-semibold">أوقات العمل</CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-3">
            {activeSchedules.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6 px-4">
                لم يُحدد جدول بعد
              </p>
            ) : (
              <div className="divide-y divide-border/50">
                {DAYS_AR.map((dayName, idx) => {
                  const s = doctor.schedules.find((sch) => sch.dayOfWeek === idx);
                  const active = s?.isActive ?? false;
                  return (
                    <div
                      key={idx}
                      className={`px-4 md:px-5 py-2.5 flex justify-between items-center text-sm ${!active ? "opacity-35" : ""}`}
                    >
                      <span className={active ? "font-medium text-foreground" : "text-muted-foreground"}>
                        {dayName}
                      </span>
                      {active ? (
                        <span className="text-xs text-muted-foreground font-mono">
                          {s!.startTime} – {s!.endTime}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">إجازة</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
