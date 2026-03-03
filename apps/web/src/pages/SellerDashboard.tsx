import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { getSellerDashboard } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Building2, DollarSign, Clock, LogOut, CheckCircle2 } from "lucide-react";

const BUNDLE_LABEL: Record<string, string> = {
  STARTER_50: "Starter (50)", GROWTH_200: "Growth (200)", PRO_500: "Pro (500)",
};

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-teal-700 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6" />
          <div>
            <h1 className="font-bold text-base leading-none">{sellerName}</h1>
            <p className="text-xs text-teal-200 mt-0.5">
              Code: {data?.seller.referralCode ?? "..."} · {Math.round((data?.seller.commissionRate ?? 0.25) * 100)}% commission
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-teal-200 hover:text-white gap-2">
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "My Clinics", value: data?.stats.tenantCount, icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Total Earned", value: data?.stats.totalEarned?.toFixed(2), icon: DollarSign, color: "text-teal-600", bg: "bg-teal-50" },
            { label: "Pending Payout", value: data?.stats.pendingPayout?.toFixed(2), icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  {isLoading ? <Skeleton className="h-6 w-16 mt-0.5" /> : (
                    <p className="text-2xl font-bold">{value ?? 0}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
                  <div key={t.id} className="flex items-center gap-3 px-5 py-3">
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
                            <span className="flex items-center gap-1 text-xs text-emerald-600">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                            </span>
                          ) : (
                            <Badge variant="warning" className="text-xs">Pending</Badge>
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
