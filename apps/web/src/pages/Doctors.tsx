import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getDoctors, createDoctor, updateDoctor, type Doctor } from "@/lib/api";
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
import { useNavigate } from "react-router-dom";
import {
  Plus, MoreVertical, Pencil, PowerOff, Power,
  LayoutDashboard, Stethoscope,
} from "lucide-react";

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

// ── Add / Edit Modal ───────────────────────────────────────────────────────────

type FormState = { nameAr: string; nameEn: string; specialty: string };
const EMPTY: FormState = { nameAr: "", nameEn: "", specialty: "" };

function DoctorModal({
  open, onClose, doctor,
}: {
  open: boolean;
  onClose: () => void;
  doctor?: Doctor;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!doctor;
  const [form, setForm] = useState<FormState>(
    doctor
      ? { nameAr: doctor.nameAr, nameEn: doctor.nameEn ?? "", specialty: doctor.specialty ?? "" }
      : EMPTY
  );

  const mutation = useMutation({
    mutationFn: () =>
      isEdit
        ? updateDoctor(doctor!.id, {
            nameAr: form.nameAr,
            nameEn: form.nameEn || undefined,
            specialty: form.specialty || undefined,
          })
        : createDoctor({
            tenantId: TENANT_ID,
            nameAr: form.nameAr,
            nameEn: form.nameEn || undefined,
            specialty: form.specialty || undefined,
          }),
    onSuccess: () => {
      toast.success(isEdit ? "تم تحديث بيانات الطبيب" : "تم إضافة الطبيب");
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      onClose();
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? "حدث خطأ"),
  });

  const set = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "تعديل بيانات الطبيب" : "إضافة طبيب جديد"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>الاسم (عربي) <span className="text-red-500">*</span></Label>
            <Input
              placeholder="د. أحمد محمد"
              value={form.nameAr}
              onChange={e => set("nameAr", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>الاسم (إنجليزي)</Label>
            <Input
              placeholder="Dr. Ahmed Mohammed"
              value={form.nameEn}
              onChange={e => set("nameEn", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>التخصص</Label>
            <Input
              placeholder="مثال: طب عام، أسنان، أطفال..."
              value={form.specialty}
              onChange={e => set("specialty", e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!form.nameAr || mutation.isPending}
          >
            {mutation.isPending ? "جاري الحفظ..." : isEdit ? "حفظ" : "إضافة"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function DoctorsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editDoctor, setEditDoctor] = useState<Doctor | undefined>();

  const { data: doctors, isLoading } = useQuery({
    queryKey: ["doctors", TENANT_ID],
    queryFn: () => getDoctors(TENANT_ID),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateDoctor(id, { isActive }),
    onSuccess: (_, vars) => {
      toast.success(vars.isActive ? "تم تفعيل الطبيب" : "تم تعطيل الطبيب");
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
    onError: () => toast.error("حدث خطأ"),
  });

  const handleEdit = (d: Doctor) => {
    setEditDoctor(d);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditDoctor(undefined);
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-5 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">الأطباء</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? "..." : `${doctors?.length ?? 0} طبيب`}
          </p>
        </div>
        <Button onClick={() => { setEditDoctor(undefined); setModalOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة طبيب
        </Button>
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
          <p className="text-sm mt-1 mb-4">أضف أول طبيب لبدء استقبال الحجوزات</p>
          <Button onClick={() => setModalOpen(true)} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة أول طبيب
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {doctors.map((doctor) => {
            const activeSchedules = doctor.schedules.filter(s => s.isActive);
            return (
              <Card
                key={doctor.id}
                className={`border-0 shadow-sm hover:shadow-md transition-shadow ${!doctor.isActive ? "opacity-60" : ""}`}
              >
                <CardContent className="p-5">
                  {/* ── Top row ─────────────────────────────────── */}
                  <div className="flex items-start gap-4 group">
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

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/doctors/${doctor.id}`)}
                        className="gap-1.5 text-xs h-8"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        لوحته
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => handleEdit(doctor)} className="gap-2">
                            <Pencil className="w-3.5 h-3.5" />
                            تعديل البيانات
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => toggleActive.mutate({ id: doctor.id, isActive: !doctor.isActive })}
                            className={`gap-2 ${doctor.isActive ? "text-destructive focus:text-destructive" : "text-emerald-600 focus:text-emerald-600"}`}
                          >
                            {doctor.isActive
                              ? <><PowerOff className="w-3.5 h-3.5" />تعطيل</>
                              : <><Power className="w-3.5 h-3.5" />تفعيل</>
                            }
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* ── Schedule ────────────────────────────────── */}
                  <div className="mt-4 pt-4 border-t border-border/50">
                    {activeSchedules.length > 0 ? (
                      <>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
                          أوقات العمل
                        </p>
                        <div className="space-y-1.5">
                          {activeSchedules.map((s) => (
                            <div key={s.id} className="flex items-center justify-between text-xs">
                              <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                <span className="text-foreground font-medium">{DAYS_AR[s.dayOfWeek]}</span>
                              </span>
                              <span className="text-muted-foreground font-mono">
                                {s.startTime} – {s.endTime}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground/60 text-center py-1">
                        لم يُحدد جدول عمل — اذهب للوحة الطبيب لإعداد الجدول
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <DoctorModal open={modalOpen} onClose={handleModalClose} doctor={editDoctor} />
    </div>
  );
}
