import { useQuery } from "@tanstack/react-query";
import { getDoctors } from "@/lib/api";
import { TENANT_ID } from "@/lib/utils";
import { UserCircle, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default function DoctorsPage() {
  const navigate = useNavigate();
  const { data: doctors, isLoading } = useQuery({
    queryKey: ["doctors", TENANT_ID],
    queryFn: () => getDoctors(TENANT_ID),
  });

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">الأطباء</h2>

      {isLoading ? (
        <p className="text-gray-400">جاري التحميل...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {doctors?.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start gap-4">
                <div className="bg-brand-50 rounded-full p-3">
                  <UserCircle size={28} className="text-brand-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{doctor.nameAr}</h3>
                  {doctor.specialty && (
                    <p className="text-sm text-gray-500">{doctor.specialty}</p>
                  )}
                  <span
                    className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                      doctor.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {doctor.isActive ? "نشط" : "غير نشط"}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/doctors/${doctor.id}`)}
                  className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors font-medium"
                >
                  <LayoutDashboard size={13} />
                  لوحة الطبيب
                </button>
              </div>

              {doctor.schedules.filter(s => s.isActive).length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2">مواعيد العمل</p>
                  <div className="space-y-1">
                    {doctor.schedules.filter(s => s.isActive).map((s) => (
                      <div key={s.id} className="flex justify-between text-xs text-gray-600">
                        <span>{DAYS_AR[s.dayOfWeek]}</span>
                        <span>{s.startTime} – {s.endTime}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
