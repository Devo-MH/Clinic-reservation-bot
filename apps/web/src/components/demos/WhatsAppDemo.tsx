import { useEffect, useState, useRef } from "react";

interface Message {
  id: number;
  from: "patient" | "bot";
  text: string;
  time: string;
  buttons?: string[];
}

const CONVERSATION: { delay: number; msg: Message }[] = [
  { delay: 800,  msg: { id: 1, from: "patient", text: "السلام عليكم، أبغى أحجز موعد", time: "10:01" } },
  { delay: 2800, msg: { id: 2, from: "bot",     text: "وعليكم السلام! أهلاً بك في عيادة النور 😊\nما اسمك الكريم؟", time: "10:01" } },
  { delay: 5000, msg: { id: 3, from: "patient", text: "محمد العمري", time: "10:02" } },
  { delay: 7000, msg: { id: 4, from: "bot",     text: "أهلاً محمد! 👋\nاختر التخصص المطلوب:", time: "10:02", buttons: ["🦷 أسنان", "👁️ عيون", "🩺 طب عام"] } },
  { delay: 9500, msg: { id: 5, from: "patient", text: "🦷 أسنان", time: "10:02" } },
  { delay: 11500, msg: { id: 6, from: "bot",    text: "ممتاز! الأوقات المتاحة غداً مع د. أحمد الزهراني:", time: "10:03", buttons: ["9:00 ص", "10:00 ص", "11:00 ص"] } },
  { delay: 14000, msg: { id: 7, from: "patient", text: "10:00 ص", time: "10:03" } },
  { delay: 16000, msg: { id: 8, from: "bot",    text: "✅ تم تأكيد موعدك!\n\n📅 غداً — 10:00 صباحاً\n👨‍⚕️ د. أحمد الزهراني\n🦷 طب الأسنان\n📍 عيادة النور\n\nسيصلك تذكير قبل الموعد بساعة 🔔", time: "10:03" } },
];

const TYPING_BEFORE = new Set([2, 4, 6, 8]);
const LOOP_DELAY = 22000;

export default function WhatsAppDemo() {
  const [shown, setShown] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function run() {
    setShown([]);
    setTyping(false);

    CONVERSATION.forEach(({ delay, msg }) => {
      if (TYPING_BEFORE.has(msg.id)) {
        timers.current.push(setTimeout(() => setTyping(true), delay - 1200));
      }
      timers.current.push(setTimeout(() => {
        setTyping(false);
        setShown(prev => [...prev, msg]);
      }, delay));
    });

    timers.current.push(setTimeout(run, LOOP_DELAY));
  }

  useEffect(() => {
    run();
    return () => timers.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [shown, typing]);

  return (
    <div style={{ width: 320, margin: "0 auto", fontFamily: "sans-serif" }}>
      {/* Phone frame */}
      <div style={{ background: "#1a1a2e", borderRadius: 36, padding: 10, boxShadow: "0 30px 80px #000a" }}>
        {/* Screen */}
        <div style={{ borderRadius: 28, overflow: "hidden", background: "#0b141a", display: "flex", flexDirection: "column", height: 620 }}>

          {/* WhatsApp header */}
          <div style={{ background: "#1f2c34", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#c9a84c,#f0c040)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏥</div>
            <div>
              <div style={{ color: "#e9edef", fontSize: 15, fontWeight: 600 }}>عيادة النور</div>
              <div style={{ color: "#8696a0", fontSize: 11 }}>{typing ? "يكتب..." : "متصل"}</div>
            </div>
          </div>

          {/* Chat wallpaper */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 10px", background: "#0b141a", scrollbarWidth: "none" }} dir="rtl">
            {/* Date pill */}
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <span style={{ background: "#182229", color: "#8696a0", fontSize: 11, borderRadius: 8, padding: "3px 10px" }}>اليوم</span>
            </div>

            {shown.map(msg => (
              <div key={msg.id} style={{ display: "flex", justifyContent: msg.from === "patient" ? "flex-start" : "flex-end", marginBottom: 6 }}>
                <div style={{
                  maxWidth: "80%",
                  background: msg.from === "patient" ? "#202c33" : "#005c4b",
                  borderRadius: msg.from === "patient" ? "0 12px 12px 12px" : "12px 0 12px 12px",
                  padding: "8px 10px",
                  animation: "fadeUp 0.3s ease",
                }}>
                  <div style={{ color: "#e9edef", fontSize: 13.5, lineHeight: 1.5, whiteSpace: "pre-line", textAlign: "right" }}>{msg.text}</div>
                  {msg.buttons && (
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                      {msg.buttons.map(b => (
                        <div key={b} style={{ background: "#182229", border: "1px solid #2a3942", borderRadius: 8, padding: "6px 10px", color: "#00a884", fontSize: 13, textAlign: "center", cursor: "pointer" }}>{b}</div>
                      ))}
                    </div>
                  )}
                  <div style={{ color: "#8696a0", fontSize: 10, textAlign: "left", marginTop: 3 }}>{msg.time}</div>
                </div>
              </div>
            ))}

            {typing && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
                <div style={{ background: "#005c4b", borderRadius: "12px 0 12px 12px", padding: "10px 14px", display: "flex", gap: 4, alignItems: "center" }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#8696a0", animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div style={{ background: "#1f2c34", padding: "8px 10px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{ flex: 1, background: "#2a3942", borderRadius: 24, padding: "8px 14px", color: "#8696a0", fontSize: 13 }}>رسالة</div>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#00a884", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🎤</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes bounce { 0%,60%,100% { transform:translateY(0); } 30% { transform:translateY(-4px); } }
      `}</style>
    </div>
  );
}
