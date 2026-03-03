import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  getAdminStats, getAdminTenants, createAdminTenant,
  updateAdminTenant, deleteAdminTenant, type AdminTenant,
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ShieldCheck, Building2, CalendarDays, Users, Plus,
  ToggleLeft, ToggleRight, Pencil, Trash2, LogOut,
} from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────────

function getSecret() {
  return sessionStorage.getItem("admin_secret") ?? "";
}

// ── Create Tenant Form ─────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: "", clinicCode: "", dashboardPassword: "",
  phoneNumberId: "", wabaId: "", accessToken: "",
  ownerPhone: "", locale: "AR", country: "GULF",
  timezone: "Asia/Riyadh", credits: "100",
};

function CreateTenantDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createAdminTenant(getSecret(), {
        ...form,
        credits: parseInt(form.credits) || 100,
      });
      toast.success(`Clinic "${form.name}" created`);
      setForm(EMPTY_FORM);
      setOpen(false);
      onCreated();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg ?? "Failed to create clinic");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> New Clinic
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Clinic</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Clinic Name *</Label>
              <Input placeholder="عيادة النور" value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>Clinic Code *</Label>
              <Input placeholder="NOOR" value={form.clinicCode} onChange={(e) => set("clinicCode", e.target.value.toUpperCase())} required />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Dashboard Password *</Label>
            <Input type="password" placeholder="••••••••" value={form.dashboardPassword} onChange={(e) => set("dashboardPassword", e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>WhatsApp Phone Number ID *</Label>
            <Input placeholder="123456789012345" value={form.phoneNumberId} onChange={(e) => set("phoneNumberId", e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>WABA ID *</Label>
            <Input placeholder="987654321098765" value={form.wabaId} onChange={(e) => set("wabaId", e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>Meta Access Token *</Label>
            <Input placeholder="EAABwz..." value={form.accessToken} onChange={(e) => set("accessToken", e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Owner WhatsApp</Label>
              <Input placeholder="+201001234567" value={form.ownerPhone} onChange={(e) => set("ownerPhone", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Initial Credits</Label>
              <Input type="number" min="0" value={form.credits} onChange={(e) => set("credits", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Language</Label>
              <Select value={form.locale} onValueChange={(v) => set("locale", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AR">Arabic</SelectItem>
                  <SelectItem value="EN">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Country</Label>
              <Select value={form.country} onValueChange={(v) => set("country", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GULF">Gulf</SelectItem>
                  <SelectItem value="EGYPT">Egypt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Timezone</Label>
              <Select value={form.timezone} onValueChange={(v) => set("timezone", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Riyadh">Riyadh</SelectItem>
                  <SelectItem value="Asia/Dubai">Dubai</SelectItem>
                  <SelectItem value="Africa/Cairo">Cairo</SelectItem>
                  <SelectItem value="Asia/Kuwait">Kuwait</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Clinic"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Credits Dialog ────────────────────────────────────────────────────────

function EditCreditsDialog({ tenant, onUpdated }: { tenant: AdminTenant; onUpdated: () => void }) {
  const [open, setOpen] = useState(false);
  const [credits, setCredits] = useState(String(tenant.credits));
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateAdminTenant(getSecret(), tenant.id, { credits: parseInt(credits) });
      toast.success("Credits updated");
      setOpen(false);
      onUpdated();
    } catch {
      toast.error("Failed to update credits");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Pencil className="w-3.5 h-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>Edit Credits — {tenant.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <div className="space-y-1">
            <Label>Credits</Label>
            <Input type="number" min="0" value={credits} onChange={(e) => setCredits(e.target.value)} autoFocus />
          </div>
          <Button className="w-full" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function AdminPanel() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const secret = getSecret();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => getAdminStats(secret),
  });

  const { data: tenants, isLoading: tenantsLoading } = useQuery({
    queryKey: ["admin-tenants"],
    queryFn: () => getAdminTenants(secret),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateAdminTenant(secret, id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-tenants"] }),
    onError: () => toast.error("Failed to update"),
  });

  const deleteTenant = useMutation({
    mutationFn: (id: string) => deleteAdminTenant(secret, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-tenants"] });
      toast.success("Clinic deleted");
    },
    onError: () => toast.error("Failed to delete"),
  });

  const handleLogout = () => {
    sessionStorage.removeItem("admin_secret");
    navigate("/admin/login");
  };

  const refetch = () => {
    qc.invalidateQueries({ queryKey: ["admin-tenants"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6" />
          <div>
            <h1 className="font-bold text-base leading-none">ClinicBot Admin</h1>
            <p className="text-xs text-slate-400 mt-0.5">Super Admin Panel</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-300 hover:text-white gap-2">
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Clinics", value: stats?.tenantCount, icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Appointments", value: stats?.appointmentCount, icon: CalendarDays, color: "text-teal-600", bg: "bg-teal-50" },
            { label: "Patients", value: stats?.patientCount, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  {statsLoading ? <Skeleton className="h-6 w-12 mt-0.5" /> : (
                    <p className="text-2xl font-bold">{value ?? 0}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tenants table */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="px-5 pt-4 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Clinics ({tenants?.length ?? 0})
            </CardTitle>
            <CreateTenantDialog onCreated={refetch} />
          </CardHeader>
          <CardContent className="p-0 mt-4">
            {tenantsLoading ? (
              <div className="space-y-px px-5 pb-4">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg mb-2" />)}
              </div>
            ) : !tenants?.length ? (
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="w-8 h-8 opacity-25 mx-auto mb-2" />
                <p className="text-sm">No clinics yet. Create the first one.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left px-5 py-2.5 font-medium text-muted-foreground">Clinic</th>
                      <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Code</th>
                      <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Country</th>
                      <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Credits</th>
                      <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Appts</th>
                      <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Patients</th>
                      <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Created</th>
                      <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Status</th>
                      <th className="px-3 py-2.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {tenants.map((t) => (
                      <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-3">
                          <p className="font-medium">{t.name}</p>
                          {t.ownerPhone && <p className="text-xs text-muted-foreground">{t.ownerPhone}</p>}
                        </td>
                        <td className="px-3 py-3">
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{t.clinicCode ?? "—"}</code>
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">{t.country}</td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className="font-semibold">{t.credits}</span>
                            <EditCreditsDialog tenant={t} onUpdated={refetch} />
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right text-muted-foreground">{t._count.appointments}</td>
                        <td className="px-3 py-3 text-right text-muted-foreground">{t._count.patients}</td>
                        <td className="px-3 py-3 text-muted-foreground text-xs">
                          {format(new Date(t.createdAt), "dd/MM/yy")}
                        </td>
                        <td className="px-3 py-3">
                          <Badge variant={t.isActive ? "success" : "secondary"} className="text-xs">
                            {t.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7"
                              onClick={() => toggleActive.mutate({ id: t.id, isActive: !t.isActive })}
                              title={t.isActive ? "Deactivate" : "Activate"}
                            >
                              {t.isActive
                                ? <ToggleRight className="w-4 h-4 text-teal-600" />
                                : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                            </Button>
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => {
                                if (confirm(`Delete "${t.name}"? This cannot be undone.`)) {
                                  deleteTenant.mutate(t.id);
                                }
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
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
