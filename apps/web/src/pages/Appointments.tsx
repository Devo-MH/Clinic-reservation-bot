import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAppointments, updateAppointmentStatus } from "@/lib/api";
import { TENANT_ID, STATUS_COLORS, STATUS_LABELS } from "@/lib/utils";
import { format } from "date-fns";
import { Search, CheckCircle, XCircle, Clock } from "lucide-react";

const STATUSES = ["", "CONFIRMED", "PENDING", "CANCELLED", "NO_SHOW", "COMPLETED"];

type ActionButton = {
  label: string;
  status: string;
  icon: React.ReactNode;
  className: string;
};

function getActions(currentStatus: string): ActionButton[] {
  const actions: ActionButton[] = [];
  if (currentStatus === "PENDING" || currentStatus === "CONFIRMED") {
    actions.push({
      label: "مكتمل",
      status: "COMPLETED",
      icon: <CheckCircle size={14} />,
      className: "text-blue-600 hover:bg-blue-50",
    });
    actions.push({
      label: "لم يحضر",
      status: "NO_SHOW",
      icon: <Clock size={14} />,
      className: "text-gray-500 hover:bg-gray-50",
    });
    actions.push({
      label: "إلغاء",
      status: "CANCELLED",
      icon: <XCircle size={14} />,
      className: "text-red-500 hover:bg-red-50",
    });
  }
  return actions;
}

export default function AppointmentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const queryClient = useQueryClient();

  const queryParams: Record<string, string> = {};
  if (statusFilter) queryParams.status = statusFilter;
  if (dateFilter) queryParams.date = dateFilter;

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["appointments", TENANT_ID, statusFilter, dateFilter],
    queryFn: () => getAppointments(TENANT_ID, queryParams),
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateAppointmentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  const filtered = appointments?.filter((a) => {
    if (!search) return true;
    const name = a.patient.nameAr ?? a.patient.phone;
    return name.includes(search) || a.doctor.nameAr.includes(search);
  });

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">المواعيد</h2>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pr-9 pl-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="بحث بالاسم أو الطبيب..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <input
          type="date"
          className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />

        <select
          className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">كل الحالات</option>
          {STATUSES.slice(1).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>

        {(dateFilter || statusFilter || search) && (
          <button
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100"
            onClick={() => { setDateFilter(""); setStatusFilter(""); setSearch(""); }}
          >
            مسح الفلاتر
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["المريض", "الطبيب", "الخدمة", "التاريخ", "الوقت", "الحالة", "إجراء"].map((h) => (
                <th key={h} className="px-4 py-3 text-right font-medium text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">جاري التحميل...</td>
              </tr>
            ) : !filtered?.length ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">لا توجد مواعيد</td>
              </tr>
            ) : (
              filtered.map((appt) => (
                <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    {appt.patient.nameAr ?? appt.patient.phone}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{appt.doctor.nameAr}</td>
                  <td className="px-4 py-3 text-gray-600">{appt.service?.nameAr ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {format(new Date(appt.scheduledAt), "dd/MM/yyyy")}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {format(new Date(appt.scheduledAt), "HH:mm")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[appt.status]}`}>
                      {STATUS_LABELS[appt.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {getActions(appt.status).map((action) => (
                        <button
                          key={action.status}
                          onClick={() => mutation.mutate({ id: appt.id, status: action.status })}
                          disabled={mutation.isPending}
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${action.className}`}
                          title={action.label}
                        >
                          {action.icon}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
