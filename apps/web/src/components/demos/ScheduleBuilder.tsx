import { useEffect, useState } from "react";

const GOLD = "#c9a84c";
const NAVY = "#0f2347";

const HOURS = ["9ص","10ص","11ص","12م","1م","2م","3م","4م"];
const DOCTORS = [
  { name: "د. أحمد الزهراني", specialty: "🦷 أسنان" },
  { name: "د. سلمى العتيبي",  specialty: "👁️ عيون"  },
  { name: "د. محمد الغامدي",  specialty: "🩺 طب عام" },
];

type SlotState = "free" | "booked" | "selected";

const INITIAL: SlotState[][] = DOCTORS.map(() => HOURS.map(() => "free"));

// Bookings that animate in
const BOOKING_SEQUENCE = [
  { doc: 0, slot: 0 }, { doc: 0, slot: 1 }, { doc: 1, slot: 2 },
  { doc: 2, slot: 0 }, { doc: 2, slot: 1 }, { doc: 0, slot: 3 },
  { doc: 1, slot: 4 }, { doc: 2, slot: 3 }, { doc: 0, slot: 5 },
  { doc: 1, slot: 6 }, { doc: 2, slot: 5 }, { doc: 0, slot: 7 },
];

export default function ScheduleBuilder() {
  const [grid, setGrid] = useState<SlotState[][]>(INITIAL.map(r => [...r]));
  const [bookingIdx, setBookingIdx] = useState(0);
  const [hoveredSlot, setHoveredSlot] = useState<[number,number]|null>(null);

  useEffect(() => {
    if (bookingIdx >= BOOKING_SEQUENCE.length) {
      // Reset after pause
      const t = setTimeout(() => {
        setGrid(INITIAL.map(r => [...r]));
        setBookingIdx(0);
      }, 3000);
      return () => clearTimeout(t);
    }
    const { doc, slot } = BOOKING_SEQUENCE[bookingIdx];
    const t = setTimeout(() => {
      setGrid(prev => {
        const next = prev.map(r => [...r]);
        next[doc][slot] = "booked";
        return next;
      });
      setBookingIdx(i => i + 1);
    }, 500);
    return () => clearTimeout(t);
  }, [bookingIdx]);

  const totalBooked = grid.flat().filter(s => s === "booked").length;
  const totalFree   = grid.flat().filter(s => s === "free").length;

  return (
    <div style={{ background:"#06101f", borderRadius:20, overflow:"hidden", border:`1px solid ${GOLD}22`, fontFamily:"sans-serif", maxWidth:560, width:"100%" }} dir="rtl">
      {/* Header */}
      <div style={{ background:NAVY, padding:"14px 20px", borderBottom:`1px solid ${GOLD}22`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ color:"#fff", fontWeight:700, fontSize:15 }}>جدول المواعيد — الأسبوع الحالي</div>
          <div style={{ color:"#64748b", fontSize:12, marginTop:2 }}>يتحدث تلقائياً مع كل حجز جديد</div>
        </div>
        <div style={{ display:"flex", gap:12 }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ color:"#22c55e", fontWeight:800, fontSize:16 }}>{totalBooked}</div>
            <div style={{ color:"#475569", fontSize:10 }}>محجوز</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ color:GOLD, fontWeight:800, fontSize:16 }}>{totalFree}</div>
            <div style={{ color:"#475569", fontSize:10 }}>متاح</div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding:"16px 16px 8px", overflowX:"auto" }}>
        {/* Hour headers */}
        <div style={{ display:"grid", gridTemplateColumns:`140px repeat(${HOURS.length},1fr)`, gap:4, marginBottom:4 }}>
          <div />
          {HOURS.map(h => (
            <div key={h} style={{ textAlign:"center", color:"#64748b", fontSize:11, padding:"2px 0" }}>{h}</div>
          ))}
        </div>

        {/* Doctor rows */}
        {DOCTORS.map((doc, di) => (
          <div key={di} style={{ display:"grid", gridTemplateColumns:`140px repeat(${HOURS.length},1fr)`, gap:4, marginBottom:4 }}>
            <div style={{ display:"flex", flexDirection:"column", justifyContent:"center", paddingLeft:4 }}>
              <div style={{ color:"#e2e8f0", fontSize:12, fontWeight:600 }}>{doc.name}</div>
              <div style={{ color:"#475569", fontSize:10 }}>{doc.specialty}</div>
            </div>
            {HOURS.map((_, si) => {
              const state = grid[di][si];
              const isHovered = hoveredSlot?.[0] === di && hoveredSlot?.[1] === si;
              return (
                <div
                  key={si}
                  onMouseEnter={() => setHoveredSlot([di, si])}
                  onMouseLeave={() => setHoveredSlot(null)}
                  style={{
                    height:36,
                    borderRadius:8,
                    border:`1px solid`,
                    borderColor: state==="booked" ? "#22c55e44" : isHovered ? `${GOLD}66` : "#ffffff0a",
                    background: state==="booked"
                      ? "linear-gradient(135deg,#22c55e22,#16a34a22)"
                      : isHovered ? `${GOLD}11` : "#0f2347",
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center",
                    fontSize:14,
                    transition:"all .25s",
                    animation: state==="booked" ? "pop .3s ease" : "none",
                    cursor:"default",
                  }}
                >
                  {state==="booked" ? "✓" : ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ padding:"10px 20px 16px", display:"flex", gap:20 }}>
        {[
          { color:"#22c55e", label:"محجوز" },
          { color:GOLD,      label:"متاح" },
        ].map(l => (
          <div key={l.label} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:10,height:10,borderRadius:3,background:l.color+"33",border:`1px solid ${l.color}66` }} />
            <span style={{ color:"#64748b", fontSize:11 }}>{l.label}</span>
          </div>
        ))}
        <div style={{ marginRight:"auto", color:"#334155", fontSize:11 }}>الحجوزات تظهر فور إرسالها عبر واتساب ⚡</div>
      </div>
      <style>{`@keyframes pop{0%{transform:scale(.6);opacity:0}70%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}
