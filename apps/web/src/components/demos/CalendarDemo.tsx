import { useEffect, useState } from "react";

const DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"];
const HOURS = ["٩ص", "١٠ص", "١١ص", "١٢م", "١م", "٢م", "٣م"];

type Slot = { day: number; hour: number; name: string; color: string; specialty: string };

const INITIAL_SLOTS: Slot[] = [
  { day: 0, hour: 0, name: "محمد ع.", color: "#a855f7", specialty: "🦷" },
  { day: 0, hour: 2, name: "سارة م.", color: "#22c55e", specialty: "👁️" },
  { day: 1, hour: 1, name: "خالد ر.", color: "#ec4899", specialty: "🩺" },
  { day: 1, hour: 4, name: "نورة س.", color: "#a855f7", specialty: "🦷" },
  { day: 2, hour: 0, name: "أحمد ك.", color: "#f59e0b", specialty: "🏥" },
  { day: 2, hour: 3, name: "ريم ع.", color: "#22c55e", specialty: "👁️" },
  { day: 3, hour: 2, name: "فهد ن.", color: "#ec4899", specialty: "🩺" },
  { day: 3, hour: 5, name: "دلال ص.", color: "#a855f7", specialty: "🦷" },
  { day: 4, hour: 1, name: "عمر ب.", color: "#22c55e", specialty: "👁️" },
  { day: 4, hour: 3, name: "هند ج.", color: "#f59e0b", specialty: "🏥" },
];

const NEW_SLOTS: Slot[] = [
  { day: 1, hour: 6, name: "يوسف م.", color: "#a855f7", specialty: "🦷" },
  { day: 3, hour: 0, name: "منى ع.", color: "#ec4899", specialty: "🩺" },
  { day: 4, hour: 5, name: "وليد ر.", color: "#22c55e", specialty: "👁️" },
];

export default function CalendarDemo() {
  const [slots, setSlots] = useState<(Slot & { visible: boolean })[]>(
    INITIAL_SLOTS.map(s => ({ ...s, visible: false }))
  );
  const [newSlot, setNewSlot] = useState<number>(-1);

  // Animate initial slots in
  useEffect(() => {
    const timers = INITIAL_SLOTS.map((_, i) =>
      setTimeout(() => setSlots(prev => prev.map((s, j) => j === i ? { ...s, visible: true } : s)), 100 + i * 120)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // Cycle new incoming bookings
  useEffect(() => {
    let idx = 0;
    function addNew() {
      const slot = NEW_SLOTS[idx % NEW_SLOTS.length];
      setNewSlot(idx % NEW_SLOTS.length);
      setSlots(prev => {
        const exists = prev.find(s => s.day === slot.day && s.hour === slot.hour);
        if (exists) return prev.map(s => s.day === slot.day && s.hour === slot.hour ? { ...s, visible: true } : s);
        return [...prev, { ...slot, visible: true }];
      });
      idx++;
    }
    const t = setInterval(addNew, 2200);
    return () => clearInterval(t);
  }, []);

  void newSlot;

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
          📅 جدول الأسبوع
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ background: "rgba(168,85,247,.15)", border: "1px solid rgba(168,85,247,.25)", borderRadius: 6, padding: "2px 10px", fontSize: 11, color: "#c084fc" }}>
            {slots.filter(s => s.visible).length} موعد
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 14px" }}>
        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "36px repeat(5,1fr)", gap: 4, marginBottom: 4 }}>
          <div />
          {DAYS.map((d, i) => (
            <div key={i} style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,.4)", padding: "4px 0", fontWeight: 600 }}>{d}</div>
          ))}
        </div>

        {/* Time grid */}
        {HOURS.map((h, hi) => (
          <div key={hi} style={{ display: "grid", gridTemplateColumns: "36px repeat(5,1fr)", gap: 4, marginBottom: 4 }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,.3)", paddingTop: 6, textAlign: "center" }}>{h}</div>
            {DAYS.map((_, di) => {
              const slot = slots.find(s => s.day === di && s.hour === hi);
              return (
                <div key={di} style={{
                  height: 34,
                  borderRadius: 8,
                  background: slot?.visible
                    ? `${slot.color}22`
                    : "rgba(255,255,255,.03)",
                  border: slot?.visible
                    ? `1px solid ${slot.color}55`
                    : "1px solid rgba(255,255,255,.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  transition: "all .4s ease",
                  overflow: "hidden",
                  gap: 3,
                  boxShadow: slot?.visible ? `0 0 10px ${slot.color}22` : "none",
                }}>
                  {slot?.visible && (
                    <>
                      <span style={{ fontSize: 12 }}>{slot.specialty}</span>
                      <span style={{ color: slot.color, fontWeight: 600, fontSize: 9, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 48 }}>{slot.name}</span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ padding: "8px 14px 12px", display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[
          { c: "#a855f7", l: "🦷 أسنان" },
          { c: "#22c55e", l: "👁️ عيون" },
          { c: "#ec4899", l: "🩺 طب عام" },
          { c: "#f59e0b", l: "🏥 باطنية" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "rgba(255,255,255,.4)" }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: item.c }} />
            {item.l}
          </div>
        ))}
      </div>
    </div>
  );
}
