import { useEffect, useState } from "react";

const GOLD = "#c9a84c";

function useCountUp(target: number, duration = 1600, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let frame = 0;
    const frames = Math.round(duration / 16);
    const iv = setInterval(() => {
      frame++;
      setVal(Math.min(Math.round((frame / frames) * target), target));
      if (frame >= frames) clearInterval(iv);
    }, 16);
    return () => clearInterval(iv);
  }, [start, target]);
  return val;
}

const BEFORE_EVENTS = [
  "📞 مكالمة لم تُرد",
  "📞 مكالمة لم تُرد",
  "📋 تسجيل يدوي خاطئ",
  "❌ مريض لم يحضر",
  "📞 مكالمة لم تُرد",
  "😤 مريض غاضب",
  "📋 تعارض في المواعيد",
  "❌ مريض لم يحضر",
];

const AFTER_EVENTS = [
  "✅ حجز تلقائي — محمد",
  "✅ تذكير أُرسل — سارة",
  "✅ حجز تلقائي — خالد",
  "✅ تأكيد موعد — نورة",
  "✅ حجز تلقائي — أحمد",
  "✅ تذكير أُرسل — فاطمة",
  "✅ إعادة جدولة — عمر",
  "✅ حجز تلقائي — ريم",
];

export default function BeforeAfter() {
  const [started, setStarted] = useState(false);
  const [beforeEvents, setBeforeEvents] = useState<string[]>([]);
  const [afterEvents,  setAfterEvents]  = useState<string[]>([]);

  const missedBefore = useCountUp(23, 1800, started);
  const savedAfter   = useCountUp(0,  1800, started);    // stays 0 — no missed
  const noShowBefore = useCountUp(8,  1400, started);
  const noShowAfter  = useCountUp(2,  1400, started);
  const hrsBefore    = useCountUp(14, 1600, started);
  const hrsAfter     = useCountUp(1,  1600, started);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 300);
    const timers: ReturnType<typeof setTimeout>[] = [t];

    BEFORE_EVENTS.forEach((e, i) => {
      timers.push(setTimeout(() => setBeforeEvents(p => [...p, e]), 500 + i * 600));
    });
    AFTER_EVENTS.forEach((e, i) => {
      timers.push(setTimeout(() => setAfterEvents(p => [...p, e]), 500 + i * 500));
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  function Panel({ title, color, bg, events, stats }: {
    title: string; color: string; bg: string; events: string[];
    stats: { label: string; value: number; suffix?: string; good: boolean }[];
  }) {
    return (
      <div style={{ flex:1, background:"#06101f", borderRadius:16, border:`1px solid ${color}33`, overflow:"hidden", minWidth:240 }}>
        <div style={{ background:bg, padding:"12px 16px", textAlign:"center" }}>
          <div style={{ color, fontWeight:800, fontSize:16 }}>{title}</div>
        </div>
        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:1, background:`${color}11` }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background:"#06101f", padding:"10px 8px", textAlign:"center" }}>
              <div style={{ color: s.good ? "#22c55e" : "#ef4444", fontWeight:800, fontSize:18 }}>{s.value}{s.suffix}</div>
              <div style={{ color:"#475569", fontSize:9, marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        {/* Events feed */}
        <div style={{ padding:"8px", height:220, overflowY:"auto", scrollbarWidth:"none" }}>
          {events.map((e, i) => (
            <div key={i} style={{ padding:"6px 8px", borderRadius:8, marginBottom:4, background:`${color}08`, animation:"fadeUp .3s ease",
              color: color === "#ef4444" ? "#fca5a5" : "#86efac", fontSize:12 }}>
              {e}
            </div>
          ))}
          {events.length === 0 && <div style={{ color:"#334155", fontSize:12, textAlign:"center", paddingTop:40 }}>...</div>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily:"sans-serif" }} dir="rtl">
      <div style={{ display:"flex", gap:12, alignItems:"flex-start", flexWrap:"wrap" }}>
        <Panel
          title="❌ بدون موعدك"
          color="#ef4444"
          bg="#1a0a0a"
          events={beforeEvents}
          stats={[
            { label:"مكالمة فائتة", value:missedBefore, good:false },
            { label:"غياب المريض", value:noShowBefore, good:false },
            { label:"ساعة عمل يدوي", value:hrsBefore, good:false },
          ]}
        />

        {/* VS divider */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", alignSelf:"center", flexShrink:0 }}>
          <div style={{ width:44, height:44, borderRadius:"50%", background:`${GOLD}22`, border:`2px solid ${GOLD}`, display:"flex", alignItems:"center", justifyContent:"center", color:GOLD, fontWeight:900, fontSize:13 }}>VS</div>
        </div>

        <Panel
          title="✅ مع موعدك"
          color="#22c55e"
          bg="#0a1a0a"
          events={afterEvents}
          stats={[
            { label:"مكالمة فائتة", value:savedAfter, good:true },
            { label:"غياب المريض", value:noShowAfter, good:true },
            { label:"ساعة عمل يدوي", value:hrsAfter, good:true },
          ]}
        />
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
