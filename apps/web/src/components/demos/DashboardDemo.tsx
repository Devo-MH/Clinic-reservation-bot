import { useEffect, useState } from "react";

const GOLD = "#c9a84c";
const NAVY = "#0f2347";

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
  { name: "محمد العمري",   specialty: "🦷 أسنان",   time: "10:00 ص", status: "مؤكد",   color: "#22c55e" },
  { name: "سارة الحربي",   specialty: "👁️ عيون",    time: "10:30 ص", status: "قادم",   color: GOLD },
  { name: "خالد المطيري",  specialty: "🩺 طب عام",  time: "11:00 ص", status: "مؤكد",   color: "#22c55e" },
  { name: "نورة السعيد",   specialty: "🦷 أسنان",   time: "11:30 ص", status: "انتظار", color: "#94a3b8" },
  { name: "عبدالله الغامدي", specialty: "🩺 طب عام", time: "12:00 م", status: "مؤكد",  color: "#22c55e" },
];

const BAR_DATA = [
  { day: "السبت",   v: 60 },
  { day: "الأحد",   v: 85 },
  { day: "الاثنين", v: 70 },
  { day: "الثلاثاء", v: 95 },
  { day: "الأربعاء", v: 75 },
  { day: "الخميس",  v: 50 },
];

export default function DashboardDemo() {
  const [started, setStarted] = useState(false);
  const [shownRows, setShownRows] = useState(0);
  const [barsVisible, setBarsVisible] = useState(false);

  const appts   = useCountUp(47,  1600, started);
  const patients = useCountUp(312, 1800, started);
  const revenue  = useCountUp(8450, 2000, started);
  const noshow   = useCountUp(4,   1200, started);

  useEffect(() => {
    const t1 = setTimeout(() => setStarted(true), 400);
    const t2 = setTimeout(() => setBarsVisible(true), 800);

    const rowTimers: ReturnType<typeof setTimeout>[] = [];
    APPOINTMENTS.forEach((_, i) => {
      rowTimers.push(setTimeout(() => setShownRows(i + 1), 900 + i * 300));
    });

    return () => { clearTimeout(t1); clearTimeout(t2); rowTimers.forEach(clearTimeout); };
  }, []);

  return (
    <div style={{ background: "#0a1628", borderRadius: 20, overflow: "hidden", boxShadow: "0 30px 80px #000a", fontFamily: "sans-serif", width: "100%", maxWidth: 580 }} dir="rtl">

      {/* Top bar */}
      <div style={{ background: "#06101f", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #ffffff0f" }}>
        <span style={{ color: GOLD, fontWeight: 800, fontSize: 16 }}>موعدك — لوحة التحكم</span>
        <div style={{ display: "flex", gap: 6 }}>
          {["#ff5f57","#ffbd2e","#28c840"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
        </div>
      </div>

      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {[
            { label: "مواعيد اليوم", val: appts,    icon: "📅", suffix: "" },
            { label: "المرضى",       val: patients,  icon: "👥", suffix: "" },
            { label: "الإيرادات",    val: revenue,   icon: "💰", suffix: " ر.س" },
            { label: "غياب",         val: noshow,    icon: "❌", suffix: "" },
          ].map((s, i) => (
            <div key={i} style={{ background: NAVY, borderRadius: 12, padding: "12px 10px", border: `1px solid ${GOLD}22`, textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ color: GOLD, fontSize: 18, fontWeight: 800 }}>{s.val.toLocaleString("ar-EG")}{s.suffix}</div>
              <div style={{ color: "#64748b", fontSize: 10, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div style={{ background: NAVY, borderRadius: 12, padding: "14px 16px", border: `1px solid ${GOLD}22` }}>
          <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 12 }}>مواعيد الأسبوع</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 70 }}>
            {BAR_DATA.map((b, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: "100%",
                  height: barsVisible ? `${b.v}%` : "0%",
                  background: `linear-gradient(to top, ${GOLD}, ${GOLD}88)`,
                  borderRadius: "4px 4px 0 0",
                  transition: `height 0.8s cubic-bezier(.4,0,.2,1) ${i * 80}ms`,
                  minHeight: 2,
                }} />
                <div style={{ color: "#475569", fontSize: 9 }}>{b.day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Appointments table */}
        <div style={{ background: NAVY, borderRadius: 12, border: `1px solid ${GOLD}22`, overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid #ffffff0a", color: "#94a3b8", fontSize: 12 }}>مواعيد اليوم</div>
          {APPOINTMENTS.slice(0, shownRows).map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "9px 14px", borderBottom: "1px solid #ffffff05", animation: "fadeUp .3s ease", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${GOLD}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>
                {a.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#e2e8f0", fontSize: 13 }}>{a.name}</div>
                <div style={{ color: "#475569", fontSize: 11 }}>{a.specialty}</div>
              </div>
              <div style={{ color: "#64748b", fontSize: 12 }}>{a.time}</div>
              <div style={{ background: `${a.color}22`, color: a.color, borderRadius: 6, padding: "2px 8px", fontSize: 11, flexShrink: 0 }}>{a.status}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}
