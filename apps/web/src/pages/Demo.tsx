import { Link } from "react-router-dom";
import WhatsAppDemo from "@/components/demos/WhatsAppDemo";
import DashboardDemo from "@/components/demos/DashboardDemo";

const NAVY = "#0a1628";
const GOLD = "#c9a84c";

export default function Demo() {
  return (
    <div style={{ background: NAVY, minHeight: "100vh", fontFamily: "sans-serif" }} dir="rtl">

      {/* Nav */}
      <nav style={{ background: "#06101f", borderBottom: `1px solid ${GOLD}22`, padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" style={{ color: GOLD, fontWeight: 800, fontSize: 20, textDecoration: "none" }}>موعدك</Link>
        <Link to="/onboard" style={{ background: GOLD, color: NAVY, borderRadius: 8, padding: "8px 18px", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>ابدأ مجاناً</Link>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px" }}>

        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <h1 style={{ color: "#fff", fontSize: 36, fontWeight: 900, marginBottom: 12 }}>شاهد موعدك في العمل</h1>
          <p style={{ color: "#94a3b8", fontSize: 16 }}>محاكاة حية لتجربة المريض ولوحة تحكم العيادة</p>
        </div>

        {/* Demo 1: WhatsApp */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <span style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}44`, color: GOLD, borderRadius: 99, padding: "4px 16px", fontSize: 13 }}>تجربة المريض</span>
            <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 800, margin: "12px 0 6px" }}>حجز موعد عبر واتساب</h2>
            <p style={{ color: "#64748b", fontSize: 14 }}>المريض يحجز في ثوانٍ — بدون مكالمات</p>
          </div>
          <WhatsAppDemo />
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 80 }}>
          <div style={{ flex: 1, height: 1, background: `${GOLD}22` }} />
          <span style={{ color: GOLD, fontSize: 20 }}>✦</span>
          <div style={{ flex: 1, height: 1, background: `${GOLD}22` }} />
        </div>

        {/* Demo 2: Dashboard */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <span style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}44`, color: GOLD, borderRadius: 99, padding: "4px 16px", fontSize: 13 }}>لوحة تحكم العيادة</span>
            <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 800, margin: "12px 0 6px" }}>إدارة العيادة بلمسة واحدة</h2>
            <p style={{ color: "#64748b", fontSize: 14 }}>تابع مواعيدك وإيراداتك ومرضاك في الوقت الفعلي</p>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <DashboardDemo />
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: 72, padding: "48px 24px", background: "#0f2347", borderRadius: 20, border: `1px solid ${GOLD}22` }}>
          <h2 style={{ color: "#fff", fontSize: 28, fontWeight: 900, marginBottom: 10 }}>جاهز تبدأ؟</h2>
          <p style={{ color: "#94a3b8", marginBottom: 28 }}>اربط عيادتك بواتساب في دقائق</p>
          <Link to="/onboard" style={{ background: GOLD, color: NAVY, borderRadius: 12, padding: "14px 36px", fontWeight: 800, fontSize: 16, textDecoration: "none" }}>ابدأ مجاناً الآن</Link>
        </div>
      </div>
    </div>
  );
}
