import { useState } from "react";

const GOLD = "#c9a84c";
const NAVY = "#0f2347";

export default function ROICalculator() {
  const [appts, setAppts]     = useState(20);
  const [doctors, setDoctors] = useState(3);
  const [wage, setWage]       = useState(25); // SAR/hr

  // Calculations
  const minsPerAppt    = 8;          // avg mins saved per booking (call + manual entry)
  const reminderMins   = 2;          // per reminder
  const noShowRate     = 0.25;       // 25% no-show without reminders
  const noShowReduced  = 0.08;       // 8% with reminders
  const apptValue      = 150;        // SAR avg appointment revenue

  const dailyAppts      = appts * doctors;
  const monthlyAppts    = dailyAppts * 26;

  // Time saved
  const hrsSavedMonth   = Math.round((monthlyAppts * minsPerAppt + monthlyAppts * reminderMins) / 60);
  const moneySavedStaff = Math.round(hrsSavedMonth * wage);

  // No-show recovery
  const noShowSaved     = Math.round(monthlyAppts * (noShowRate - noShowReduced) * apptValue);

  const totalSaved      = moneySavedStaff + noShowSaved;

  function Slider({ label, value, min, max, step, unit, onChange }: {
    label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void;
  }) {
    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ color:"#94a3b8", fontSize:13 }}>{label}</span>
          <span style={{ color:GOLD, fontWeight:700, fontSize:15 }}>{value} {unit}</span>
        </div>
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ width:"100%", accentColor:GOLD, cursor:"pointer" }}
        />
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:3 }}>
          <span style={{ color:"#334155", fontSize:10 }}>{min}</span>
          <span style={{ color:"#334155", fontSize:10 }}>{max}</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background:"#06101f", borderRadius:20, overflow:"hidden", border:`1px solid ${GOLD}22`, fontFamily:"sans-serif", maxWidth:540, width:"100%" }} dir="rtl">
      {/* Header */}
      <div style={{ background:NAVY, padding:"14px 20px", borderBottom:`1px solid ${GOLD}22` }}>
        <div style={{ color:"#fff", fontWeight:700, fontSize:15 }}>حاسبة العائد على الاستثمار</div>
        <div style={{ color:"#64748b", fontSize:12, marginTop:2 }}>اعرف كم ستوفر مع موعدك</div>
      </div>

      <div style={{ padding:"20px" }}>
        {/* Sliders */}
        <Slider label="مواعيد يومياً لكل طبيب"   value={appts}   min={5}  max={50}  step={1}  unit="موعد"  onChange={setAppts} />
        <Slider label="عدد الأطباء"               value={doctors} min={1}  max={20}  step={1}  unit="طبيب"  onChange={setDoctors} />
        <Slider label="أجر الموظف بالساعة"        value={wage}    min={10} max={80}  step={5}  unit="ر.س"   onChange={setWage} />

        {/* Results */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:8 }}>
          {[
            { icon:"⏱️", label:"ساعات موفّرة / شهر",       value:`${hrsSavedMonth} ساعة`,      color:"#60a5fa" },
            { icon:"💰", label:"توفير رواتب / شهر",         value:`${moneySavedStaff.toLocaleString()} ر.س`, color:GOLD },
            { icon:"📅", label:"مواعيد مُسترجعة / شهر",    value:`${Math.round(monthlyAppts*(noShowRate-noShowReduced))} موعد`, color:"#22c55e" },
            { icon:"📈", label:"إيراد إضافي / شهر",        value:`${noShowSaved.toLocaleString()} ر.س`,  color:"#a78bfa" },
          ].map((r, i) => (
            <div key={i} style={{ background:NAVY, borderRadius:12, padding:"14px 12px", border:`1px solid ${r.color}22` }}>
              <div style={{ fontSize:20, marginBottom:6 }}>{r.icon}</div>
              <div style={{ color:r.color, fontWeight:800, fontSize:16 }}>{r.value}</div>
              <div style={{ color:"#475569", fontSize:11, marginTop:3 }}>{r.label}</div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div style={{ background:`linear-gradient(135deg,${GOLD}22,${GOLD}0a)`, border:`1px solid ${GOLD}44`, borderRadius:14, padding:"18px 20px", marginTop:14, textAlign:"center" }}>
          <div style={{ color:"#94a3b8", fontSize:13, marginBottom:6 }}>إجمالي التوفير الشهري المتوقع</div>
          <div style={{ color:GOLD, fontWeight:900, fontSize:32 }}>{totalSaved.toLocaleString()} ر.س</div>
          <div style={{ color:"#475569", fontSize:11, marginTop:4 }}>= {Math.round(totalSaved/12).toLocaleString()} ر.س / أسبوع</div>
        </div>
      </div>
    </div>
  );
}
