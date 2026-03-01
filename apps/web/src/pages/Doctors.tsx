import { useQuery } from "@tanstack/react-query";
import { getDoctors } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Stethoscope } from "lucide-react";

const TENANT_ID = localStorage.getItem("clinic_tenant_id") ?? import.meta.env.VITE_TENANT_ID ?? "";

const DAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function DoctorAvatar({ name }: { name: string }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("");
  return (
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center flex-shrink-0 shadow-sm">
      <span className="text-white font-bold text-base">{initials}</span>
    </div>
  );
}

export default function DoctorsPage() {
  const navigate = useNavigate();

  const { data: doctors, isLoading } = useQuery({
    queryKey: ["doctors", TENANT_ID],
    queryFn: () => getDoctors(TENANT_ID),
  });

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-foreground">الأطباء</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isLoading ? "..." : `${doctors?.length ?? 0} طبيب`}
        </p>
      </div>

      {/* ── Grid ────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-px w-full" />
                <div className="space-y-2">
                  {[1, 2].map(j => <Skeleton key={j} className="h-3 w-full" />)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !doctors?.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Stethoscope className="w-8 h-8 opacity-40" />
          </div>
          <p className="font-medium text-foreground">لا يوجد أطباء بعد</p>
          <p className="text-sm mt-1">أضف بيانات الأطباء من لوحة التحكم</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {doctors.map((doctor) => {
            const activeSchedules = doctor.schedules.filter(s => s.isActive);
            return (
              <Card
                key={doctor.id}
                className="border-0 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-5">
                  {/* ── Top row ─────────────────────────────────── */}
                  <div className="flex items-start gap-4">
                    <DoctorAvatar name={doctor.nameAr} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{doctor.nameAr}</h3>
                        <Badge variant={doctor.isActive ? "success" : "secondary"} className="text-xs">
                          {doctor.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                      </div>
                      {doctor.specialty && (
                        <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Stethoscope className="w-3.5 h-3.5" />
                          {doctor.specialty}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/doctors/${doctor.id}`)}
                      className="gap-1.5 flex-shrink-0 text-xs"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      لوحة الطبيب
                    </Button>
                  </div>

                  {/* ── Schedule ────────────────────────────────── */}
                  {activeSchedules.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
                        أوقات العمل
                      </p>
                      <div className="space-y-1.5">
                        {activeSchedules.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                              <span className="text-foreground font-medium">{DAYS_AR[s.dayOfWeek]}</span>
                            </span>
                            <span className="text-muted-foreground font-mono">
                              {s.startTime} – {s.endTime}
                              {s.breakStart && (
                                <span className="text-muted-foreground/60 mr-1">
                                  (استراحة {s.breakStart}–{s.breakEnd})
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeSchedules.length === 0 && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <p className="text-xs text-muted-foreground/60 text-center py-1">
                        لم يُحدد جدول عمل بعد
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
