import { useEffect, useState, useRef } from "react";

const GOLD = "#c9a84c";

const AR_FLOW = [
  { delay: 600,  from:"patient", text:"السلام عليكم، أبغى أحجز موعد" },
  { delay: 2400, from:"bot",     text:"وعليكم السلام! 😊\nاختر التخصص:" },
  { delay: 4800, from:"patient", text:"🦷 أسنان" },
  { delay: 6600, from:"bot",     text:"✅ تم الحجز!\n📅 غداً 10:00 ص\n👨‍⚕️ د. أحمد" },
];

const EN_FLOW = [
  { delay: 600,  from:"patient", text:"Hi, I'd like to book an appointment" },
  { delay: 2400, from:"bot",     text:"Hello! 😊\nChoose a specialty:" },
  { delay: 4800, from:"patient", text:"🦷 Dental" },
  { delay: 6600, from:"bot",     text:"✅ Booked!\n📅 Tomorrow 10:00 AM\n👨‍⚕️ Dr. Ahmed" },
];

function MiniPhone({ flow, lang, label }: { flow: typeof AR_FLOW; lang: "ar"|"en"; label: string }) {
  const [shown, setShown] = useState<typeof AR_FLOW>([]);
  const [typing, setTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isRTL = lang === "ar";

  function run() {
    setShown([]); setTyping(false);
    flow.forEach(({ delay, from }, i) => {
      if (from === "bot") timers.current.push(setTimeout(() => setTyping(true), delay - 1000));
      timers.current.push(setTimeout(() => {
        setTyping(false);
        setShown(p => [...p, flow[i]]);
      }, delay));
    });
    timers.current.push(setTimeout(run, 10000));
  }

  useEffect(() => { run(); return () => timers.current.forEach(clearTimeout); }, []);
  useEffect(() => { const el = chatRef.current; if (el) el.scrollTop = el.scrollHeight; }, [shown, typing]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}44`, borderRadius: 99, padding: "4px 14px", color: GOLD, fontSize: 12, fontWeight: 600 }}>{label}</div>
      <div style={{ background: "#1a1a2e", borderRadius: 28, padding: 8, boxShadow: "0 20px 60px #000a" }}>
        <div style={{ borderRadius: 22, overflow: "hidden", background: "#0b141a", width: 240, height: 420, display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={{ background: "#1f2c34", padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${GOLD},#f0c040)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🏥</div>
            <div>
              <div style={{ color: "#e9edef", fontSize: 12, fontWeight: 600 }}>Clinic Bot</div>
              <div style={{ color: "#8696a0", fontSize: 10 }}>{typing ? (lang === "ar" ? "يكتب..." : "typing...") : (lang === "ar" ? "متصل" : "online")}</div>
            </div>
          </div>
          {/* Chat */}
          <div ref={chatRef} dir={isRTL ? "rtl" : "ltr"} style={{ flex:1, overflowY:"auto", padding:"8px 6px", scrollbarWidth:"none" }}>
            {shown.map((m, i) => (
              <div key={i} style={{ display:"flex", justifyContent: m.from==="patient"?(isRTL?"flex-start":"flex-end"):(isRTL?"flex-end":"flex-start"), marginBottom:5, animation:"fadeUp .3s ease" }}>
                <div style={{ maxWidth:"80%", background: m.from==="patient"?"#202c33":"#005c4b", borderRadius:10, padding:"6px 8px" }}>
                  <div style={{ color:"#e9edef", fontSize:11.5, lineHeight:1.5, whiteSpace:"pre-line", textAlign: isRTL ? "right" : "left" }}>{m.text}</div>
                </div>
              </div>
            ))}
            {typing && (
              <div style={{ display:"flex", justifyContent: isRTL?"flex-end":"flex-start", marginBottom:5 }}>
                <div style={{ background:"#005c4b", borderRadius:10, padding:"8px 10px", display:"flex", gap:3 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:5,height:5,borderRadius:"50%",background:"#8696a0",animation:`bounce 1.2s ${i*.2}s infinite` }} />)}
                </div>
              </div>
            )}
          </div>
          {/* Input */}
          <div style={{ background:"#1f2c34", padding:"6px 8px", display:"flex", gap:6 }}>
            <div style={{ flex:1, background:"#2a3942", borderRadius:18, padding:"6px 10px", color:"#8696a0", fontSize:11 }}>{lang === "ar" ? "رسالة" : "Message"}</div>
            <div style={{ width:28,height:28,borderRadius:"50%",background:"#00a884",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12 }}>🎤</div>
          </div>
        </div>
      </div>
      {/* Language pill */}
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <div style={{ width:8,height:8,borderRadius:"50%",background:"#22c55e",animation:"pulse 1.5s infinite" }} />
        <span style={{ color:"#64748b", fontSize:11 }}>{lang === "ar" ? "كشف تلقائي للعربية" : "Auto-detected English"}</span>
      </div>
    </div>
  );
}

export default function MultiLanguageDemo() {
  return (
    <div style={{ fontFamily:"sans-serif" }}>
      <div style={{ display:"flex", gap:32, justifyContent:"center", flexWrap:"wrap", alignItems:"flex-start" }}>
        <MiniPhone flow={AR_FLOW} lang="ar" label="🇸🇦 عربي" />
        <div style={{ display:"flex", alignItems:"center", alignSelf:"center", paddingTop:40 }}>
          <div style={{ width:40,height:40,borderRadius:"50%",background:`${GOLD}18`,border:`1px solid ${GOLD}44`,display:"flex",alignItems:"center",justifyContent:"center",color:GOLD,fontSize:18 }}>🤖</div>
        </div>
        <MiniPhone flow={EN_FLOW} lang="en" label="🇬🇧 English" />
      </div>
      <div style={{ textAlign:"center", marginTop:20, color:"#475569", fontSize:13 }}>
        نفس البوت — يتعرف على لغة المريض تلقائياً ويرد بها
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}} @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
}
