import { useState } from "react";
import { Link } from "react-router-dom";
import WhatsAppDemo from "@/components/demos/WhatsAppDemo";
import DashboardDemo from "@/components/demos/DashboardDemo";

const NAV = "#0a1628";
const NAVY = "#0a1628";
const NAVY2 = "#0f2347";
const GOLD = "#c9a84c";
const GOLD_LIGHT = "#e8c97a";

const t = {
  ar: {
    dir: "rtl" as const,
    nav: { features: "المميزات", howItWorks: "كيف يعمل", demo: "الشرح", cta: "ابدأ مجاناً" },
    hero: {
      badge: "مدعوم بالذكاء الاصطناعي 🤖",
      title: "موعدك",
      sub: "بوت واتساب ذكي لعياداتك",
      desc: "أتمتة حجز المواعيد، تذكير المرضى، وإدارة العيادة — كل ذلك عبر واتساب بدون تطبيق إضافي.",
      cta1: "ابدأ مجاناً",
      cta2: "شاهد الشرح",
      stats: [
        { v: "٢٤/٧", l: "متاح دائماً" },
        { v: "٩٠٪", l: "توفير في الوقت" },
        { v: "+٥٠", l: "عيادة تثق بنا" },
      ],
    },
    pain: {
      title: "ما تعاني منه عيادتك يومياً",
      items: [
        { icon: "📞", t: "مكالمات لا تنتهي لحجز المواعيد" },
        { icon: "❌", t: "مرضى ينسون مواعيدهم" },
        { icon: "📋", t: "جداول فوضوية يصعب تتبعها" },
        { icon: "⏰", t: "موظفون يضيعون وقتهم في مهام متكررة" },
      ],
    },
    features: {
      title: "كل ما تحتاجه في مكان واحد",
      items: [
        { icon: "🤖", t: "حجز ذكي بالواتساب", d: "يفهم البوت رسائل المرضى بالعربي والإنجليزي ويحجز تلقائياً" },
        { icon: "🔔", t: "تذكيرات تلقائية", d: "إشعارات للمرضى قبل موعدهم لتقليل الغياب" },
        { icon: "📊", t: "لوحة تحكم احترافية", d: "تابع مواعيدك وأطبائك وإيراداتك بسهولة" },
        { icon: "👨‍⚕️", t: "إدارة الأطباء والخدمات", d: "حدد مواعيد عمل كل طبيب وخدماته" },
        { icon: "🌍", t: "عربي وإنجليزي", d: "البوت يتحدث مع مرضاك بلغتهم تلقائياً" },
        { icon: "⚡", t: "تشغيل فوري", d: "اربط عيادتك بالواتساب في دقائق بدون خبرة تقنية" },
      ],
    },
    demo: {
      title: "شاهد موعدك في العمل",
      sub: "فيديو توضيحي",
      placeholder: "🎬 فيديو الشرح قادم قريباً",
    },
    how: {
      title: "كيف يعمل موعدك؟",
      steps: [
        { n: "١", t: "اربط عيادتك", d: "سجّل عيادتك واربط رقم واتساب الخاص بك في دقائق" },
        { n: "٢", t: "جهّز البوت", d: "أضف أطباءك وخدماتك ومواعيد عملك" },
        { n: "٣", t: "ابدأ الاستقبال", d: "البوت يستقبل المرضى ويحجز المواعيد تلقائياً ٢٤/٧" },
      ],
    },
    pricing: {
      title: "الأسعار",
      sub: "خطط مرنة تناسب حجم عيادتك — قادمة قريباً",
      cta: "أبلغني عند الإطلاق",
    },
    bottom: {
      title: "جاهز تبدأ؟",
      sub: "انضم إلى العيادات التي وفّرت ساعات من العمل اليدوي",
      btn: "ابدأ مجاناً الآن",
    },
    footer: {
      tag: "بوت واتساب ذكي للعيادات",
      rights: "© ٢٠٢٦ موعدك. جميع الحقوق محفوظة.",
    },
  },
  en: {
    dir: "ltr" as const,
    nav: { features: "Features", howItWorks: "How It Works", demo: "Demo", cta: "Start Free" },
    hero: {
      badge: "Powered by AI 🤖",
      title: "Maw3idak",
      sub: "Smart WhatsApp Bot for Your Clinic",
      desc: "Automate appointment booking, patient reminders, and clinic management — all through WhatsApp, no extra app needed.",
      cta1: "Start for Free",
      cta2: "Watch Demo",
      stats: [
        { v: "24/7", l: "Always Available" },
        { v: "90%", l: "Time Saved" },
        { v: "50+", l: "Clinics Trust Us" },
      ],
    },
    pain: {
      title: "What Your Clinic Struggles With Daily",
      items: [
        { icon: "📞", t: "Endless phone calls for bookings" },
        { icon: "❌", t: "Patients forgetting their appointments" },
        { icon: "📋", t: "Messy schedules hard to track" },
        { icon: "⏰", t: "Staff wasting time on repetitive tasks" },
      ],
    },
    features: {
      title: "Everything You Need in One Place",
      items: [
        { icon: "🤖", t: "Smart WhatsApp Booking", d: "The bot understands Arabic & English messages and books automatically" },
        { icon: "🔔", t: "Automatic Reminders", d: "Notify patients before their appointment to reduce no-shows" },
        { icon: "📊", t: "Professional Dashboard", d: "Track appointments, doctors, and revenue with ease" },
        { icon: "👨‍⚕️", t: "Doctor & Service Management", d: "Set each doctor's schedule and services easily" },
        { icon: "🌍", t: "Arabic & English", d: "The bot talks to your patients in their own language" },
        { icon: "⚡", t: "Instant Setup", d: "Connect your clinic to WhatsApp in minutes, no tech skills needed" },
      ],
    },
    demo: {
      title: "See Maw3idak in Action",
      sub: "Demo Video",
      placeholder: "🎬 Demo video coming soon",
    },
    how: {
      title: "How Does Maw3idak Work?",
      steps: [
        { n: "1", t: "Connect Your Clinic", d: "Register and connect your WhatsApp number in minutes" },
        { n: "2", t: "Set Up the Bot", d: "Add your doctors, services, and working hours" },
        { n: "3", t: "Start Receiving Patients", d: "The bot books appointments automatically 24/7" },
      ],
    },
    pricing: {
      title: "Pricing",
      sub: "Flexible plans for every clinic size — coming soon",
      cta: "Notify Me at Launch",
    },
    bottom: {
      title: "Ready to Start?",
      sub: "Join clinics that saved hours of manual work",
      btn: "Start for Free Now",
    },
    footer: {
      tag: "Smart WhatsApp Bot for Clinics",
      rights: "© 2026 Maw3idak. All rights reserved.",
    },
  },
};

