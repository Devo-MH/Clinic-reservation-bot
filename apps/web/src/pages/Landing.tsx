import { useState } from "react";
import { Link } from "react-router-dom";
import WhatsAppDemo from "@/components/demos/WhatsAppDemo";
import DashboardDemo from "@/components/demos/DashboardDemo";

/* ─────────────────────────────────────────────────────────────
   COLOR PALETTE  (Lovable-style: near-black + violet/pink)
   BG:       #08060F
   Card:     rgba(255,255,255,.04)
   Primary:  #a855f7  (violet-500)
   Grad:     #a855f7 → #ec4899  (violet → pink)
   Accent:   #06b6d4  (cyan-500)
   Muted:    rgba(255,255,255,.45)
───────────────────────────────────────────────────────────── */

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
        { icon: "🤖", t: "حجز ذكي بالواتساب",     d: "يفهم رسائل المرضى بالعربي والإنجليزي ويحجز تلقائياً على مدار الساعة" },
        { icon: "🔔", t: "تذكيرات تلقائية",        d: "إشعارات قبل الموعد تقلل الغياب بنسبة تصل إلى ٨٠٪" },
        { icon: "📊", t: "لوحة تحكم احترافية",    d: "تابع مواعيدك وأطباءك وإيراداتك لحظة بلحظة" },
        { icon: "👨‍⚕️", t: "إدارة الأطباء",         d: "حدد مواعيد عمل كل طبيب وخدماته وأسعاره بسهولة" },
        { icon: "🌍", t: "عربي وإنجليزي",           d: "البوت يكتشف لغة المريض تلقائياً ويتحدث معه بلغته" },
        { icon: "⚡", t: "تشغيل فوري",              d: "اربط عيادتك بالواتساب في ٣ دقائق بدون أي خبرة تقنية" },
      ],
    },
    demo: { label: "عرض حي", title: "شاهد موعدك في العمل", wa: "📱 تجربة المريض", dash: "📊 لوحة التحكم" },
    how: {
      label: "كيف يعمل",
      title: "ثلاث خطوات فقط",
      steps: [
        { n: "١", t: "اربط عيادتك",    d: "سجّل عيادتك وأرسل لنا رقم واتساب البزنس الخاص بك" },
        { n: "٢", t: "جهّز البوت",     d: "أضف أطباءك، خدماتك، ومواعيد العمل من لوحة التحكم" },
        { n: "٣", t: "ابدأ الاستقبال", d: "البوت يستقبل المرضى ويحجز المواعيد تلقائياً ٢٤/٧" },
      ],
    },
    pricing: {
      label: "الأسعار",
      title: "خطط تناسب حجم عيادتك",
      sub: "ادفع فقط عند الحاجة — بدون اشتراك شهري",
      plans: [
        { name: "Starter", credits: "٣٠٠",  price: "٩",  curr: "$", tag: null },
        { name: "Growth",  credits: "٨٠٠",  price: "١٩", curr: "$", tag: "الأكثر شيوعاً" },
        { name: "Pro",     credits: "٢٠٠٠", price: "٣٩", curr: "$", tag: null },
      ],
    },
    cta: { title: "جاهز تبدأ؟", sub: "انضم إلى العيادات التي وفّرت ساعات من العمل اليدوي", btn: "ابدأ مجاناً الآن" },
    footer: { tag: "بوت واتساب ذكي للعيادات", rights: "© ٢٠٢٦ موعدك. جميع الحقوق محفوظة." },
    trust: ["🔒 بيانات آمنة", "⚡ بدون كود", "🌍 عربي وإنجليزي"],
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
        { v: "3 min", l: "Setup" },
      ],
    },
    pain: {
      label: "The Problem",
      title: "What Your Clinic Struggles With Daily",
      items: [
        { icon: "📞", t: "Endless booking calls",          d: "Staff spends hours on the phone instead of caring for patients" },
        { icon: "❌", t: "Patients forgetting appointments", d: "No-shows cost you real money with every missed slot" },
        { icon: "📋", t: "Chaotic schedules",              d: "No clear view of appointments, doctors, and revenue" },
        { icon: "⏰", t: "Repetitive tasks drain your team", d: "Precious time wasted on tasks that can be fully automated" },
      ],
    },
    features: {
      label: "Features",
      title: "Everything You Need in One Place",
      items: [
        { icon: "🤖", t: "Smart WhatsApp Booking",   d: "Understands Arabic & English messages and books automatically 24/7" },
        { icon: "🔔", t: "Automatic Reminders",      d: "Pre-appointment notifications reduce no-shows by up to 80%" },
        { icon: "📊", t: "Professional Dashboard",   d: "Track appointments, doctors, and revenue in real time" },
        { icon: "👨‍⚕️", t: "Doctor Management",        d: "Set each doctor's schedule, services, and pricing easily" },
        { icon: "🌍", t: "Arabic & English",          d: "The bot detects the patient's language automatically" },
        { icon: "⚡", t: "Instant Setup",             d: "Connect your clinic to WhatsApp in 3 minutes, no tech skills needed" },
      ],
    },
    demo: { label: "Live Demo", title: "See Maw3idak in Action", wa: "📱 Patient Experience", dash: "📊 Clinic Dashboard" },
    how: {
      label: "How It Works",
      title: "Three Steps Only",
      steps: [
        { n: "1", t: "Connect Your Clinic",      d: "Register and send us your WhatsApp Business number" },
        { n: "2", t: "Set Up the Bot",            d: "Add doctors, services, and working hours from the dashboard" },
        { n: "3", t: "Start Receiving Patients",  d: "The bot books appointments automatically 24/7" },
      ],
    },
    pricing: {
      label: "Pricing",
      title: "Plans for Every Clinic",
      sub: "Pay only when you need — no monthly subscription",
      plans: [
        { name: "Starter", credits: "300",  price: "9",  curr: "$", tag: null },
        { name: "Growth",  credits: "800",  price: "19", curr: "$", tag: "Most Popular" },
        { name: "Pro",     credits: "2000", price: "39", curr: "$", tag: null },
      ],
    },
    cta: { title: "Ready to Start?", sub: "Join clinics that saved hours of manual work", btn: "Start for Free Now" },
    footer: { tag: "Smart WhatsApp Bot for Clinics", rights: "© 2026 Maw3idak. All rights reserved." },
    trust: ["🔒 Secure Data", "⚡ No Code", "🌍 Arabic & English"],
  },
};

