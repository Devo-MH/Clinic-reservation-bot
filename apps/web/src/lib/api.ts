import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("clinic_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Types ──────────────────────────────────────────────────────────────────────

export type Appointment = {
  id: string;
  scheduledAt: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "NO_SHOW" | "COMPLETED";
  notes?: string;
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

export type Service = {
  id: string;
  nameAr: string;
  nameEn?: string;
  durationMinutes: number;
  price?: number | null;
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

export type DoctorAnalytics = {
  today: number;
  thisMonth: number;
  confirmed: number;
  upcoming: number;
};

export type WeeklyData = { day: string; date: string; count: number };

// ── Auth ────────────────────────────────────────────────────────────────────────

export const login = (clinicCode: string, password: string) =>
  axios.post<{ token: string; tenantId: string; tenantName: string }>("/auth/login", { clinicCode, password }).then((r) => r.data);

// ── Appointments ────────────────────────────────────────────────────────────────

export const getAppointments = (tenantId: string, params?: Record<string, string>) =>
  api.get<Appointment[]>("/appointments", { params: { tenantId, ...params } }).then((r) => r.data);

export const createAppointment = (data: {
  tenantId: string; patientPhone: string; doctorId: string;
  serviceId?: string; scheduledAt: string; notes?: string;
}) => api.post<Appointment>("/appointments", data).then((r) => r.data);

export const updateAppointmentStatus = (id: string, status: string) =>
  api.patch<Appointment>(`/appointments/${id}`, { status }).then((r) => r.data);

// ── Doctors ─────────────────────────────────────────────────────────────────────

export const getDoctors = (tenantId: string) =>
  api.get<Doctor[]>("/doctors", { params: { tenantId } }).then((r) => r.data);

export const createDoctor = (data: { tenantId: string; nameAr: string; nameEn?: string; specialty?: string }) =>
  api.post<Doctor>("/doctors", data).then((r) => r.data);

export const updateDoctor = (id: string, data: { nameAr?: string; nameEn?: string; specialty?: string; isActive?: boolean }) =>
  api.patch<Doctor>(`/doctors/${id}`, data).then((r) => r.data);

// ── Services ────────────────────────────────────────────────────────────────────

export const getServices = (tenantId: string) =>
  api.get<Service[]>("/services", { params: { tenantId } }).then((r) => r.data);

export const createService = (data: { tenantId: string; nameAr: string; nameEn?: string; durationMinutes?: number; price?: number }) =>
  api.post<Service>("/services", data).then((r) => r.data);

export const updateService = (id: string, data: Partial<Service>) =>
  api.patch<Service>(`/services/${id}`, data).then((r) => r.data);

export const deleteService = (id: string) =>
  api.delete(`/services/${id}`).then((r) => r.data);

// ── Schedule ────────────────────────────────────────────────────────────────────

export const updateSchedule = (data: {
  doctorId: string; dayOfWeek: number; isActive: boolean;
  startTime: string; endTime: string; breakStart?: string; breakEnd?: string;
}) => api.put<Schedule>("/schedule", data).then((r) => r.data);

// ── Analytics ───────────────────────────────────────────────────────────────────

export const getAnalytics = (tenantId: string) =>
  api.get<AnalyticsOverview>("/analytics/overview", { params: { tenantId } }).then((r) => r.data);

export const getWeeklyData = (tenantId: string) =>
  api.get<WeeklyData[]>("/analytics/weekly", { params: { tenantId } }).then((r) => r.data);

export const getDoctorAnalytics = (doctorId: string, tenantId: string) =>
  api.get<DoctorAnalytics>("/analytics/doctor", { params: { doctorId, tenantId } }).then((r) => r.data);
