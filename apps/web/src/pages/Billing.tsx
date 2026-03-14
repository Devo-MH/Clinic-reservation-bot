import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { getBillingBalance, createCheckout } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, Zap, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const TENANT_ID = localStorage.getItem("clinic_tenant_id") ?? import.meta.env.VITE_TENANT_ID ?? "";

const BUNDLE_META: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; popular?: boolean }> = {
  STARTER: { label: "Starter", icon: Zap,          color: "text-blue-600",   bg: "bg-blue-50" },
  GROWTH:  { label: "Growth",  icon: CreditCard,   color: "text-teal-600",   bg: "bg-teal-50", popular: true },
  PRO:     { label: "Pro",     icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-50" },
};

const STATUS_META: Record<string, { label: string; variant: "success" | "destructive" | "warning" | "secondary" }> = {
  PAID:    { label: "مدفوع",  variant: "success" },
  PENDING: { label: "معلق",   variant: "warning" },
  FAILED:  { label: "فشل",    variant: "destructive" },
};

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["billing", TENANT_ID],
    queryFn: () => getBillingBalance(TENANT_ID),
    enabled: !!TENANT_ID,
  });

  const handleBuy = async (bundleId: string) => {
    if (!data) return;
    setLoading(bundleId);
    try {
      const { redirectUrl } = await createCheckout(TENANT_ID, bundleId, data.currency);
      window.location.href = redirectUrl;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg ?? "حدث خطأ أثناء بدء عملية الدفع");
      setLoading(null);
    }
  };

  const creditColor =
    !data ? "" :
    data.credits === 0 ? "text-destructive" :
    data.credits <= 20 ? "text-amber-600" :
    "text-emerald-600";

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-foreground">الرصيد والفواتير</h1>
        <p className="text-sm text-muted-foreground mt-0.5">شراء حجوزات وعرض سجل المدفوعات</p>
      </div>

      {/* ── Credits balance card ─────────────────────────────────────── */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">الرصيد المتاح</p>
              {isLoading ? (
                <Skeleton className="h-10 w-20 mt-1" />
              ) : (
                <p className={`text-4xl font-bold mt-1 ${creditColor}`}>
                  {data?.credits ?? 0}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">حجز متبقي</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center">
              <CreditCard className="w-7 h-7 text-teal-600" />
            </div>
          </div>

          {data && data.credits <= 20 && data.credits > 0 && (
            <div className="mt-4 flex items-center gap-2 text-amber-600 bg-amber-50 rounded-lg px-3 py-2 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>رصيدك منخفض! قم بالشراء لضمان استمرار الخدمة.</span>
            </div>
          )}

          {data && data.credits === 0 && (
            <div className="mt-4 flex items-center gap-2 text-destructive bg-red-50 rounded-lg px-3 py-2 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>نفد رصيدك! البوت لا يقبل حجوزات جديدة الآن. اشترِ رصيداً للمتابعة.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Bundles ──────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">اختر باقة</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))
            : data && Object.entries(data.bundles).map(([bundleId, bundle]) => {
                const meta = BUNDLE_META[bundleId];
                const Icon = meta?.icon ?? CreditCard;
                const price = bundle.prices[data.currency] ?? 0;
                const isPopular = meta?.popular;

                return (
                  <div
                    key={bundleId}
                    className={`relative rounded-xl border-2 p-4 flex flex-col gap-3 transition-all ${
                      isPopular
                        ? "border-primary shadow-md"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    {isPopular && (
                      <span className="absolute -top-2.5 right-4 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                        الأكثر شيوعاً
                      </span>
                    )}
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-lg ${meta?.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${meta?.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{meta?.label ?? bundleId}</p>
                        <p className="text-xs text-muted-foreground">{bundle.credits} حجز</p>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-2xl font-bold">
                        {price} <span className="text-sm font-normal text-muted-foreground">{data.currency}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {(price / bundle.credits).toFixed(2)} {data.currency} / حجز
                      </p>
                    </div>
                    <Button
                      className="w-full"
                      variant={isPopular ? "default" : "outline"}
                      size="sm"
                      disabled={loading === bundleId}
                      onClick={() => handleBuy(bundleId)}
                    >
                      {loading === bundleId ? "جاري التحويل..." : "شراء الآن"}
                    </Button>
                  </div>
                );
              })
          }
        </div>
      </div>

      {/* ── Payment history ──────────────────────────────────────────── */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader className="px-4 md:px-5 pt-4 pb-0">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            سجل المدفوعات
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-3">
          {isLoading ? (
            <div className="space-y-px">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-4 md:px-5 py-3 flex items-center gap-3">
                  <Skeleton className="h-4 w-20" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-24" />
                  </div>
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>
              ))}
            </div>
          ) : !data?.payments?.length ? (
            <div className="flex flex-col items-center py-10 text-muted-foreground">
              <CreditCard className="w-8 h-8 opacity-25 mb-2" />
              <p className="text-sm">لا توجد مدفوعات بعد</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {data.payments.map((p) => {
                const badge = STATUS_META[p.status];
                const bundleLabel = BUNDLE_META[p.bundle]?.label ?? p.bundle;
                return (
                  <div key={p.id} className="flex items-center gap-3 px-4 md:px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{bundleLabel} — {p.credits} رسالة</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(p.createdAt), "dd/MM/yyyy")} · {p.gateway}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-semibold">
                        {p.amount} {p.currency}
                      </span>
                      <Badge variant={badge?.variant ?? "secondary"} className="text-xs">
                        {badge?.label ?? p.status}
                      </Badge>
                    </div>
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
