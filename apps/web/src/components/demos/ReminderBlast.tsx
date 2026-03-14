import { useEffect, useState, useRef } from "react";

const GOLD = "#c9a84c";
const NAVY = "#0f2347";

const PATIENTS = [
  { name: "محمد العمري",    time: "9:00 ص",  specialty: "🦷" },
  { name: "سارة الحربي",    time: "9:30 ص",  specialty: "👁️" },
  { name: "خالد المطيري",   time: "10:00 ص", specialty: "🩺" },
  { name: "نورة السعيد",    time: "10:30 ص", specialty: "🦷" },
  { name: "عبدالله الغامدي",time: "11:00 ص", specialty: "🏥" },
  { name: "فاطمة الزهراني", time: "11:30 ص", specialty: "🩺" },
  { name: "أحمد القحطاني",  time: "12:00 م", specialty: "👁️" },
  { name: "ريم العتيبي",    time: "12:30 م", specialty: "🦷" },
  { name: "يوسف الشمري",    time: "1:00 م",  specialty: "🩺" },
  { name: "هند الدوسري",    time: "2:00 م",  specialty: "🏥" },
  { name: "سلطان البلوي",   time: "2:30 م",  specialty: "🦷" },
  { name: "منيرة الرشيدي",  time: "3:00 م",  specialty: "👁️" },
];

export default function ReminderBlast() {
  const [sent, setSent] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function reset() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setSent(0); setRunning(false); setDone(false); setElapsed(0);
  }

  function start() {
    reset();
    setRunning(true);
    const startTime = Date.now();

    PATIENTS.forEach((_, i) => {
      const t = setTimeout(() => {
        setSent(i + 1);
        if (i === PATIENTS.length - 1) {
          setElapsed(((Date.now() - startTime) / 1000).toFixed(1) as unknown as number);
          setDone(true);
          setRunning(false);
          timers.current.push(setTimeout(() => { reset(); }, 4000));
        }
      }, 300 + i * 280);
      timers.current.push(t);
    });
  }

  useEffect(() => { start(); return () => timers.current.forEach(clearTimeout); }, []);

  const pct = Math.round((sent / PATIENTS.length) * 100);

  return (
    <div style={{ background: "#06101f", borderRadius: 20, overflow: "hidden", border: `1px solid ${GOLD}22`, fontFamily: "sans-serif", maxWidth: 520, width: "100%" }} dir="rtl">
      {/* Header */}
      <div style={{ background: NAVY, padding: "16px 20px", borderBottom: `1px solid ${GOLD}22`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>إرسال تذكيرات الصباح</div>
          <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>8:00 صباحاً — يومياً تلقائياً</div>
        </div>
        <div style={{ fontSize: 28 }}>🔔</div>
      </div>

      {/* Progress */}
      <div style={{ padding: "20px 20px 10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ color: "#94a3b8", fontSize: 13 }}>{sent} / {PATIENTS.length} رسالة</span>
          <span style={{ color: GOLD, fontWeight: 700, fontSize: 13 }}>{pct}%</span>
        </div>
        <div style={{ background: "#1e293b", borderRadius: 99, height: 8, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(to left, ${GOLD}, #f0c040)`, borderRadius: 99, transition: "width .25s ease" }} />
        </div>
      </div>

      {/* Patient list */}
      <div style={{ padding: "8px 12px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        {PATIENTS.map((p, i) => {
          const isSent = i < sent;
          const isActive = i === sent - 1;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 10, background: isActive ? `${GOLD}11` : "transparent", transition: "background .2s" }}>
              <div style={{ fontSize: 18 }}>{p.specialty}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: isSent ? "#e2e8f0" : "#334155", fontSize: 13, transition: "color .3s" }}>{p.name}</div>
                <div style={{ color: "#475569", fontSize: 11 }}>{p.time}</div>
              </div>
              <div style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
                background: isSent ? "#22c55e22" : "#1e293b",
                transition: "background .3s",
              }}>
                {isSent ? <span style={{ color: "#22c55e" }}>✓</span> : <span style={{ color: "#334155", fontSize: 10 }}>○</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ background: NAVY, padding: "14px 20px", borderTop: `1px solid ${GOLD}22`, textAlign: "center" }}>
        {done ? (
          <div style={{ animation: "fadeUp .4s ease" }}>
            <div style={{ color: "#22c55e", fontWeight: 800, fontSize: 16 }}>✅ أُرسلت {PATIENTS.length} رسالة في {elapsed} ثانية</div>
            <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>توفير: ~{Math.round(PATIENTS.length * 2.5)} دقيقة من العمل اليدوي</div>
          </div>
        ) : running ? (
          <div style={{ color: "#94a3b8", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: GOLD, animation: "pulse 1s infinite" }} />
            جاري الإرسال...
          </div>
        ) : (
          <button onClick={start} style={{ background: GOLD, color: "#0a1628", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            ابدأ الإرسال
          </button>
        )}
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  );
}
