import { useEffect, useState } from "react";

const CHART_H = 72; // px — total bar area height

function useCountUp(target: number, duration = 1800, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let frame = 0;
    const frames = Math.round(duration / 16);
    const timer = setInterval(() => {
      frame++;
      setVal(Math.round((frame / frames) * target));
      if (frame >= frames) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [start, target]);
  return val;
}

const APPOINTMENTS = [
  { name: "محمد العمري",    specialty: "🦷 أسنان",  time: "10:00 ص", status: "مؤكد",   clr: "#22c55e" },
  { name: "سارة الحربي",    specialty: "👁️ عيون",   time: "10:30 ص", status: "قادم",   clr: "#a855f7" },
  { name: "خالد المطيري",   specialty: "🩺 طب عام", time: "11:00 ص", status: "مؤكد",   clr: "#22c55e" },
  { name: "نورة السعيد",    specialty: "🦷 أسنان",  time: "11:30 ص", status: "انتظار", clr: "#94a3b8" },
  { name: "عبدالله الغامدي", specialty: "🩺 طب عام", time: "12:00 م", status: "مؤكد",  clr: "#22c55e" },
];

const BARS = [
  { day: "السبت",    pct: 60 },
  { day: "الأحد",    pct: 85 },
  { day: "الاثنين",  pct: 70 },
  { day: "الثلاثاء", pct: 95 },
  { day: "الأربعاء", pct: 75 },
  { day: "الخميس",   pct: 50 },
];

export default function DashboardDemo() {
  const [started,     setStarted]     = useState(false);
  const [barsVisible, setBarsVisible] = useState(false);
  const [shownRows,   setShownRows]   = useState(0);

  const appts    = useCountUp(47,   1600, started);
  const patients = useCountUp(312,  1800, started);
  const revenue  = useCountUp(8450, 2000, started);
  const noshow   = useCountUp(4,    1200, started);

  useEffect(() => {
    const t1 = setTimeout(() => setStarted(true), 400);
    const t2 = setTimeout(() => setBarsVisible(true), 800);
    const rowTimers = APPOINTMENTS.map((_, i) =>
      setTimeout(() => setShownRows(i + 1), 1000 + i * 280)
    );
    return () => { clearTimeout(t1); clearTimeout(t2); rowTimers.forEach(clearTimeout); };
  }, []);

  return (
    <div dir="rtl" style={{
      background: "#0e0b1a",
      borderRadius: 20,
      overflow: "hidden",
      boxShadow: "0 24px 72px rgba(0,0,0,.7), 0 0 0 1px rgba(168,85,247,.15)",
      fontFamily: "sans-serif",
      width: "100%",
      maxWidth: 520,
      minWidth: 0,
    }}>

      {/* Title bar */}
      <div style={{ background: "#13102a", padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(168,85,247,.15)" }}>
        <span style={{ background: "linear-gradient(135deg,#c084fc,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 800, fontSize: 15 }}>
          موعدك — لوحة التحكم
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          {["#ff5f57","#ffbd2e","#28c840"].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* ── Stat cards ─────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(100px,1fr))", gap: 8 }}>
          {[
            { label: "مواعيد اليوم", val: appts,    icon: "📅", suf: "" },
            { label: "المرضى",       val: patients,  icon: "👥", suf: "" },
            { label: "الإيرادات",    val: revenue,   icon: "💰", suf: " ر.س" },
            { label: "غياب",         val: noshow,    icon: "❌", suf: "" },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(168,85,247,.08)", border: "1px solid rgba(168,85,247,.18)", borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ background: "linear-gradient(135deg,#c084fc,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: 16, fontWeight: 800 }}>
                {s.val.toLocaleString("ar-EG")}{s.suf}
              </div>
              <div style={{ color: "#4b5563", fontSize: 9, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Bar chart ───────────────────────── */}
        <div style={{ background: "rgba(168,85,247,.06)", border: "1px solid rgba(168,85,247,.14)", borderRadius: 12, padding: "12px 14px" }}>
          <div style={{ color: "#6b7280", fontSize: 11, marginBottom: 10 }}>مواعيد الأسبوع</div>

          {/* bars row — fixed pixel heights */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: CHART_H + 18 }}>
            {BARS.map((b, i) => {
              const barPx = barsVisible ? Math.round((b.pct / 100) * CHART_H) : 0;
              const isMax = b.pct === Math.max(...BARS.map(x => x.pct));
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: "100%",
                    height: `${barPx}px`,
                    background: isMax
                      ? "linear-gradient(to top,#a855f7,#ec4899)"
                      : "linear-gradient(to top,rgba(168,85,247,.7),rgba(168,85,247,.35))",
                    borderRadius: "4px 4px 0 0",
                    transition: `height 0.75s cubic-bezier(.4,0,.2,1) ${i * 70}ms`,
                    boxShadow: isMax ? "0 0 12px rgba(168,85,247,.5)" : "none",
                  }} />
                  <div style={{ color: "#4b5563", fontSize: 8, whiteSpace: "nowrap" }}>{b.day}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Appointments list ──────────────── */}
        <div style={{ background: "rgba(168,85,247,.06)", border: "1px solid rgba(168,85,247,.14)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,.04)", color: "#6b7280", fontSize: 11 }}>مواعيد اليوم</div>
          {APPOINTMENTS.slice(0, shownRows).map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,.03)", animation: "dFadeUp .3s ease", gap: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(168,85,247,.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#c084fc", flexShrink: 0, fontWeight: 700 }}>
                {a.name[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 600 }}>{a.name}</div>
                <div style={{ color: "#4b5563", fontSize: 10 }}>{a.specialty}</div>
              </div>
              <div style={{ color: "#6b7280", fontSize: 11 }}>{a.time}</div>
              <div style={{ background: `${a.clr}20`, color: a.clr, borderRadius: 6, padding: "2px 7px", fontSize: 10, flexShrink: 0 }}>{a.status}</div>
            </div>
          ))}
        </div>

      </div>

      <style>{`@keyframes dFadeUp { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}