export default function Landing() {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const c = t[lang];

  return (
    <div dir={c.dir} style={{ fontFamily: lang === "ar" ? "'Segoe UI', Tahoma, sans-serif" : "Inter, sans-serif", background: NAVY, color: "#fff", minHeight: "100vh" }}>

      {/* Navbar */}
      <nav style={{ background: NAV, borderBottom: `1px solid ${GOLD}22`, position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: GOLD }}>موعدك</span>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <a href="#features" style={{ color: "#cbd5e1", textDecoration: "none", fontSize: 14 }}>{c.nav.features}</a>
            <a href="#how" style={{ color: "#cbd5e1", textDecoration: "none", fontSize: 14 }}>{c.nav.howItWorks}</a>
            <a href="#demo" style={{ color: "#cbd5e1", textDecoration: "none", fontSize: 14 }}>{c.nav.demo}</a>
            <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} style={{ background: `${GOLD}22`, border: `1px solid ${GOLD}55`, color: GOLD, borderRadius: 8, padding: "4px 12px", fontSize: 13, cursor: "pointer" }}>
              {lang === "ar" ? "EN" : "ع"}
            </button>
            <Link to="/onboard" style={{ background: GOLD, color: NAVY, borderRadius: 8, padding: "8px 18px", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>{c.nav.cta}</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "96px 24px 72px", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: `${GOLD}18`, border: `1px solid ${GOLD}44`, borderRadius: 99, padding: "6px 18px", fontSize: 13, color: GOLD_LIGHT, marginBottom: 24 }}>
          {c.hero.badge}
        </div>
        <h1 style={{ fontSize: 72, fontWeight: 900, margin: "0 0 8px", color: "#fff", lineHeight: 1.1 }}>{c.hero.title}</h1>
        <h2 style={{ fontSize: 28, fontWeight: 600, color: GOLD, margin: "0 0 20px" }}>{c.hero.sub}</h2>
        <p style={{ fontSize: 18, color: "#94a3b8", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>{c.hero.desc}</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 64 }}>
          <Link to="/onboard" style={{ background: GOLD, color: NAVY, borderRadius: 10, padding: "14px 32px", fontWeight: 800, fontSize: 16, textDecoration: "none" }}>{c.hero.cta1}</Link>
          <a href="#demo" style={{ background: "transparent", border: `2px solid ${GOLD}`, color: GOLD, borderRadius: 10, padding: "14px 32px", fontWeight: 700, fontSize: 16, textDecoration: "none" }}>{c.hero.cta2}</a>
        </div>
        {/* Stats */}
        <div style={{ display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap" }}>
          {c.hero.stats.map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: GOLD }}>{s.v}</div>
              <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pain Points */}
      <section style={{ background: NAVY2, padding: "72px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48, color: "#fff" }}>{c.pain.title}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {c.pain.items.map((item, i) => (
              <div key={i} style={{ background: `${NAVY}cc`, border: `1px solid #ffffff11`, borderRadius: 14, padding: "24px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 28 }}>{item.icon}</span>
                <span style={{ color: "#cbd5e1", fontSize: 15 }}>{item.t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 12, color: "#fff" }}>{c.features.title}</h2>
          <div style={{ width: 60, height: 3, background: GOLD, margin: "0 auto 56px", borderRadius: 2 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {c.features.items.map((f, i) => (
              <div key={i} style={{ background: NAVY2, border: `1px solid ${GOLD}22`, borderRadius: 16, padding: "28px 24px", transition: "border-color .2s" }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: GOLD_LIGHT, marginBottom: 8 }}>{f.t}</h3>
                <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" style={{ background: NAVY2, padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, color: "#fff" }}>{c.demo.title}</h2>
          <p style={{ color: "#94a3b8", marginBottom: 56 }}>{c.demo.sub}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 48, justifyContent: "center", alignItems: "flex-start" }}>
            <div>
              <p style={{ color: GOLD, fontWeight: 700, marginBottom: 20, fontSize: 15 }}>📱 {lang === "ar" ? "تجربة المريض" : "Patient Experience"}</p>
              <WhatsAppDemo />
            </div>
            <div style={{ flex: 1, minWidth: 320 }}>
              <p style={{ color: GOLD, fontWeight: 700, marginBottom: 20, fontSize: 15 }}>📊 {lang === "ar" ? "لوحة تحكم العيادة" : "Clinic Dashboard"}</p>
              <DashboardDemo />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: "#fff" }}>{c.how.title}</h2>
          <div style={{ width: 60, height: 3, background: GOLD, margin: "0 auto 56px", borderRadius: 2 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative" }}>
            {c.how.steps.map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 24, textAlign: lang === "ar" ? "right" : "left", marginBottom: i < c.how.steps.length - 1 ? 40 : 0 }}>
                <div style={{ flexShrink: 0, width: 56, height: 56, borderRadius: "50%", background: GOLD, color: NAVY, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900 }}>{step.n}</div>
                <div style={{ paddingTop: 10 }}>
                  <h3 style={{ fontSize: 19, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{step.t}</h3>
                  <p style={{ color: "#94a3b8", margin: 0, fontSize: 15, lineHeight: 1.6 }}>{step.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Coming Soon */}
      <section style={{ background: NAVY2, padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: "#fff" }}>{c.pricing.title}</h2>
          <p style={{ color: "#94a3b8", fontSize: 16, marginBottom: 32 }}>{c.pricing.sub}</p>
          <div style={{ background: `${GOLD}11`, border: `1px solid ${GOLD}33`, borderRadius: 16, padding: "40px 32px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
            <button style={{ background: GOLD, color: NAVY, borderRadius: 10, padding: "12px 28px", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}>{c.pricing.cta}</button>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ padding: "96px 24px", textAlign: "center", background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY2} 100%)` }}>
        <h2 style={{ fontSize: 40, fontWeight: 900, marginBottom: 12, color: "#fff" }}>{c.bottom.title}</h2>
        <p style={{ color: "#94a3b8", fontSize: 17, marginBottom: 36 }}>{c.bottom.sub}</p>
        <Link to="/onboard" style={{ background: GOLD, color: NAVY, borderRadius: 12, padding: "16px 40px", fontWeight: 800, fontSize: 18, textDecoration: "none", display: "inline-block" }}>{c.bottom.btn}</Link>
      </section>

      {/* Footer */}
      <footer style={{ background: "#06101f", borderTop: `1px solid ${GOLD}22`, padding: "32px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <span style={{ fontSize: 20, fontWeight: 800, color: GOLD }}>موعدك</span>
            <p style={{ color: "#475569", fontSize: 13, margin: "4px 0 0" }}>{c.footer.tag}</p>
          </div>
          <p style={{ color: "#475569", fontSize: 13, margin: 0 }}>{c.footer.rights}</p>
        </div>
      </footer>
    </div>
  );
}
