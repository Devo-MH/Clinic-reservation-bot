import { useEffect, useState, useRef } from "react";

interface Msg { id: number; from: "patient"|"bot"; text: string; time: string; buttons?: string[]; }

const FLOW: { delay: number; msg: Msg }[] = [
  { delay: 800,  msg: { id:1, from:"patient", text:"السلام عليكم\nأبغى أغير موعدي", time:"11:15" } },
  { delay: 2800, msg: { id:2, from:"bot",     text:"وعليكم السلام 😊\nوجدت موعدك:\n\n📅 غداً — 10:00 ص\n👨‍⚕️ د. أحمد الزهراني\n\nماذا تريد؟", time:"11:15", buttons:["📅 تغيير الوقت","❌ إلغاء الموعد"] } },
  { delay: 5500, msg: { id:3, from:"patient", text:"📅 تغيير الوقت", time:"11:16" } },
  { delay: 7500, msg: { id:4, from:"bot",     text:"اختر وقتاً جديداً مع د. أحمد:", time:"11:16", buttons:["11:00 ص","2:00 م","4:00 م"] } },
  { delay: 10000, msg:{ id:5, from:"patient", text:"2:00 م", time:"11:16" } },
  { delay: 12000, msg:{ id:6, from:"bot",     text:"✅ تم تغيير موعدك!\n\n📅 غداً — 2:00 مساءً\n👨‍⚕️ د. أحمد الزهراني\n🦷 طب الأسنان\n\nسيصلك تذكير قبل الموعد 🔔", time:"11:16" } },
];

const TYPING_BEFORE = new Set([2,4,6]);

export default function RescheduleDemo() {
  const [shown, setShown] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function run() {
    setShown([]); setTyping(false);
    FLOW.forEach(({ delay, msg }) => {
      if (TYPING_BEFORE.has(msg.id)) timers.current.push(setTimeout(() => setTyping(true), delay - 1200));
      timers.current.push(setTimeout(() => { setTyping(false); setShown(p => [...p, msg]); }, delay));
    });
    timers.current.push(setTimeout(run, 17000));
  }

  useEffect(() => { run(); return () => timers.current.forEach(clearTimeout); }, []);
  useEffect(() => { const el = chatRef.current; if (el) el.scrollTop = el.scrollHeight; }, [shown, typing]);

  return (
    <div style={{ width: 300, margin: "0 auto", fontFamily: "sans-serif" }}>
      <div style={{ background: "#1a1a2e", borderRadius: 36, padding: 10, boxShadow: "0 30px 80px #000a" }}>
        <div style={{ borderRadius: 28, overflow: "hidden", background: "#0b141a", display: "flex", flexDirection: "column", height: 560 }}>
          <div style={{ background: "#1f2c34", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#c9a84c,#f0c040)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏥</div>
            <div>
              <div style={{ color: "#e9edef", fontSize: 14, fontWeight: 600 }}>عيادة النور</div>
              <div style={{ color: "#8696a0", fontSize: 11 }}>{typing ? "يكتب..." : "متصل"}</div>
            </div>
          </div>
          <div ref={chatRef} style={{ flex:1, overflowY:"auto", padding:"10px 8px", background:"#0b141a", scrollbarWidth:"none" }} dir="rtl">
            <div style={{ textAlign:"center", marginBottom:10 }}>
              <span style={{ background:"#182229", color:"#8696a0", fontSize:11, borderRadius:8, padding:"3px 10px" }}>اليوم</span>
            </div>
            {shown.map(msg => (
              <div key={msg.id} style={{ display:"flex", justifyContent: msg.from==="patient"?"flex-start":"flex-end", marginBottom:6 }}>
                <div style={{ maxWidth:"82%", background: msg.from==="patient"?"#202c33":"#005c4b", borderRadius: msg.from==="patient"?"0 12px 12px 12px":"12px 0 12px 12px", padding:"8px 10px", animation:"fadeUp .3s ease" }}>
                  <div style={{ color:"#e9edef", fontSize:13, lineHeight:1.5, whiteSpace:"pre-line", textAlign:"right" }}>{msg.text}</div>
                  {msg.buttons && (
                    <div style={{ marginTop:8, display:"flex", flexDirection:"column", gap:4 }}>
                      {msg.buttons.map(b => <div key={b} style={{ background:"#182229", border:"1px solid #2a3942", borderRadius:8, padding:"6px 10px", color:"#00a884", fontSize:12, textAlign:"center" }}>{b}</div>)}
                    </div>
                  )}
                  <div style={{ color:"#8696a0", fontSize:10, textAlign:"left", marginTop:3 }}>{msg.time}</div>
                </div>
              </div>
            ))}
            {typing && (
              <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:6 }}>
                <div style={{ background:"#005c4b", borderRadius:"12px 0 12px 12px", padding:"10px 14px", display:"flex", gap:4, alignItems:"center" }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"#8696a0", animation:`bounce 1.2s ${i*.2}s infinite` }} />)}
                </div>
              </div>
            )}
          </div>
          <div style={{ background:"#1f2c34", padding:"8px 10px", display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
            <div style={{ flex:1, background:"#2a3942", borderRadius:24, padding:"7px 12px", color:"#8696a0", fontSize:12 }}>رسالة</div>
            <div style={{ width:34, height:34, borderRadius:"50%", background:"#00a884", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🎤</div>
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}`}</style>
    </div>
  );
}
