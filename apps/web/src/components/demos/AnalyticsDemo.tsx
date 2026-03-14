import { useEffect, useState } from "react";

const MONTHS = ["أكت", "نوف", "ديس", "يناير", "فبر", "مارس"];

const DATA = [
  { appts: 38,  revenue: 1900  },
  { appts: 52,  revenue: 2600  },
  { appts: 61,  revenue: 3050  },
  { appts: 74,  revenue: 3700  },
  { appts: 89,  revenue: 4450  },
  { appts: 112, revenue: 5600  },
];

const MAX_APPTS   = Math.max(...DATA.map(d => d.appts));
const MAX_REVENUE = Math.max(...DATA.map(d => d.revenue));
const CHART_H     = 90;

function useCountUp(target: number, duration = 1400, active = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let f = 0;
    const frames = Math.round(duration / 16);
    const t = setInterval(() => {
      f++;
      setVal(Math.round((f / frames) * target));
      if (f >= frames) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [active, target]);
  return val;
}

export default function AnalyticsDemo() {
  const [active, setActive]   = useState(false);
  const [shown,  setShown]    = useState(0);
  const [tab,    setTab]      = useState<"appts" | "revenue">("appts");

  const totalAppts   = DATA.reduce((s, d) => s + d.appts, 0);
  const totalRevenue = DATA.reduce((s, d) => s + d.revenue, 0);

  const countAppts   = useCountUp(totalAppts,   1600, active);
  const countRevenue = useCountUp(totalRevenue, 1800, active);
  const growth = Math.round(((DATA[5].appts - DATA[0].appts) / DATA[0].appts) * 100);

  useEffect(() => {
    const t1 = setTimeout(() => setActive(true), 300);
    const timers = DATA.map((_, i) => setTimeout(() => setShown(i + 1), 400 + i * 160));
    return () => { clearTimeout(t1); timers.forEach(clearTimeout); };
  }, []);

  const activeData = tab === "appts"
    ? DATA.map(d => ({ val: d.appts,   max: MAX_APPTS }))
    : DATA.map(d => ({ val: d.revenue, max: MAX_REVENUE }));

  return (
    <div dir="rtl" style={{
      background: "#0e0b1a",
      borderRadius: 20,
      overflow: "hidden",
      boxShadow: "0 24px 72px rgba(0,0,0,.7), 0 0 0 1px rgba(168,85,247,.15)",
      fontFamily: "sans-serif",
      width: "100%",
      maxWidth: 520,
    }}>

      {/* Header */}
      <div style={{ background: "#13102a", padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(168,85,247,.15)" }}>
        <span style={{ background: "linear-gradient(135deg,#c084fc,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 800, fontSize: 14 }}>
          📈 تحليلات العيادة
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          {(["appts", "revenue"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: tab === t ? "rgba(168,85,247,.2)" : "transparent",
              border: `1px solid ${tab === t ? "rgba(168,85,247,.4)" : "rgba(255,255,255,.08)"}`,
              color: tab === t ? "#c084fc" : "rgba(255,255,255,.4)",
              borderRadius: 6, padding: "3px 10px", fontSize: 10, fontWeight: 600, cursor: "pointer",
            }}>
              {t === "appts" ? "المواعيد" : "الإيرادات"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px" }}>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[
            { label: "إجمالي المواعيد", val: countAppts.toLocaleString("ar-EG"), icon: "📅" },
            { label: "الإيرادات (ر.س)",  val: countRevenue.toLocaleString("ar-EG"), icon: "💰" },
            { label: "نمو في ٦ أشهر",    val: `+${growth}٪`, icon: "🚀", highlight: true },
          ].map((k, i) => (
            <div key={i} style={{
              background: k.highlight ? "rgba(168,85,247,.12)" : "rgba(255,255,255,.04)",
              border: `1px solid ${k.highlight ? "rgba(168,85,247,.3)" : "rgba(255,255,255,.07)"}`,
              borderRadius: 12, padding: "10px 8px", textAlign: "center",
            }}>
              <div style={{ fontSize: 16, marginBottom: 3 }}>{k.icon}</div>
              <div style={{
                fontSize: 16, fontWeight: 800,
                background: k.highlight ? "linear-gradient(135deg,#c084fc,#f472b6)" : "none",
                WebkitBackgroundClip: k.highlight ? "text" : "unset",
                WebkitTextFillColor: k.highlight ? "transparent" : "#e2e8f0",
                color: k.highlight ? undefined : "#e2e8f0",
              }}>{k.val}</div>
              <div style={{ fontSize: 9, color: "#4b5563", marginTop: 2 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div style={{ background: "rgba(168,85,247,.05)", border: "1px solid rgba(168,85,247,.12)", borderRadius: 12, padding: "14px 12px" }}>
          <div style={{ color: "#4b5563", fontSize: 11, marginBottom: 12 }}>
            {tab === "appts" ? "عدد المواعيد شهرياً" : "الإيرادات شهرياً (ر.س)"}
          </div>

          {/* Bars */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: CHART_H + 20 }}>
            {activeData.map((d, i) => {
              const px = i < shown ? Math.round((d.val / d.max) * CHART_H) : 0;
              const isLast = i === DATA.length - 1;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  {/* Value label on top of last bar */}
                  <div style={{ fontSize: 9, color: isLast ? "#c084fc" : "transparent", fontWeight: 700, height: 12 }}>
                    {isLast ? d.val.toLocaleString("ar-EG") : ""}
                  </div>
                  <div style={{
                    width: "100%",
                    height: `${px}px`,
                    background: isLast
                      ? "linear-gradient(to top,#a855f7,#ec4899)"
                      : "linear-gradient(to top,rgba(168,85,247,.55),rgba(168,85,247,.25))",
                    borderRadius: "5px 5px 0 0",
                    transition: `height 0.7s cubic-bezier(.4,0,.2,1) ${i * 80}ms`,
                    boxShadow: isLast ? "0 0 14px rgba(168,85,247,.5)" : "none",
                    position: "relative",
                  }} />
                  <div style={{ fontSize: 9, color: "#4b5563", whiteSpace: "nowrap" }}>{MONTHS[i]}</div>
                </div>
              );
            })}
          </div>

          {/* Growth arrow */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12, padding: "6px 0", borderTop: "1px solid rgba(255,255,255,.04)" }}>
            <span style={{ fontSize: 14 }}>📈</span>
            <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 700 }}>نمو مستمر خلال ٦ أشهر</span>
            <span style={{ fontSize: 11, color: "#4b5563" }}>· بفضل البوت الذكي</span>
          </div>
        </div>
      </div>
    </div>
  );
}
