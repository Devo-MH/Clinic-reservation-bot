import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getServices, createService, updateService, deleteService, type Service } from "@/lib/api";
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
  Plus, MoreVertical, Pencil, Trash2, Layers, Clock, Banknote,
} from "lucide-react";

const TENANT_ID = localStorage.getItem("clinic_tenant_id") ?? import.meta.env.VITE_TENANT_ID ?? "";

// ── Service Form Modal ─────────────────────────────────────────────────────────

type FormState = { nameAr: string; nameEn: string; durationMinutes: string; price: string };
const EMPTY: FormState = { nameAr: "", nameEn: "", durationMinutes: "30", price: "" };

function ServiceModal({
  open, onClose, service,
}: {
  open: boolean;
  onClose: () => void;
  service?: Service;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(
    service
      ? {
          nameAr: service.nameAr,
          nameEn: service.nameEn ?? "",
          durationMinutes: String(service.durationMinutes),
          price: service.price != null ? String(service.price) : "",
        }
      : EMPTY
  );

  const isEdit = !!service;

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        nameAr: form.nameAr,
        nameEn: form.nameEn || undefined,
        durationMinutes: Number(form.durationMinutes) || 30,
        price: form.price ? Number(form.price) : undefined,
      };
      return isEdit
        ? updateService(service!.id, payload)
        : createService({ tenantId: TENANT_ID, ...payload });
    },
    onSuccess: () => {
      toast.success(isEdit ? "تم تحديث الخدمة" : "تم إضافة الخدمة");
      queryClient.invalidateQueries({ queryKey: ["services"] });
      onClose();
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.error ?? "حدث خطأ");
    },
  });

  const set = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "تعديل الخدمة" : "إضافة خدمة جديدة"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>اسم الخدمة (عربي) <span className="text-red-500">*</span></Label>
            <Input
              placeholder="مثال: كشف عام"
              value={form.nameAr}
              onChange={e => set("nameAr", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>اسم الخدمة (إنجليزي)</Label>
            <Input
              placeholder="e.g. General Consultation"
              value={form.nameEn}
              onChange={e => set("nameEn", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>المدة (دقائق)</Label>
              <Input
                type="number"
                min="5"
                step="5"
                placeholder="30"
                value={form.durationMinutes}
                onChange={e => set("durationMinutes", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>السعر (اختياري)</Label>
              <Input
                type="number"
                min="0"
                placeholder="—"
                value={form.price}
                onChange={e => set("price", e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!form.nameAr || mutation.isPending}
          >
            {mutation.isPending ? "جاري الحفظ..." : isEdit ? "حفظ التغييرات" : "إضافة"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete Confirmation Dialog ─────────────────────────────────────────────────

function DeleteDialog({
  service, onClose,
}: {
  service: Service | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => deleteService(service!.id),
    onSuccess: () => {
      toast.success("تم حذف الخدمة");
      queryClient.invalidateQueries({ queryKey: ["services"] });
      onClose();
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف"),
  });

  return (
    <Dialog open={!!service} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>حذف الخدمة</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground py-2">
          هل أنت متأكد من حذف خدمة <span className="font-semibold text-foreground">"{service?.nameAr}"</span>؟
          لا يمكن التراجع عن هذا الإجراء.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "جاري الحذف..." : "حذف"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function ServicesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editService, setEditService] = useState<Service | undefined>();
  const [deleteService, setDeleteService] = useState<Service | null>(null);

  const { data: services, isLoading } = useQuery({
    queryKey: ["services", TENANT_ID],
    queryFn: () => getServices(TENANT_ID),
  });

  const handleEdit = (s: Service) => {
    setEditService(s);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditService(undefined);
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">الخدمات</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            إدارة خدمات العيادة المتاحة للحجز
          </p>
        </div>
        <Button onClick={() => { setEditService(undefined); setModalOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          خدمة جديدة
        </Button>
      </div>

      {/* ── Services Grid ───────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !services?.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Layers className="w-8 h-8 opacity-40" />
          </div>
          <p className="font-medium text-foreground">لا توجد خدمات بعد</p>
          <p className="text-sm mt-1 mb-4">أضف خدمات العيادة لتتمكن المرضى من اختيارها</p>
          <Button onClick={() => setModalOpen(true)} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            أضف أول خدمة
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <Card key={service.id} className="border-0 shadow-sm hover:shadow-md transition-shadow group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <Layers className="w-4 h-4 text-teal-600" />
                      </div>
                      <h3 className="font-semibold text-foreground truncate">{service.nameAr}</h3>
                    </div>
                    {service.nameEn && (
                      <p className="text-xs text-muted-foreground mb-2 mr-10">{service.nameEn}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                        <Clock className="w-3 h-3" />
                        {service.durationMinutes} دقيقة
                      </span>
                      {service.price != null && (
                        <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                          <Banknote className="w-3 h-3" />
                          {service.price} ج.م
                        </span>
                      )}
                      <Badge
                        variant={service.isActive ? "success" : "secondary"}
                        className="text-xs"
                      >
                        {service.isActive ? "نشطة" : "معطلة"}
                      </Badge>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem
                        onClick={() => handleEdit(service)}
                        className="gap-2"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        تعديل
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteService(service)}
                        className="gap-2 text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ServiceModal
        open={modalOpen}
        onClose={handleModalClose}
        service={editService}
      />
      <DeleteDialog
        service={deleteService}
        onClose={() => setDeleteService(null)}
      />
    </div>
  );
}
