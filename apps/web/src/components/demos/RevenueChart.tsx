import { useEffect, useState } from "react";

const GOLD = "#c9a84c";
const NAVY = "#0f2347";

const MONTHS = ["أكتوبر","نوفمبر","ديسمبر","يناير","فبراير","مارس"];
const BEFORE  = [3200, 3100, 2900, 3400, 3200, 3300]; // before موعدك
const AFTER   = [3200, 4100, 5800, 7200, 8900, 11400]; // after موعدك

const W = 460, H = 180, PAD = { top:16, right:16, bottom:32, left:52 };
const CHART_W = W - PAD.left - PAD.right;
const CHART_H = H - PAD.top - PAD.bottom;
const MAX_VAL = 12000;

function toX(i: number) { return PAD.left + (i / (MONTHS.length - 1)) * CHART_W; }
function toY(v: number) { return PAD.top + CHART_H - (v / MAX_VAL) * CHART_H; }

function buildPath(data: number[]) {
  return data.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(v)}`).join(" ");
}

function buildArea(data: number[]) {
  const line = buildPath(data);
  return `${line} L${toX(data.length-1)},${PAD.top+CHART_H} L${PAD.left},${PAD.top+CHART_H} Z`;
}

export default function RevenueChart() {
  const [progress, setProgress] = useState(0); // 0→1 animation
  const [showTooltip, setShowTooltip] = useState<number|null>(null);

  useEffect(() => {
    let frame = 0;
    const frames = 80;
    const iv = setInterval(() => {
      frame++;
      setProgress(Math.min(frame / frames, 1));
      if (frame >= frames) clearInterval(iv);
    }, 18);
    return () => clearInterval(iv);
  }, []);

  // Interpolate data based on progress
  function interp(data: number[]) {
    return data.map((v, i) => {
      const segStart = i / (data.length - 1);
      const segEnd = (i + 1) / (data.length - 1);
      if (progress <= segStart) return data[0];
      if (progress >= segEnd || i === data.length - 1) return v;
      const t = (progress - segStart) / (segEnd - segStart);
      return data[i - 1] + (v - data[i - 1]) * t;
    });
  }

  const beforeInterp = interp(BEFORE);
  const afterInterp  = interp(AFTER);

  const lastAfter = afterInterp[MONTHS.length - 1];
  const lastBefore = beforeInterp[MONTHS.length - 1];
  const growth = Math.round(((lastAfter - lastBefore) / lastBefore) * 100);

  return (
    <div style={{ background:"#06101f", borderRadius:20, overflow:"hidden", border:`1px solid ${GOLD}22`, fontFamily:"sans-serif", maxWidth:520, width:"100%" }} dir="rtl">
      {/* Header */}
      <div style={{ background:NAVY, padding:"14px 20px", borderBottom:`1px solid ${GOLD}22`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ color:"#fff", fontWeight:700, fontSize:15 }}>نمو الإيرادات</div>
          <div style={{ color:"#64748b", fontSize:12, marginTop:2 }}>قبل وبعد موعدك</div>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ color:"#22c55e", fontWeight:900, fontSize:22 }}>+{growth}%</div>
          <div style={{ color:"#475569", fontSize:11 }}>نمو في 6 أشهر</div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ padding:"16px 16px 8px", overflowX:"auto" }}>
        <svg width={W} height={H} style={{ display:"block", margin:"0 auto" }}>
          <defs>
            <linearGradient id="afterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={GOLD} stopOpacity="0.3" />
              <stop offset="100%" stopColor={GOLD} stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="beforeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#64748b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#64748b" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 3000, 6000, 9000, 12000].map(v => (
            <g key={v}>
              <line x1={PAD.left} y1={toY(v)} x2={W - PAD.right} y2={toY(v)} stroke="#ffffff08" strokeWidth={1} />
              <text x={PAD.left - 6} y={toY(v) + 4} fill="#475569" fontSize={9} textAnchor="end">
                {v >= 1000 ? `${v/1000}k` : v}
              </text>
            </g>
          ))}

          {/* Before area + line */}
          <path d={buildArea(beforeInterp)} fill="url(#beforeGrad)" />
          <path d={buildPath(beforeInterp)} fill="none" stroke="#475569" strokeWidth={2} strokeDasharray="5 3" />

          {/* After area + line */}
          <path d={buildArea(afterInterp)} fill="url(#afterGrad)" />
          <path d={buildPath(afterInterp)} fill="none" stroke={GOLD} strokeWidth={2.5} />

          {/* Dots */}
          {afterInterp.map((v, i) => (
            <circle key={i} cx={toX(i)} cy={toY(v)} r={showTooltip===i ? 6 : 4}
              fill={GOLD} stroke="#06101f" strokeWidth={2}
              style={{ cursor:"pointer", transition:"r .15s" }}
              onMouseEnter={() => setShowTooltip(i)}
              onMouseLeave={() => setShowTooltip(null)}
            />
          ))}

          {/* Tooltip */}
          {showTooltip !== null && (
            <g>
              <rect x={toX(showTooltip)-38} y={toY(afterInterp[showTooltip])-42} width={76} height={34} rx={6} fill="#0f2347" stroke={`${GOLD}44`} strokeWidth={1} />
              <text x={toX(showTooltip)} y={toY(afterInterp[showTooltip])-24} fill={GOLD} fontSize={11} textAnchor="middle" fontWeight="bold">
                {Math.round(afterInterp[showTooltip]).toLocaleString()} ر.س
              </text>
              <text x={toX(showTooltip)} y={toY(afterInterp[showTooltip])-12} fill="#94a3b8" fontSize={9} textAnchor="middle">
                {MONTHS[showTooltip]}
              </text>
            </g>
          )}

          {/* X labels */}
          {MONTHS.map((m, i) => (
            <text key={i} x={toX(i)} y={H - 4} fill="#475569" fontSize={9} textAnchor="middle">{m}</text>
          ))}

          {/* موعدك start marker */}
          <line x1={toX(1)} y1={PAD.top} x2={toX(1)} y2={H - PAD.bottom} stroke={`${GOLD}44`} strokeWidth={1} strokeDasharray="4 3" />
          <text x={toX(1)+4} y={PAD.top+10} fill={GOLD} fontSize={9}>بدء موعدك ←</text>
        </svg>
      </div>

      {/* Legend */}
      <div style={{ padding:"0 20px 16px", display:"flex", gap:24, justifyContent:"center" }}>
        {[{ color:GOLD, label:"بعد موعدك", dash:false }, { color:"#475569", label:"قبل موعدك", dash:true }].map(l => (
          <div key={l.label} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <svg width={20} height={8}>
              <line x1={0} y1={4} x2={20} y2={4} stroke={l.color} strokeWidth={2} strokeDasharray={l.dash?"4 3":undefined} />
            </svg>
            <span style={{ color:"#64748b", fontSize:11 }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
