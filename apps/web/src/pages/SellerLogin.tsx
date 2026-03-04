import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sellerLogin } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function SellerLogin() {
  const [referralCode, setReferralCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await sellerLogin(referralCode, password);
      sessionStorage.setItem("seller_token", res.token);
      sessionStorage.setItem("seller_name", res.sellerName);
      navigate("/seller");
    } catch {
      setError("Invalid referral code or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="ltr">
      <Card className="w-full max-w-sm shadow-md">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 rounded-xl bg-teal-700 flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-lg">Seller Portal</CardTitle>
          <p className="text-sm text-muted-foreground">ClinicBot Affiliate Dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-3">
            <Input
              placeholder="Referral Code (e.g. REF-AHMED)"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              autoFocus
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || !referralCode || !password}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