export default function Landing() {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const c = t[lang];
  const isAr = lang === "ar";

  return (
    <div dir={c.dir} style={{
      fontFamily: isAr ? "'Segoe UI', Tahoma, Arial, sans-serif" : "'Inter', system-ui, sans-serif",
      background: "#08060F",
      color: "#fff",
      minHeight: "100vh",
      overflowX: "hidden",
    }}>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── gradient mesh background ── */
        .mesh-bg {
          background:
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(168,85,247,.25) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 80% 20%,  rgba(236,72,153,.15) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 10% 30%,  rgba(99,102,241,.15) 0%, transparent 55%),
            #08060F;
        }

        /* ── glow CTA button ── */
        .btn-primary {
          display: inline-block;
          background: linear-gradient(135deg, #a855f7, #ec4899);
          color: #fff;
          font-weight: 700;
          text-decoration: none;
          border: none;
          cursor: pointer;
          border-radius: 12px;
          padding: 14px 32px;
          font-size: 15px;
          box-shadow: 0 0 28px rgba(168,85,247,.5), 0 4px 20px rgba(236,72,153,.3);
          transition: transform .18s, box-shadow .18s;
          position: relative;
          overflow: hidden;
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,.15), transparent);
          border-radius: inherit;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 40px rgba(168,85,247,.65), 0 8px 28px rgba(236,72,153,.4); }

        /* ── ghost button ── */
        .btn-ghost {
          display: inline-block;
          border: 1.5px solid rgba(168,85,247,.45);
          color: #c084fc;
          border-radius: 12px;
          padding: 13px 30px;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          background: rgba(168,85,247,.06);
          transition: background .18s, border-color .18s;
        }
        .btn-ghost:hover { background: rgba(168,85,247,.14); border-color: rgba(168,85,247,.7); }

        /* ── glass card ── */
        .glass {
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 20px;
          backdrop-filter: blur(14px);
          transition: border-color .25s, transform .25s, box-shadow .25s;
        }
        .glass:hover {
          border-color: rgba(168,85,247,.35);
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(168,85,247,.1);
        }

        /* ── gradient text ── */
        .grad { background: linear-gradient(135deg, #c084fc, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .grad2 { background: linear-gradient(135deg, #a78bfa, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

        /* ── section pill label ── */
        .pill-label {
          display: inline-block;
          background: rgba(168,85,247,.12);
          border: 1px solid rgba(168,85,247,.3);
          color: #c084fc;
          border-radius: 99px;
          padding: 4px 16px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        /* ── live dot ── */
        .live-dot { width: 7px; height: 7px; background: #a855f7; border-radius: 50%; display: inline-block; animation: pls 1.5s ease-in-out infinite; }
        @keyframes pls { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.35;transform:scale(.7)} }

        /* ── nav ── */
        .nav-a { color: rgba(255,255,255,.55); text-decoration: none; font-size: 14px; font-weight: 500; transition: color .15s; }
        .nav-a:hover { color: #fff; }

        /* ── stat card ── */
        .stat { background: rgba(168,85,247,.07); border: 1px solid rgba(168,85,247,.18); border-radius: 16px; padding: 20px 28px; text-align: center; min-width: 120px; }

        /* ── pain card ── */
        .pain-c { background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.07); border-radius: 16px; padding: 24px 20px; display: flex; gap: 16px; align-items: flex-start; transition: border-color .2s; }
        .pain-c:hover { border-color: rgba(239,68,68,.3); }

        /* ── pricing cards ── */
        .price-c { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.08); border-radius: 20px; padding: 32px 26px; flex: 1; min-width: 220px; max-width: 300px; transition: border-color .2s, transform .2s; }
        .price-c:hover { border-color: rgba(168,85,247,.35); transform: translateY(-4px); }
        .price-popular { border-color: rgba(168,85,247,.45) !important; background: rgba(168,85,247,.06) !important; box-shadow: 0 0 48px rgba(168,85,247,.12); }

        /* ── step connector ── */
        .step-n { width: 52px; height: 52px; background: linear-gradient(135deg,#a855f7,#ec4899); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 900; flex-shrink: 0; box-shadow: 0 0 24px rgba(168,85,247,.5); }

        /* ── footer links ── */
        .foot-a { color: rgba(255,255,255,.35); text-decoration: none; font-size: 13px; transition: color .15s; }
        .foot-a:hover { color: rgba(255,255,255,.75); }

        /* ── grid dot pattern overlay ── */
        .dot-grid::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,.07) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
        }

        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .fu { animation: fadeUp .65s ease both; }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          .nav-links  { display: none !important; }
          .hero-btns  { flex-direction: column; align-items: center; }
          .hero-btns a, .hero-btns button { width: 100%; max-width: 300px; text-align: center; }
          .stats-row  { gap: 10px !important; }
          .stat       { min-width: 80px !important; padding: 14px 16px !important; }
          .demo-row   { flex-direction: column; align-items: center; }
          .demo-row > div { width: 100%; }
          .price-row  { flex-direction: column; align-items: center; }
          .price-c    { min-width: unset !important; width: 100%; max-width: 340px; }
          .how-inner  { max-width: 100% !important; }
        }
      `}</style>

      {/* ══ NAVBAR ══════════════════════════════════════════ */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(168,85,247,.12)", backdropFilter: "blur(24px)", background: "rgba(8,6,15,.75)" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 22, fontWeight: 900 }} className="grad">موعدك</span>
          <div className="nav-links" style={{ display: "flex", gap: 32 }}>
            <a href="#features" className="nav-a">{c.nav.features}</a>
            <a href="#how"      className="nav-a">{c.nav.how}</a>
            <a href="#demo"     className="nav-a">{c.nav.demo}</a>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} style={{ background: "rgba(168,85,247,.1)", border: "1px solid rgba(168,85,247,.25)", color: "#c084fc", borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
              {isAr ? "EN" : "ع"}
            </button>
            <Link to="/onboard" className="btn-primary" style={{ padding: "9px 20px", fontSize: 14, borderRadius: 10 }}>{c.nav.cta}</Link>
          </div>
        </div>
      </nav>

      {/* ══ HERO ════════════════════════════════════════════ */}
      <section className="mesh-bg dot-grid" style={{ position: "relative", textAlign: "center", padding: "100px 24px 88px" }}>
        <div className="fu" style={{ maxWidth: 780, margin: "0 auto", position: "relative" }}>

          {/* live badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(168,85,247,.1)", border: "1px solid rgba(168,85,247,.28)", borderRadius: 99, padding: "6px 18px 6px 12px", marginBottom: 28 }}>
            <span className="live-dot" />
            <span style={{ fontSize: 13, color: "#c084fc", fontWeight: 500 }}>{c.hero.badge}</span>
          </div>

          <h1 style={{ fontSize: "clamp(44px,7vw,80px)", fontWeight: 900, lineHeight: 1.06, letterSpacing: "-1.5px", marginBottom: 20 }}>
            <span style={{ color: "#fff" }}>{c.hero.title1}</span><br />
            <span className="grad">{c.hero.title2}</span>
          </h1>

          <p style={{ fontSize: "clamp(15px,2vw,18px)", color: "rgba(255,255,255,.5)", maxWidth: 540, margin: "0 auto 44px", lineHeight: 1.8 }}>
            {c.hero.desc}
          </p>

          <div className="hero-btns" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 72 }}>
            <Link to="/onboard" className="btn-primary">{c.hero.cta1}</Link>
            <a href="#demo" className="btn-ghost">{c.hero.cta2}</a>
          </div>

          {/* stats */}
          <div className="stats-row" style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            {c.hero.stats.map((s, i) => (
              <div key={i} className="stat">
                <div style={{ fontSize: 28, fontWeight: 900 }} className="grad">{s.v}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PAIN POINTS ════════════════════════════════════ */}
      <section style={{ padding: "88px 24px" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div className="pill-label">{c.pain.label}</div>
            <h2 style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, color: "#fff" }}>{c.pain.title}</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(258px,1fr))", gap: 16 }}>
            {c.pain.items.map((item, i) => (
              <div key={i} className="pain-c">
                <div style={{ width: 44, height: 44, background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.22)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{item.t}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)", lineHeight: 1.65 }}>{item.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ═══════════════════════════════════════ */}
      <section id="features" style={{ padding: "88px 24px", borderTop: "1px solid rgba(168,85,247,.1)", borderBottom: "1px solid rgba(168,85,247,.1)", background: "rgba(168,85,247,.03)" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="pill-label">{c.features.label}</div>
            <h2 style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, color: "#fff" }}>{c.features.title}</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(310px,1fr))", gap: 20 }}>
            {c.features.items.map((f, i) => (
              <div key={i} className="glass" style={{ padding: "28px 24px" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(168,85,247,.12)", border: "1px solid rgba(168,85,247,.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 18 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{f.t}</h3>
                <p style={{ fontSize: 13.5, color: "rgba(255,255,255,.45)", lineHeight: 1.7 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DEMO ════════════════════════════════════════════ */}
      <section id="demo" style={{ padding: "88px 24px" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="pill-label">{c.demo.label}</div>
            <h2 style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, color: "#fff" }}>{c.demo.title}</h2>
          </div>
          <div className="demo-row" style={{ display: "flex", flexWrap: "wrap", gap: 48, justifyContent: "center", alignItems: "flex-start" }}>
            <div>
              <p style={{ color: "#c084fc", fontWeight: 600, marginBottom: 16, fontSize: 14 }}>{c.demo.wa}</p>
              <WhatsAppDemo />
            </div>
            <div style={{ flex: 1, minWidth: 320 }}>
              <p style={{ color: "#c084fc", fontWeight: 600, marginBottom: 16, fontSize: 14 }}>{c.demo.dash}</p>
              <DashboardDemo />
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═══════════════════════════════════ */}
      <section id="how" style={{ padding: "88px 24px", borderTop: "1px solid rgba(168,85,247,.1)", background: "rgba(168,85,247,.03)" }}>
        <div className="how-inner" style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="pill-label">{c.how.label}</div>
            <h2 style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, color: "#fff" }}>{c.how.title}</h2>
          </div>
          {c.how.steps.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div className="step-n">{step.n}</div>
                {i < c.how.steps.length - 1 && <div style={{ width: 2, height: 52, background: "linear-gradient(180deg,rgba(168,85,247,.5),transparent)", margin: "6px 0" }} />}
              </div>
              <div style={{ paddingTop: 12, paddingBottom: i < c.how.steps.length - 1 ? 0 : 0 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{step.t}</h3>
                <p style={{ color: "rgba(255,255,255,.45)", fontSize: 14, lineHeight: 1.7, marginBottom: 44 }}>{step.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ PRICING ════════════════════════════════════════ */}
      <section style={{ padding: "88px 24px" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="pill-label">{c.pricing.label}</div>
            <h2 style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, color: "#fff", marginBottom: 10 }}>{c.pricing.title}</h2>
            <p style={{ color: "rgba(255,255,255,.4)", fontSize: 15 }}>{c.pricing.sub}</p>
          </div>
          <div className="price-row" style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
            {c.pricing.plans.map((plan, i) => (
              <div key={i} className={`price-c${plan.tag ? " price-popular" : ""}`} style={{ position: "relative" }}>
                {plan.tag && (
                  <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#a855f7,#ec4899)", borderRadius: 99, padding: "3px 16px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", boxShadow: "0 0 16px rgba(168,85,247,.5)" }}>
                    {plan.tag}
                  </div>
                )}
                <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 10 }}>{plan.name}</div>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 44, fontWeight: 900 }} className="grad">{plan.curr}{plan.price}</span>
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginBottom: 28 }}>
                  {plan.credits} {isAr ? "رسالة" : "messages"}
                </div>
                <Link to="/onboard" className={plan.tag ? "btn-primary" : "btn-ghost"} style={{ display: "block", textAlign: "center", borderRadius: 10, padding: "11px 0", fontSize: 14 }}>
                  {isAr ? "ابدأ الآن" : "Get Started"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BOTTOM CTA ═════════════════════════════════════ */}
      <section style={{ padding: "108px 24px", textAlign: "center", position: "relative", overflow: "hidden", background: "radial-gradient(ellipse 90% 70% at 50% 50%, rgba(168,85,247,.18) 0%, rgba(236,72,153,.08) 50%, transparent 75%), #08060F" }}>
        {/* dot grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.06) 1px,transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <h2 style={{ fontSize: "clamp(32px,5.5vw,60px)", fontWeight: 900, letterSpacing: "-1px", marginBottom: 16, color: "#fff" }}>{c.cta.title}</h2>
          <p style={{ color: "rgba(255,255,255,.45)", fontSize: 17, marginBottom: 44 }}>{c.cta.sub}</p>
          <Link to="/onboard" className="btn-primary" style={{ fontSize: 17, padding: "16px 48px", borderRadius: 14 }}>{c.cta.btn}</Link>
          <div style={{ display: "flex", justifyContent: "center", gap: 36, flexWrap: "wrap", marginTop: 52 }}>
            {c.trust.map((b, i) => (
              <span key={i} style={{ fontSize: 13, color: "rgba(255,255,255,.3)" }}>{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═════════════════════════════════════════ */}
      <footer style={{ borderTop: "1px solid rgba(168,85,247,.12)", padding: "36px 24px", background: "rgba(168,85,247,.02)" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <span style={{ fontSize: 20, fontWeight: 900 }} className="grad">موعدك</span>
            <p style={{ color: "rgba(255,255,255,.28)", fontSize: 12, marginTop: 4 }}>{c.footer.tag}</p>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <a href="#features" className="foot-a">{c.nav.features}</a>
            <a href="#how"      className="foot-a">{c.nav.how}</a>
            <Link to="/onboard" className="foot-a">{c.nav.cta}</Link>
          </div>
          <p style={{ color: "rgba(255,255,255,.22)", fontSize: 12 }}>{c.footer.rights}</p>
        </div>
      </footer>

    </div>
  );
}
