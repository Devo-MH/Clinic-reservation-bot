import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { getSellerDashboard } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Building2, DollarSign, Clock, LogOut, CheckCircle2, Copy, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

const BUNDLE_LABEL: Record<string, string> = {
  STARTER_50: "Starter (50)", GROWTH_200: "Growth (200)", PRO_500: "Pro (500)",
};

function buildMonthlyChart(commissions: { createdAt: string; commissionAmount: number }[]) {
  const map: Record<string, number> = {};
  for (const c of commissions) {
    const key = format(new Date(c.createdAt), "MMM yy");
    map[key] = (map[key] ?? 0) + c.commissionAmount;
  }
  return Object.entries(map).map(([month, amount]) => ({ month, amount: Math.round(amount * 100) / 100 })).slice(-6);
}

export default function SellerDashboard() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("seller_token") ?? "";
  const sellerName = sessionStorage.getItem("seller_name") ?? "Seller";

  const { data, isLoading } = useQuery({
    queryKey: ["seller-dashboard"],
    queryFn: () => getSellerDashboard(token),
    enabled: !!token,
  });

  const handleLogout = () => {
    sessionStorage.removeItem("seller_token");
    sessionStorage.removeItem("seller_name");
    navigate("/seller/login");
  };

  const handleCopyCode = () => {
    const code = data?.seller.referralCode;
    if (code) {
      navigator.clipboard.writeText(code).then(() => toast.success("Referral code copied!"));
    }
  };

  const chartData = buildMonthlyChart(data?.commissions ?? []);

  return (
    <div className="min-h-screen bg-gray-50" dir="ltr">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-600 text-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-none">{sellerName}</h1>
              <p className="text-xs text-teal-200 mt-0.5">
                {Math.round((data?.seller.commissionRate ?? 0.25) * 100)}% commission · Affiliate Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {data?.seller.referralCode && (
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 transition-colors rounded-lg px-3 py-1.5 text-xs font-medium"
              >
                <Copy className="w-3.5 h-3.5" />
                {data.seller.referralCode}
              </button>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-teal-200 hover:text-white hover:bg-white/10 gap-2">
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "My Clinics", value: data?.stats.tenantCount, icon: Building2, color: "text-blue-600", bg: "bg-blue-50", border: "border-t-blue-500" },
            { label: "Total Earned", value: data?.stats.totalEarned?.toFixed(2), icon: DollarSign, color: "text-teal-600", bg: "bg-teal-50", border: "border-t-teal-500" },
            { label: "Pending Payout", value: data?.stats.pendingPayout?.toFixed(2), icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-t-amber-500" },
          ].map(({ label, value, icon: Icon, color, bg, border }) => (
            <Card key={label} className={`border-0 border-t-2 ${border} shadow-sm`}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  {isLoading ? <Skeleton className="h-7 w-16 mt-0.5" /> : (
                    <p className="text-3xl font-bold tracking-tight">{value ?? 0}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Earnings Chart */}
        {(chartData.length > 0 || isLoading) && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="px-5 pt-4 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Monthly Earnings
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-4">
              {isLoading ? (
                <Skeleton className="h-40 w-full rounded-lg" />
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartData} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      formatter={(v: number) => [`${v.toFixed(2)}`, "Earned"]}
                      contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
                    />
                    <Bar dataKey="amount" fill="#0f766e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        )}

        {/* My Clinics */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="px-5 pt-4 pb-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4" /> My Clinics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-3">
            {isLoading ? (
              <div className="px-5 pb-4 space-y-2">
                {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
              </div>
            ) : !data?.tenants.length ? (
              <div className="text-center py-10 text-muted-foreground">
                <Building2 className="w-8 h-8 opacity-25 mx-auto mb-2" />
                <p className="text-sm">No clinics assigned yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {data.tenants.map((t) => (
                  <div key={t.id} className={`flex items-center gap-3 px-5 py-3 border-l-2 ${t.isActive ? "border-l-teal-500" : "border-l-gray-200"}`}>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.clinicCode} · {t.country} · joined {format(new Date(t.createdAt), "MMM yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{t._count.appointments} appts</span>
                      <Badge variant={t.isActive ? "success" : "secondary"} className="text-xs">
                        {t.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Commission History */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="px-5 pt-4 pb-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Commission History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-3">
            {isLoading ? (
              <div className="px-5 pb-4 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
              </div>
            ) : !data?.commissions.length ? (
              <div className="text-center py-10 text-muted-foreground">
                <DollarSign className="w-8 h-8 opacity-25 mx-auto mb-2" />
                <p className="text-sm">No commissions yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left px-5 py-2.5 font-medium text-muted-foreground">Clinic</th>
                      <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Bundle</th>
                      <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Sale</th>
                      <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Your Cut</th>
                      <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Date</th>
                      <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {data.commissions.map((c) => (
                      <tr key={c.id} className="hover:bg-muted/20">
                        <td className="px-5 py-3 font-medium">{c.tenantName}</td>
                        <td className="px-3 py-3 text-muted-foreground">{BUNDLE_LABEL[c.bundle] ?? c.bundle}</td>
                        <td className="px-3 py-3 text-right text-muted-foreground">
                          {c.paymentAmount} {c.currency}
                        </td>
                        <td className="px-3 py-3 text-right font-semibold text-teal-700">
                          {c.commissionAmount.toFixed(2)} {c.currency}
                        </td>
                        <td className="px-3 py-3 text-muted-foreground text-xs">
                          {format(new Date(c.createdAt), "dd/MM/yyyy")}
                        </td>
                        <td className="px-3 py-3">
                          {c.status === "PAID" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
