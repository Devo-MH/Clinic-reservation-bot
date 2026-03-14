import { useState } from "react";
import { Link } from "react-router-dom";
import WhatsAppDemo from "@/components/demos/WhatsAppDemo";
import DashboardDemo from "@/components/demos/DashboardDemo";

/* ─── translations ─────────────────────────────────────────── */
const t = {
  ar: {
    dir: "rtl" as const,
    nav: { features: "المميزات", how: "كيف يعمل", demo: "عرض حي", cta: "ابدأ مجاناً" },
    hero: {
      badge: "مدعوم بالذكاء الاصطناعي",
      title1: "بوت واتساب ذكي",
      title2: "لعيادتك",
      desc: "أتمتة حجز المواعيد وتذكير المرضى وإدارة العيادة — عبر واتساب مباشرة، بدون تطبيق إضافي.",
      cta1: "ابدأ مجاناً",
      cta2: "شاهد الشرح",
      stats: [
        { v: "٢٤/٧", l: "متاح دائماً" },
        { v: "٩٠٪", l: "توفير في الوقت" },
        { v: "+٥٠", l: "عيادة تثق بنا" },
        { v: "٣ دقائق", l: "وقت التفعيل" },
      ],
    },
    pain: {
      label: "المشكلة",
      title: "ما تعاني منه عيادتك يومياً",
      items: [
        { icon: "📞", t: "مكالمات لا تنتهي لحجز المواعيد", d: "موظفوك يقضون ساعات في استقبال المكالمات بدلاً من خدمة المرضى" },
        { icon: "❌", t: "مرضى ينسون مواعيدهم", d: "الغياب بلا إشعار يكلّفك خسارة حقيقية في كل موعد" },
        { icon: "📋", t: "جداول فوضوية", d: "لا رؤية واضحة للمواعيد والأطباء والإيرادات في مكان واحد" },
        { icon: "⏰", t: "مهام متكررة تستنزف فريقك", d: "وقت ثمين يُصرَف على مهام يمكن أتمتتها بالكامل" },
      ],
    },
    features: {
      label: "المميزات",
      title: "كل ما تحتاجه في مكان واحد",
      items: [
        { icon: "🤖", grad: "from-teal-400 to-cyan-400",   t: "حجز ذكي بالواتساب",     d: "يفهم رسائل المرضى بالعربي والإنجليزي ويحجز تلقائياً على مدار الساعة" },
        { icon: "🔔", grad: "from-purple-400 to-pink-400", t: "تذكيرات تلقائية",       d: "إشعارات قبل الموعد تقلل الغياب بنسبة تصل إلى ٨٠٪" },
        { icon: "📊", grad: "from-blue-400 to-indigo-400", t: "لوحة تحكم احترافية",   d: "تابع مواعيدك وأطباءك وإيراداتك لحظة بلحظة" },
        { icon: "👨‍⚕️", grad: "from-emerald-400 to-teal-400", t: "إدارة الأطباء",      d: "حدد مواعيد عمل كل طبيب وخدماته وأسعاره بسهولة" },
        { icon: "🌍", grad: "from-amber-400 to-orange-400", t: "عربي وإنجليزي",        d: "البوت يكتشف لغة المريض تلقائياً ويتحدث معه بلغته" },
        { icon: "⚡", grad: "from-rose-400 to-red-400",    t: "تشغيل فوري",           d: "اربط عيادتك بالواتساب في ٣ دقائق بدون أي خبرة تقنية" },
      ],
    },
    demo: {
      label: "عرض حي",
      title: "شاهد موعدك في العمل",
      wa: "📱 تجربة المريض",
      dash: "📊 لوحة التحكم",
    },
    how: {
      label: "كيف يعمل",
      title: "ثلاث خطوات فقط",
      steps: [
        { n: "١", t: "اربط عيادتك", d: "سجّل عيادتك وأرسل لنا رقم واتساب البزنس الخاص بك" },
        { n: "٢", t: "جهّز البوت",  d: "أضف أطباءك، خدماتك، ومواعيد العمل من لوحة التحكم" },
        { n: "٣", t: "ابدأ الاستقبال", d: "البوت يستقبل المرضى ويحجز المواعيد تلقائياً ٢٤/٧" },
      ],
    },
    pricing: {
      label: "الأسعار",
      title: "خطط تناسب حجم عيادتك",
      sub: "ادفع فقط عند الحاجة — بدون اشتراك شهري",
      plans: [
        { name: "Starter", credits: "٣٠٠", price: "٩", curr: "$", per: "رسالة", tag: null },
        { name: "Growth",  credits: "٨٠٠", price: "١٩", curr: "$", per: "رسالة", tag: "الأكثر شيوعاً" },
        { name: "Pro",     credits: "٢٠٠٠", price: "٣٩", curr: "$", per: "رسالة", tag: null },
      ],
    },
    cta: {
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
    nav: { features: "Features", how: "How It Works", demo: "Live Demo", cta: "Start Free" },
    hero: {
      badge: "Powered by AI",
      title1: "Smart WhatsApp Bot",
      title2: "For Your Clinic",
      desc: "Automate appointment booking, patient reminders, and clinic management — all through WhatsApp, no extra app needed.",
      cta1: "Start for Free",
      cta2: "Watch Demo",
      stats: [
        { v: "24/7", l: "Always On" },
        { v: "90%", l: "Time Saved" },
        { v: "50+", l: "Clinics" },
        { v: "3 min", l: "Setup Time" },
      ],
    },
    pain: {
      label: "The Problem",
      title: "What Your Clinic Struggles With Daily",
      items: [
        { icon: "📞", t: "Endless booking calls", d: "Your staff spends hours on the phone instead of caring for patients" },
        { icon: "❌", t: "Patients forgetting appointments", d: "No-shows cost you real money with every missed slot" },
        { icon: "📋", t: "Chaotic schedules", d: "No clear view of appointments, doctors, and revenue in one place" },
        { icon: "⏰", t: "Repetitive tasks drain your team", d: "Precious time wasted on tasks that can be fully automated" },
      ],
    },
    features: {
      label: "Features",
      title: "Everything You Need in One Place",
      items: [
        { icon: "🤖", grad: "from-teal-400 to-cyan-400",    t: "Smart WhatsApp Booking",  d: "Understands Arabic & English messages and books automatically around the clock" },
        { icon: "🔔", grad: "from-purple-400 to-pink-400",  t: "Automatic Reminders",     d: "Pre-appointment notifications reduce no-shows by up to 80%" },
        { icon: "📊", grad: "from-blue-400 to-indigo-400",  t: "Professional Dashboard",  d: "Track appointments, doctors, and revenue in real time" },
        { icon: "👨‍⚕️", grad: "from-emerald-400 to-teal-400", t: "Doctor Management",      d: "Set each doctor's schedule, services, and pricing easily" },
        { icon: "🌍", grad: "from-amber-400 to-orange-400", t: "Arabic & English",         d: "The bot detects the patient's language automatically" },
        { icon: "⚡", grad: "from-rose-400 to-red-400",     t: "Instant Setup",            d: "Connect your clinic to WhatsApp in 3 minutes — no tech skills needed" },
      ],
    },
    demo: {
      label: "Live Demo",
      title: "See Maw3idak in Action",
      wa: "📱 Patient Experience",
      dash: "📊 Clinic Dashboard",
    },
    how: {
      label: "How It Works",
      title: "Three Steps Only",
      steps: [
        { n: "1", t: "Connect Your Clinic",   d: "Register and send us your WhatsApp Business number" },
        { n: "2", t: "Set Up the Bot",         d: "Add doctors, services, and working hours from the dashboard" },
        { n: "3", t: "Start Receiving Patients", d: "The bot books appointments automatically 24/7" },
      ],
    },
    pricing: {
      label: "Pricing",
      title: "Plans for Every Clinic Size",
      sub: "Pay only when you need — no monthly subscription",
      plans: [
        { name: "Starter", credits: "300",  price: "9",  curr: "$", per: "msg", tag: null },
        { name: "Growth",  credits: "800",  price: "19", curr: "$", per: "msg", tag: "Most Popular" },
        { name: "Pro",     credits: "2000", price: "39", curr: "$", per: "msg", tag: null },
      ],
    },
    cta: {
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

/* ─── component ─────────────────────────────────────────────── */
export default function Landing() {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const c = t[lang];
  const isAr = lang === "ar";

  return (
    <div dir={c.dir} style={{ fontFamily: isAr ? "'Segoe UI', Tahoma, Arial, sans-serif" : "'Inter', system-ui, sans-serif", background: "#050B18", color: "#fff", minHeight: "100vh", overflowX: "hidden" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; }

        .glow-btn {
          position: relative;
          background: linear-gradient(135deg, #14b8a6, #0891b2);
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 14px 32px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          box-shadow: 0 0 24px #14b8a644, 0 4px 16px #0002;
          transition: transform .18s, box-shadow .18s;
        }
        .glow-btn:hover { transform: translateY(-2px); box-shadow: 0 0 40px #14b8a666, 0 8px 24px #0003; }

        .ghost-btn {
          border: 1.5px solid rgba(20,184,166,.45);
          color: #5eead4;
          border-radius: 12px;
          padding: 13px 30px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          background: rgba(20,184,166,.06);
          transition: background .18s, border-color .18s;
        }
        .ghost-btn:hover { background: rgba(20,184,166,.14); border-color: rgba(20,184,166,.7); }

        .glass-card {
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 20px;
          backdrop-filter: blur(12px);
          transition: border-color .25s, transform .25s, box-shadow .25s;
        }
        .glass-card:hover {
          border-color: rgba(20,184,166,.3);
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(20,184,166,.08);
        }

        .pain-card {
          background: rgba(255,255,255,.025);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 16px;
          padding: 24px 20px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
          transition: border-color .2s;
        }
        .pain-card:hover { border-color: rgba(239,68,68,.25); }

        .grad-text {
          background: linear-gradient(135deg, #5eead4 0%, #38bdf8 50%, #a78bfa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }

        .pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(20,184,166,.1);
          border: 1px solid rgba(20,184,166,.25);
          border-radius: 99px;
          padding: 5px 16px 5px 10px;
          font-size: 13px;
          color: #5eead4;
          font-weight: 500;
          margin-bottom: 24px;
        }

        .dot-pulse {
          width: 7px; height: 7px;
          background: #14b8a6;
          border-radius: 50%;
          display: inline-block;
          animation: dp 1.5s ease-in-out infinite;
        }
        @keyframes dp { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.75)} }

        .nav-link {
          color: rgba(255,255,255,.6);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color .15s;
        }
        .nav-link:hover { color: #fff; }

        .section-label {
          display: inline-block;
          background: rgba(20,184,166,.1);
          border: 1px solid rgba(20,184,166,.2);
          color: #5eead4;
          border-radius: 99px;
          padding: 3px 14px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: .06em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .stat-card {
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 16px;
          padding: 20px 28px;
          text-align: center;
          min-width: 120px;
        }

        .step-num {
          width: 52px; height: 52px;
          background: linear-gradient(135deg, #14b8a6, #0891b2);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; font-weight: 900;
          flex-shrink: 0;
          box-shadow: 0 0 20px #14b8a644;
        }

        .price-card {
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 20px;
          padding: 32px 28px;
          flex: 1;
          min-width: 220px;
          max-width: 300px;
          transition: border-color .2s, transform .2s;
        }
        .price-card:hover { border-color: rgba(20,184,166,.3); transform: translateY(-4px); }
        .price-card.popular {
          border-color: rgba(20,184,166,.4);
          background: rgba(20,184,166,.05);
          box-shadow: 0 0 40px rgba(20,184,166,.1);
        }

        .footer-link { color: rgba(255,255,255,.4); text-decoration: none; font-size: 13px; transition: color .15s; }
        .footer-link:hover { color: rgba(255,255,255,.8); }

        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp .6s ease both; }
      `}</style>

      {/* ── Navbar ───────────────────────────────────────── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(255,255,255,.06)", backdropFilter: "blur(20px)", background: "rgba(5,11,24,.8)" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 22, fontWeight: 900, background: "linear-gradient(135deg,#5eead4,#38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>موعدك</span>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <a href="#features" className="nav-link">{c.nav.features}</a>
            <a href="#how"      className="nav-link">{c.nav.how}</a>
            <a href="#demo"     className="nav-link">{c.nav.demo}</a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.7)", borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
              {isAr ? "EN" : "ع"}
            </button>
            <Link to="/onboard" className="glow-btn" style={{ padding: "9px 20px", fontSize: 14, borderRadius: 10 }}>{c.nav.cta}</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{ position: "relative", maxWidth: 1140, margin: "0 auto", padding: "100px 24px 80px", textAlign: "center", overflow: "visible" }}>
        {/* Orbs */}
        <div className="orb" style={{ width: 600, height: 600, background: "radial-gradient(circle, rgba(20,184,166,.18) 0%, transparent 70%)", top: -200, left: "50%", transform: "translateX(-50%)" }} />
        <div className="orb" style={{ width: 400, height: 400, background: "radial-gradient(circle, rgba(139,92,246,.12) 0%, transparent 70%)", top: 0, right: "5%" }} />
        <div className="orb" style={{ width: 300, height: 300, background: "radial-gradient(circle, rgba(56,189,248,.1) 0%, transparent 70%)", top: 100, left: "5%" }} />

        <div className="fade-up" style={{ position: "relative" }}>
          <div className="pill">
            <span className="dot-pulse" />
            {c.hero.badge}
          </div>

          <h1 style={{ fontSize: "clamp(42px, 7vw, 78px)", fontWeight: 900, lineHeight: 1.08, margin: "0 0 16px", letterSpacing: "-1px" }}>
            <span style={{ color: "#fff" }}>{c.hero.title1}</span>
            <br />
            <span className="grad-text">{c.hero.title2}</span>
          </h1>

          <p style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "rgba(255,255,255,.55)", maxWidth: 560, margin: "0 auto 44px", lineHeight: 1.75 }}>
            {c.hero.desc}
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 72 }}>
            <Link to="/onboard" className="glow-btn">{c.hero.cta1}</Link>
            <a href="#demo" className="ghost-btn">{c.hero.cta2}</a>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            {c.hero.stats.map((s, i) => (
              <div key={i} className="stat-card">
                <div style={{ fontSize: 28, fontWeight: 900, background: "linear-gradient(135deg,#5eead4,#38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.v}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.45)", marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pain Points ───────────────────────────────────── */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div className="section-label">{c.pain.label}</div>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, margin: 0, color: "#fff" }}>{c.pain.title}</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {c.pain.items.map((item, i) => (
              <div key={i} className="pain-card">
                <div style={{ width: 44, height: 44, background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{item.t}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,.45)", lineHeight: 1.6 }}>{item.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section id="features" style={{ padding: "80px 24px", background: "rgba(255,255,255,.015)", borderTop: "1px solid rgba(255,255,255,.05)", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="section-label">{c.features.label}</div>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, margin: 0, color: "#fff" }}>{c.features.title}</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: 20 }}>
            {c.features.items.map((f, i) => (
              <div key={i} className="glass-card" style={{ padding: "28px 24px" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `rgba(20,184,166,.12)`, border: "1px solid rgba(20,184,166,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 18 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>{f.t}</h3>
                <p style={{ fontSize: 13.5, color: "rgba(255,255,255,.5)", lineHeight: 1.7, margin: 0 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Demo ─────────────────────────────────────── */}
      <section id="demo" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="section-label">{c.demo.label}</div>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, margin: 0, color: "#fff" }}>{c.demo.title}</h2>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 48, justifyContent: "center", alignItems: "flex-start" }}>
            <div>
              <p style={{ color: "#5eead4", fontWeight: 600, marginBottom: 16, fontSize: 14 }}>{c.demo.wa}</p>
              <WhatsAppDemo />
            </div>
            <div style={{ flex: 1, minWidth: 320 }}>
              <p style={{ color: "#5eead4", fontWeight: 600, marginBottom: 16, fontSize: 14 }}>{c.demo.dash}</p>
              <DashboardDemo />
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────── */}
      <section id="how" style={{ padding: "80px 24px", background: "rgba(255,255,255,.015)", borderTop: "1px solid rgba(255,255,255,.05)", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="section-label">{c.how.label}</div>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, margin: 0, color: "#fff" }}>{c.how.title}</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {c.how.steps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 24, alignItems: "flex-start", marginBottom: i < c.how.steps.length - 1 ? 0 : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div className="step-num">{step.n}</div>
                  {i < c.how.steps.length - 1 && (
                    <div style={{ width: 1, height: 48, background: "linear-gradient(180deg,rgba(20,184,166,.4),transparent)", margin: "8px 0" }} />
                  )}
                </div>
                <div style={{ paddingTop: 12, paddingBottom: i < c.how.steps.length - 1 ? 0 : 0 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>{step.t}</h3>
                  <p style={{ color: "rgba(255,255,255,.5)", fontSize: 14, lineHeight: 1.7, margin: "0 0 40px" }}>{step.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────── */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="section-label">{c.pricing.label}</div>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, margin: "0 0 10px", color: "#fff" }}>{c.pricing.title}</h2>
            <p style={{ color: "rgba(255,255,255,.45)", fontSize: 15, margin: 0 }}>{c.pricing.sub}</p>
          </div>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
            {c.pricing.plans.map((plan, i) => (
              <div key={i} className={`price-card${plan.tag ? " popular" : ""}`} style={{ position: "relative" }}>
                {plan.tag && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#14b8a6,#0891b2)", borderRadius: 99, padding: "3px 14px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
                    {plan.tag}
                  </div>
                )}
                <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{plan.name}</div>
                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontSize: 42, fontWeight: 900, background: "linear-gradient(135deg,#5eead4,#38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{plan.curr}{plan.price}</span>
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginBottom: 24 }}>
                  {plan.credits} {isAr ? "رسالة" : "messages"}
                </div>
                <Link to="/onboard" className={plan.tag ? "glow-btn" : "ghost-btn"} style={{ width: "100%", textAlign: "center", borderRadius: 10, padding: "11px 0", fontSize: 14 }}>
                  {isAr ? "ابدأ الآن" : "Get Started"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────── */}
      <section style={{ padding: "100px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div className="orb" style={{ width: 700, height: 700, background: "radial-gradient(circle,rgba(20,184,166,.14) 0%,transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
        <div style={{ position: "relative" }}>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, margin: "0 0 16px", color: "#fff", letterSpacing: "-0.5px" }}>{c.cta.title}</h2>
          <p style={{ color: "rgba(255,255,255,.5)", fontSize: 17, marginBottom: 40 }}>{c.cta.sub}</p>
          <Link to="/onboard" className="glow-btn" style={{ fontSize: 17, padding: "16px 44px", borderRadius: 14 }}>{c.cta.btn}</Link>

          {/* Trust badges */}
          <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap", marginTop: 52 }}>
            {["🔒 بيانات آمنة", "⚡ بدون كود", "🌍 عربي وإنجليزي"].map((b, i) => (
              <span key={i} style={{ fontSize: 13, color: "rgba(255,255,255,.35)", display: "flex", alignItems: "center", gap: 6 }}>{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,.06)", padding: "36px 24px" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <span style={{ fontSize: 20, fontWeight: 900, background: "linear-gradient(135deg,#5eead4,#38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>موعدك</span>
            <p style={{ color: "rgba(255,255,255,.3)", fontSize: 12, margin: "4px 0 0" }}>{c.footer.tag}</p>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <a href="#features" className="footer-link">{c.nav.features}</a>
            <a href="#how"      className="footer-link">{c.nav.how}</a>
            <Link to="/onboard" className="footer-link">{c.nav.cta}</Link>
          </div>
          <p style={{ color: "rgba(255,255,255,.25)", fontSize: 12, margin: 0 }}>{c.footer.rights}</p>
        </div>
      </footer>

    </div>
  );
}
