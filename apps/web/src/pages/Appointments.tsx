import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  getAppointments, createAppointment, updateAppointmentStatus,
} from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, Plus, MoreVertical, CheckCircle2, Clock, XCircle,
  CalendarDays, User, Stethoscope, Filter,
} from "lucide-react";

const TENANT_ID = localStorage.getItem("clinic_tenant_id") ?? import.meta.env.VITE_TENANT_ID ?? "";

const STATUSES = ["CONFIRMED", "PENDING", "CANCELLED", "NO_SHOW", "COMPLETED"] as const;

const STATUS_META: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary" | "info" }> = {
  CONFIRMED: { label: "مؤكد", variant: "success" },
  PENDING: { label: "قيد الانتظار", variant: "warning" },
  CANCELLED: { label: "ملغي", variant: "destructive" },
  NO_SHOW: { label: "لم يحضر", variant: "secondary" },
  COMPLETED: { label: "مكتمل", variant: "info" },
};

// ── Create Appointment Modal ────────────────────────────────────────────────────

function CreateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    patientPhone: "", doctorId: "", serviceId: "", date: "", time: "", notes: "",
  });

  const { data: doctors } = useQuery({
    queryKey: ["doctors", TENANT_ID],
    queryFn: () => import("@/lib/api").then(m => m.getDoctors(TENANT_ID)),
    enabled: open,
  });

  const { data: services } = useQuery({
    queryKey: ["services", TENANT_ID],
    queryFn: () => import("@/lib/api").then(m => m.getServices(TENANT_ID)),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: () =>
      createAppointment({
        tenantId: TENANT_ID,
        patientPhone: form.patientPhone,
        doctorId: form.doctorId,
        serviceId: form.serviceId || undefined,
        scheduledAt: new Date(`${form.date}T${form.time}`).toISOString(),
        notes: form.notes || undefined,
      }),
    onSuccess: () => {
      toast.success("تم إنشاء الموعد بنجاح");
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      onClose();
      setForm({ patientPhone: "", doctorId: "", serviceId: "", date: "", time: "", notes: "" });
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.error ?? "حدث خطأ أثناء إنشاء الموعد");
    },
  });

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>موعد جديد</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>رقم المريض <span className="text-red-500">*</span></Label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pr-9"
                placeholder="05XXXXXXXX"
                value={form.patientPhone}
                onChange={e => set("patientPhone", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>الطبيب <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Stethoscope className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
              <select
                className="w-full pr-9 pl-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.doctorId}
                onChange={e => set("doctorId", e.target.value)}
              >
                <option value="">اختر الطبيب...</option>
                {doctors?.map(d => (
                  <option key={d.id} value={d.id}>{d.nameAr}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>الخدمة</Label>
            <select
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              value={form.serviceId}
              onChange={e => set("serviceId", e.target.value)}
            >
              <option value="">بدون خدمة محددة</option>
              {services?.map(s => (
                <option key={s.id} value={s.id}>{s.nameAr}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>التاريخ <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={form.date}
                onChange={e => set("date", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>الوقت <span className="text-red-500">*</span></Label>
              <Input
                type="time"
                value={form.time}
                onChange={e => set("time", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>ملاحظات</Label>
            <Input
              placeholder="ملاحظات اختيارية..."
              value={form.notes}
              onChange={e => set("notes", e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!form.patientPhone || !form.doctorId || !form.date || !form.time || mutation.isPending}
          >
            {mutation.isPending ? "جاري الإنشاء..." : "إنشاء الموعد"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function AppointmentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const queryClient = useQueryClient();

  const queryParams: Record<string, string> = {};
  if (statusFilter) queryParams.status = statusFilter;
  if (dateFilter) queryParams.date = dateFilter;

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["appointments", TENANT_ID, statusFilter, dateFilter],
    queryFn: () => getAppointments(TENANT_ID, queryParams),
    refetchInterval: 30_000,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateAppointmentStatus(id, status),
    onSuccess: (_, vars) => {
      const labels: Record<string, string> = {
        COMPLETED: "تم تعيين الموعد كمكتمل",
        NO_SHOW: "تم تعيين الموعد كلم يحضر",
        CANCELLED: "تم إلغاء الموعد",
      };
      toast.success(labels[vars.status] ?? "تم تحديث الحالة");
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
    onError: () => toast.error("حدث خطأ أثناء التحديث"),
  });

  const filtered = appointments?.filter((a) => {
    if (!search) return true;
    const name = (a.patient.nameAr ?? a.patient.phone).toLowerCase();
    const doc = a.doctor.nameAr.toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || doc.includes(q) || a.patient.phone.includes(q);
  });

  const hasFilters = search || dateFilter || statusFilter;

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">المواعيد</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {appointments?.length ?? 0} نتيجة
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          موعد جديد
        </Button>
      </div>

      {/* ── Filter Bar ──────────────────────────────────────────────── */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pr-9"
                placeholder="بحث بالاسم أو الطبيب..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Date */}
            <div className="relative">
              <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                className="pr-9 w-auto"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="relative">
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <select
                className="pr-9 pl-3 py-2 h-10 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">كل الحالات</option>
                {STATUSES.map(s => (
                  <option key={s} value={s}>{STATUS_META[s].label}</option>
                ))}
              </select>
            </div>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setDateFilter(""); setStatusFilter(""); setSearch(""); }}
              >
                مسح الفلاتر
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                {["المريض", "الطبيب", "الخدمة", "التاريخ والوقت", "الحالة", ""].map((h, i) => (
                  <th
                    key={i}
                    className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <Skeleton className="h-4 w-full max-w-[120px]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !filtered?.length ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <CalendarDays className="w-8 h-8 opacity-30" />
                      <p className="text-sm">{hasFilters ? "لا توجد نتائج للفلاتر المحددة" : "لا توجد مواعيد بعد"}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((appt) => {
                  const badge = STATUS_META[appt.status];
                  const dt = new Date(appt.scheduledAt);
                  const canAction = appt.status === "PENDING" || appt.status === "CONFIRMED";
                  return (
                    <tr key={appt.id} className="hover:bg-muted/30 transition-colors group">
                      {/* Patient */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-teal-700">
                              {(appt.patient.nameAr ?? appt.patient.phone).charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {appt.patient.nameAr ?? appt.patient.nameEn ?? "—"}
                            </p>
                            <p className="text-xs text-muted-foreground">{appt.patient.phone}</p>
                          </div>
                        </div>
                      </td>

                      {/* Doctor */}
                      <td className="px-5 py-4">
                        <p className="font-medium">{appt.doctor.nameAr}</p>
                        {appt.doctor.specialty && (
                          <p className="text-xs text-muted-foreground">{appt.doctor.specialty}</p>
                        )}
                      </td>

                      {/* Service */}
                      <td className="px-5 py-4 text-muted-foreground">
                        {appt.service?.nameAr ?? <span className="text-muted-foreground/50">—</span>}
                      </td>

                      {/* DateTime */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                          <div>
                            <p className="font-medium">{format(dt, "dd MMM yyyy", { locale: ar })}</p>
                            <p className="text-xs text-muted-foreground">{format(dt, "HH:mm")}</p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        {canAction && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem
                                onClick={() => mutation.mutate({ id: appt.id, status: "COMPLETED" })}
                                className="gap-2 text-emerald-600 focus:text-emerald-600"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                مكتمل
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => mutation.mutate({ id: appt.id, status: "NO_SHOW" })}
                                className="gap-2 text-amber-600 focus:text-amber-600"
                              >
                                <Clock className="w-3.5 h-3.5" />
                                لم يحضر
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => mutation.mutate({ id: appt.id, status: "CANCELLED" })}
                                className="gap-2 text-destructive focus:text-destructive"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                إلغاء
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <CreateModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
