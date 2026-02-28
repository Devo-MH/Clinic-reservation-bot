import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// ── Types ─────────────────────────────────────────────────────────────────────

export type Appointment = {
  id: string;
  scheduledAt: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "NO_SHOW" | "COMPLETED";
  patient: { id: string; phone: string; nameAr?: string; nameEn?: string };
  doctor: { id: string; nameAr: string; nameEn?: string; specialty?: string };
  service?: { id: string; nameAr: string; nameEn?: string; price?: number };
};

export type Doctor = {
  id: string;
  nameAr: string;
  nameEn?: string;
  specialty?: string;
  isActive: boolean;
  schedules: Schedule[];
};

export type Schedule = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart?: string | null;
  breakEnd?: string | null;
  isActive: boolean;
};

export type AnalyticsOverview = {
  total: number;
  confirmed: number;
  cancelled: number;
  thisMonth: number;
  noShows: number;
  limit: number | null;
};

// ── API calls ─────────────────────────────────────────────────────────────────

export const getAppointments = (tenantId: string, params?: Record<string, string>) =>
  api.get<Appointment[]>("/appointments", { params: { tenantId, ...params } }).then((r) => r.data);

export const updateAppointmentStatus = (id: string, status: string) =>
  api.patch<Appointment>(`/appointments/${id}`, { status }).then((r) => r.data);

export const getDoctors = (tenantId: string) =>
  api.get<Doctor[]>("/doctors", { params: { tenantId } }).then((r) => r.data);

export const updateSchedule = (data: {
  doctorId: string;
  dayOfWeek: number;
  isActive: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}) => api.put<Schedule>("/schedule", data).then((r) => r.data);

export const getAnalytics = (tenantId: string) =>
  api.get<AnalyticsOverview>("/analytics/overview", { params: { tenantId } }).then((r) => r.data);

export type DoctorAnalytics = {
  today: number;
  thisMonth: number;
  confirmed: number;
  upcoming: number;
};

export const getDoctorAnalytics = (doctorId: string, tenantId: string) =>
  api.get<DoctorAnalytics>("/analytics/doctor", { params: { doctorId, tenantId } }).then((r) => r.data);
