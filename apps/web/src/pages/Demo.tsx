import { Link } from "react-router-dom";
import WhatsAppDemo     from "@/components/demos/WhatsAppDemo";
import DashboardDemo    from "@/components/demos/DashboardDemo";
import LiveTicker       from "@/components/demos/LiveTicker";
import RescheduleDemo   from "@/components/demos/RescheduleDemo";
import ReminderBlast    from "@/components/demos/ReminderBlast";
import MultiLanguageDemo from "@/components/demos/MultiLanguageDemo";
import ScheduleBuilder  from "@/components/demos/ScheduleBuilder";
import RevenueChart     from "@/components/demos/RevenueChart";
import ROICalculator    from "@/components/demos/ROICalculator";
import BeforeAfter      from "@/components/demos/BeforeAfter";

const NAVY  = "#0a1628";
const NAVY2 = "#0f2347";
const GOLD  = "#c9a84c";

function Section({ id, badge, title, sub, alt, children }: {
  id?: string; badge: string; title: string; sub: string; alt?: boolean; children: React.ReactNode;
}) {
  return (
    <section id={id} style={{ background: alt ? NAVY2 : NAVY, padding:"72px 24px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:44 }}>
          <span style={{ background:`${GOLD}18`, border:`1px solid ${GOLD}44`, color:GOLD, borderRadius:99, padding:"4px 16px", fontSize:13 }}>{badge}</span>
          <h2 style={{ color:"#fff", fontSize:26, fontWeight:800, margin:"12px 0 6px" }}>{title}</h2>
          <p style={{ color:"#64748b", fontSize:14, margin:0 }}>{sub}</p>
        </div>
        <div style={{ display:"flex", justifyContent:"center" }}>{children}</div>
      </div>
    </section>
  );
}

function Divider() {
  return (
    <div style={{ background:NAVY, display:"flex", alignItems:"center", gap:16, padding:"0 48px" }}>
      <div style={{ flex:1, height:1, background:`${GOLD}18` }} />
      <span style={{ color:`${GOLD}44`, fontSize:18 }}>✦</span>
      <div style={{ flex:1, height:1, background:`${GOLD}18` }} />
    </div>
  );
}

export default function Demo() {
  return (
    <div style={{ background:NAVY, minHeight:"100vh", fontFamily:"sans-serif" }} dir="rtl">

      {/* Nav */}
      <nav style={{ background:"#06101f", borderBottom:`1px solid ${GOLD}22`, padding:"0 24px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <Link to="/" style={{ color:GOLD, fontWeight:800, fontSize:20, textDecoration:"none" }}>موعدك</Link>
        <div style={{ display:"flex", gap:20, alignItems:"center" }}>
          {[
            { label:"حجز المواعيد", href:"#booking" },
            { label:"إعادة الجدولة", href:"#reschedule" },
            { label:"التذكيرات", href:"#reminders" },
            { label:"متعدد اللغات", href:"#multilang" },
            { label:"الجدول", href:"#schedule" },
            { label:"الإيرادات", href:"#revenue" },
            { label:"الحاسبة", href:"#roi" },
            { label:"قبل وبعد", href:"#compare" },
          ].map(l => (
            <a key={l.href} href={l.href} style={{ color:"#64748b", fontSize:12, textDecoration:"none" }}>{l.label}</a>
          ))}
          <Link to="/onboard" style={{ background:GOLD, color:NAVY, borderRadius:8, padding:"8px 18px", fontWeight:700, fontSize:14, textDecoration:"none" }}>ابدأ مجاناً</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign:"center", padding:"60px 24px 40px" }}>
        <h1 style={{ color:"#fff", fontSize:34, fontWeight:900, marginBottom:10 }}>شاهد موعدك في العمل</h1>
        <p style={{ color:"#64748b", fontSize:15 }}>محاكاة حية لكل ميزة — قبل أن تبدأ</p>
      </div>

      {/* 1. Live Ticker */}
      <Section id="ticker" badge="🌍 نشاط حي" title="عيادات تعمل الآن مع موعدك" sub="حجوزات تصل من جميع أنحاء الخليج في الوقت الفعلي">
        <LiveTicker />
      </Section>
      <Divider />

      {/* 2. WhatsApp booking */}
      <Section id="booking" badge="📱 تجربة المريض" alt title="حجز موعد عبر واتساب" sub="المريض يحجز في ثوانٍ — بدون مكالمات">
        <WhatsAppDemo />
      </Section>
      <Divider />

      {/* 3. Reschedule */}
      <Section id="reschedule" badge="📅 إعادة جدولة" title="إلغاء وتغيير المواعيد" sub="البوت يتعامل مع طلبات التغيير تلقائياً">
        <RescheduleDemo />
      </Section>
      <Divider />

      {/* 4. Reminder Blast */}
      <Section id="reminders" badge="🔔 تذكيرات تلقائية" alt title="إرسال تذكيرات الصباح" sub="12 رسالة تُرسل في ثوانٍ — بدلاً من مكالمات يدوية">
        <ReminderBlast />
      </Section>
      <Divider />

      {/* 5. Multi-language */}
      <Section id="multilang" badge="🌍 متعدد اللغات" title="عربي وإنجليزي تلقائياً" sub="نفس البوت يتعرف على لغة المريض ويرد بها">
        <MultiLanguageDemo />
      </Section>
      <Divider />

      {/* 6. Schedule Builder */}
      <Section id="schedule" badge="📋 الجدول الذكي" alt title="جدول المواعيد يتحدث تلقائياً" sub="كل حجز يظهر فوراً في الجدول — لا إدخال يدوي">
        <ScheduleBuilder />
      </Section>
      <Divider />

      {/* 7. Revenue Chart */}
      <Section id="revenue" badge="📈 نمو الإيرادات" title="شاهد النمو الحقيقي" sub="متوسط نمو الإيرادات بعد 6 أشهر من استخدام موعدك">
        <RevenueChart />
      </Section>
      <Divider />

      {/* 8. ROI Calculator */}
      <Section id="roi" badge="💰 حاسبة العائد" alt title="كم ستوفر مع موعدك؟" sub="أدخل بيانات عيادتك واحسب التوفير الشهري">
        <ROICalculator />
      </Section>
      <Divider />

      {/* 9. Before/After */}
      <Section id="compare" badge="⚡ قبل وبعد" title="الفرق واضح" sub="عيادة بدون موعدك مقابل عيادة مع موعدك">
        <div style={{ width:"100%", maxWidth:700 }}><BeforeAfter /></div>
      </Section>
      <Divider />

      {/* 10. Dashboard */}
      <Section badge="📊 لوحة التحكم" alt title="إدارة عيادتك بلمسة واحدة" sub="تابع مواعيدك وإيراداتك ومرضاك في الوقت الفعلي">
        <DashboardDemo />
      </Section>

      {/* CTA */}
      <section style={{ padding:"80px 24px", textAlign:"center", background:NAVY }}>
        <h2 style={{ color:"#fff", fontSize:30, fontWeight:900, marginBottom:10 }}>جاهز تبدأ؟</h2>
        <p style={{ color:"#64748b", marginBottom:28, fontSize:15 }}>اربط عيادتك بواتساب في دقائق</p>
        <Link to="/onboard" style={{ background:GOLD, color:NAVY, borderRadius:12, padding:"14px 40px", fontWeight:800, fontSize:17, textDecoration:"none" }}>ابدأ مجاناً الآن</Link>
      </section>
    </div>
  );
}
