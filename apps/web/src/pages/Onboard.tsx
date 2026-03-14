import { useState } from "react";

export default function OnboardPage() {
  const [form, setForm] = useState({
    name: "", ownerName: "", ownerPhone: "", businessPhone: "",
    country: "GULF" as "GULF" | "EGYPT",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [done, setDone]       = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.ownerName.trim() || !form.ownerPhone.trim() || !form.businessPhone.trim()) {
      setError("يرجى ملء جميع الحقول");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/onboard/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, locale: "AR", businessPhone: form.businessPhone }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "حدث خطأ. يرجى المحاولة مرة أخرى.");
        return;
      }
      setDone(true);
    } catch {
      setError("تعذر الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-teal-900 to-teal-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur mb-3">
            <span className="text-3xl">🏥</span>
          </div>
          <h1 className="text-2xl font-bold text-white">موعدك</h1>
          <p className="text-teal-200 text-sm mt-1">بوت واتساب ذكي لعيادتك</p>
        </div>

        {done ? (
          /* Success */
          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 shadow-xl text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-white mb-2">تم استلام طلبك!</h2>
            <p className="text-teal-200 text-sm leading-relaxed">
              شكراً! سنتواصل معك على رقم واتساب
              <span className="text-white font-semibold"> {form.ownerPhone} </span>
              خلال 24 ساعة لإعداد عيادتك.
            </p>
          </div>
        ) : (
          /* Form */
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-1">سجّل عيادتك</h2>
            <p className="text-teal-200 text-sm mb-5">سنتواصل معك لإعداد البوت خلال 24 ساعة</p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-400/40 text-red-200 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">اسم العيادة</label>
                <input
                  type="text" value={form.name} onChange={e => set("name", e.target.value)}
                  placeholder="مثال: عيادة الدكتور أحمد"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/60 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">اسم صاحب العيادة</label>
                <input
                  type="text" value={form.ownerName} onChange={e => set("ownerName", e.target.value)}
                  placeholder="مثال: د. أحمد المطيري"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/60 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  رقم واتساب البزنس 🏥
                </label>
                <p className="text-teal-300/70 text-xs mb-1.5">الرقم الذي سيستخدمه المرضى للحجز — يجب أن يكون واتساب بزنس</p>
                <input
                  type="tel" value={form.businessPhone} onChange={e => set("businessPhone", e.target.value)}
                  placeholder="966501234567" dir="ltr"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/60 transition-colors text-left"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  رقم واتساب الشخصي 📱
                </label>
                <p className="text-teal-300/70 text-xs mb-1.5">للتواصل معك وإرسال بيانات الدخول</p>
                <input
                  type="tel" value={form.ownerPhone} onChange={e => set("ownerPhone", e.target.value)}
                  placeholder="966501234567" dir="ltr"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/60 transition-colors text-left"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">الدولة</label>
                <div className="flex rounded-lg overflow-hidden border border-white/20">
                  {(["GULF", "EGYPT"] as const).map(c => (
                    <button key={c} type="button" onClick={() => set("country", c)}
                      className={`flex-1 py-2.5 text-sm font-medium transition-colors ${form.country === c ? "bg-white text-teal-900" : "text-white/70 hover:text-white hover:bg-white/10"}`}>
                      {c === "GULF" ? "🌍 الخليج" : "🇪🇬 مصر"}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-lg bg-white text-teal-900 font-bold hover:bg-teal-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2">
                {loading ? "جاري الإرسال..." : "أرسل الطلب ←"}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-white/40 text-xs mt-6">موعدك · بدعم من Meta Cloud API</p>
      </div>
    </div>
  );
}
