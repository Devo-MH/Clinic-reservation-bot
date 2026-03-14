import { useEffect, useState } from "react";

type Notif = {
  id: number;
  type: "new" | "confirm" | "cancel" | "reminder";
  patient: string;
  doctor: string;
  time: string;
  specialty: string;
  ago: number;
};

const POOL = [
  { type: "new"      as const, patient: "محمد العمري",    doctor: "د. سارة",   time: "غداً ١٠:٠٠ص", specialty: "🦷" },
  { type: "confirm"  as const, patient: "سارة الحربي",    doctor: "د. خالد",   time: "اليوم ١١:٣٠ص", specialty: "👁️" },
  { type: "cancel"   as const, patient: "خالد المطيري",   doctor: "د. منى",    time: "غداً ٩:٠٠ص",  specialty: "🩺" },
  { type: "new"      as const, patient: "نورة السعيد",    doctor: "د. أحمد",   time: "بعد غد ٢:٠٠م", specialty: "🏥" },
  { type: "reminder" as const, patient: "عبدالله الغامدي", doctor: "د. سارة",  time: "اليوم ٣:٠٠م", specialty: "🦷" },
  { type: "new"      as const, patient: "فاطمة الزهراني", doctor: "د. خالد",   time: "الأحد ١٠:٣٠ص", specialty: "👁️" },
  { type: "confirm"  as const, patient: "يوسف القحطاني",  doctor: "د. منى",    time: "غداً ١:٠٠م",  specialty: "🩺" },
];

const TYPE_META = {
  new:      { label: "حجز جديد",      color: "#a855f7", icon: "✨" },
  confirm:  { label: "تأكيد موعد",    color: "#22c55e", icon: "✅" },
  cancel:   { label: "إلغاء موعد",    color: "#ef4444", icon: "❌" },
  reminder: { label: "تذكير أُرسل",   color: "#f59e0b", icon: "🔔" },
};

export default function NotificationsDemo() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [pulse,  setPulse]  = useState(false);

  useEffect(() => {
    let id = 0;
    let idx = 0;

    function add() {
      const item = POOL[idx % POOL.length];
      idx++;
      id++;
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
      setNotifs(prev => [{ ...item, id, ago: 0 }, ...prev].slice(0, 6));
      setTimeout(add, 1800 + Math.random() * 1200);
    }

    const t = setTimeout(add, 500);
    return () => clearTimeout(t);
  }, []);

  // Age ticker
  useEffect(() => {
    const iv = setInterval(() =>
      setNotifs(prev => prev.map(n => ({ ...n, ago: n.ago + 1 }))), 1000
    );
    return () => clearInterval(iv);
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
    }}>
      {/* Header */}
      <div style={{ background: "#13102a", padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(168,85,247,.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%", background: "#a855f7",
            boxShadow: pulse ? "0 0 12px #a855f7" : "none",
            transition: "box-shadow .3s",
            animation: "npulse 1.5s infinite",
          }} />
          <span style={{ background: "linear-gradient(135deg,#c084fc,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 800, fontSize: 14 }}>
            الإشعارات الفورية
          </span>
        </div>
        <div style={{ background: "rgba(168,85,247,.15)", border: "1px solid rgba(168,85,247,.25)", borderRadius: 6, padding: "2px 10px", fontSize: 11, color: "#c084fc" }}>
          {notifs.length} إشعار
        </div>
      </div>

      {/* Feed */}
      <div style={{ minHeight: 300, padding: "8px 0" }}>
        {notifs.length === 0 && (
          <div style={{ color: "#4b5563", textAlign: "center", padding: 40, fontSize: 13 }}>جاري الاتصال...</div>
        )}
        {notifs.map((n, i) => {
          const meta = TYPE_META[n.type];
          return (
            <div key={n.id} style={{
              display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 16px",
              borderBottom: "1px solid rgba(255,255,255,.04)",
              animation: i === 0 ? "nSlide .35s ease" : "none",
              opacity: 1 - i * 0.12,
            }}>
              {/* Icon */}
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: `${meta.color}18`,
                border: `1px solid ${meta.color}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16,
              }}>
                {meta.icon}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ background: `${meta.color}20`, color: meta.color, borderRadius: 5, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>
                    {meta.label}
                  </span>
                  <span style={{ fontSize: 12 }}>{n.specialty}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{n.patient}</div>
                <div style={{ fontSize: 11, color: "#4b5563", marginTop: 2 }}>
                  {n.doctor} · {n.time}
                </div>
              </div>

              {/* Time ago */}
              <div style={{ fontSize: 10, color: "#374151", flexShrink: 0, paddingTop: 2 }}>
                {n.ago === 0 ? "الآن" : `${n.ago}ث`}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes nSlide { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes npulse { 0%,100%{opacity:1} 50%{opacity:.3} }
      `}</style>
    </div>
  );
}
