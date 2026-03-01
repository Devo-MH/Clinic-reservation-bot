import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, Lock, Building2 } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [tenantId, setTenantId] = useState(import.meta.env.VITE_TENANT_ID ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, tenantName } = await login(tenantId, password);
      localStorage.setItem("clinic_token", token);
      localStorage.setItem("clinic_tenant_id", tenantId);
      localStorage.setItem("clinic_name", tenantName);
      navigate("/dashboard");
    } catch {
      setError("بيانات الدخول غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-teal-700 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">ClinicBot</h1>
          <p className="text-teal-200 mt-1">لوحة تحكم العيادة</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-white/90">معرّف العيادة</Label>
              <div className="relative">
                <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-300" />
                <Input
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  placeholder="أدخل معرّف العيادة"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 pr-10 focus-visible:ring-white/30"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/90">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-300" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 pr-10 focus-visible:ring-white/30"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3 text-red-200 text-sm text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-teal-800 hover:bg-white/90 font-semibold h-11 text-base"
            >
              {loading ? "جاري الدخول..." : "دخول"}
            </Button>
          </form>
        </div>

        <p className="text-center text-teal-300/60 text-xs mt-6">
          ClinicBot © {new Date().getFullYear()} — جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}
