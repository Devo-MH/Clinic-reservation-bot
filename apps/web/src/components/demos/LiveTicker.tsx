import { useEffect, useState } from "react";

const GOLD = "#c9a84c";
const NAVY = "#0f2347";

const EVENTS = [
  { clinic: "عيادة النور — الرياض",       action: "حجز موعد جديد",     patient: "محمد ع.", specialty: "🦷 أسنان",   time: "الآن" },
  { clinic: "مركز الشفاء — جدة",          action: "تأكيد موعد",        patient: "سارة م.",  specialty: "👁️ عيون",   time: "الآن" },
  { clinic: "عيادة الأمل — الدمام",       action: "إعادة جدولة",       patient: "خالد ر.",  specialty: "🩺 طب عام", time: "الآن" },
  { clinic: "مستوصف الحياة — أبوظبي",    action: "حجز موعد جديد",     patient: "نورة س.",  specialty: "🏥 باطنية", time: "الآن" },
  { clinic: "عيادة السلامة — الكويت",     action: "تذكير أُرسل",       patient: "عبدالله غ.", specialty: "🦷 أسنان", time: "الآن" },
  { clinic: "مركز الرعاية — الدوحة",      action: "حجز موعد جديد",     patient: "فاطمة ح.", specialty: "👁️ عيون",  time: "الآن" },
  { clinic: "عيادة الصحة — المنامة",      action: "إلغاء وإعادة حجز",  patient: "أحمد ك.",  specialty: "🩺 طب عام", time: "الآن" },
  { clinic: "مركز النخبة — دبي",          action: "حجز موعد جديد",     patient: "ريم ع.",   specialty: "🏥 أطفال", time: "الآن" },
];

const COLORS: Record<string, string> = {
  "حجز موعد جديد":   "#22c55e",
  "تأكيد موعد":       GOLD,
  "إعادة جدولة":      "#60a5fa",
  "تذكير أُرسل":      "#a78bfa",
  "إلغاء وإعادة حجز": "#f87171",
};

function randomBetween(a: number, b: number) { return Math.floor(Math.random() * (b - a + 1)) + a; }

export default function LiveTicker() {
  const [items, setItems] = useState<(typeof EVENTS[0] & { id: number; ago: number })[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let id = 0;
    let count = 0;

    function addEvent() {
      const evt = EVENTS[Math.floor(Math.random() * EVENTS.length)];
      const newItem = { ...evt, id: id++, ago: 0 };
      setItems(prev => [newItem, ...prev].slice(0, 8));
      count++;
      setTotal(count);
      const next = randomBetween(1200, 2800);
      setTimeout(addEvent, next);
    }

    const t = setTimeout(addEvent, 600);
    return () => clearTimeout(t);
  }, []);

  // Age items
  useEffect(() => {
    const iv = setInterval(() => {
      setItems(prev => prev.map(i => ({ ...i, ago: i.ago + 1 })));
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ background: "#06101f", borderRadius: 20, overflow: "hidden", border: `1px solid ${GOLD}22`, fontFamily: "sans-serif", width: "100%", maxWidth: 580 }} dir="rtl">
      {/* Header */}
      <div style={{ background: NAVY, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${GOLD}22` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", animation: "pulse 1.5s infinite" }} />
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>نشاط حي — جميع العيادات</span>
        </div>
        <div style={{ background: `${GOLD}22`, border: `1px solid ${GOLD}44`, borderRadius: 99, padding: "3px 12px" }}>
          <span style={{ color: GOLD, fontSize: 13, fontWeight: 700 }}>{total.toLocaleString("ar-EG")} حدث</span>
        </div>
      </div>

      {/* Feed */}
      <div style={{ minHeight: 360, padding: "8px 0" }}>
        {items.length === 0 && (
          <div style={{ color: "#475569", textAlign: "center", padding: 40, fontSize: 14 }}>جاري الاتصال...</div>
        )}
        {items.map((item, i) => (
          <div key={item.id} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 20px",
            borderBottom: "1px solid #ffffff06",
            animation: i === 0 ? "slideIn .35s ease" : "none",
            opacity: 1 - i * 0.09,
          }}>
            <div style={{ fontSize: 22, flexShrink: 0 }}>{item.specialty.split(" ")[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ background: `${COLORS[item.action] ?? GOLD}22`, color: COLORS[item.action] ?? GOLD, borderRadius: 6, padding: "1px 8px", fontSize: 11, fontWeight: 600 }}>{item.action}</span>
                <span style={{ color: "#e2e8f0", fontSize: 13 }}>{item.patient}</span>
              </div>
              <div style={{ color: "#475569", fontSize: 12, marginTop: 3 }}>{item.clinic}</div>
            </div>
            <div style={{ color: "#334155", fontSize: 11, flexShrink: 0 }}>
              {item.ago === 0 ? "الآن" : `منذ ${item.ago}ث`}
            </div>
          </div>
        ))}
      </div>

      {/* Footer stats */}
      <div style={{ background: NAVY, padding: "12px 20px", display: "flex", justifyContent: "space-around", borderTop: `1px solid ${GOLD}22` }}>
        {[
          { label: "عيادة نشطة", v: "48" },
          { label: "دولة", v: "6" },
          { label: "موعد اليوم", v: total > 0 ? (total * 3 + 124).toString() : "..." },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ color: GOLD, fontWeight: 800, fontSize: 18 }}>{s.v}</div>
            <div style={{ color: "#475569", fontSize: 11 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideIn { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>
    </div>
  );
}
