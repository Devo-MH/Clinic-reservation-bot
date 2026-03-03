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

// ── Billing ──────────────────────────────────────────────────────────────────

export type BillingBundle = { credits: number; prices: Record<string, number> };

export type PaymentRecord = {
  id: string;
  bundle: string;
  credits: number;
  amount: number;
  currency: string;
  gateway: string;
  status: string;
  createdAt: string;
};

export type BillingBalance = {
  credits: number;
  country: string;
  currency: string;
  bundles: Record<string, BillingBundle>;
  payments: PaymentRecord[];
};

export const getBillingBalance = (tenantId: string) =>
  axios.get<BillingBalance>("/billing/balance", { params: { tenantId } }).then((r) => r.data);

export const createCheckout = (tenantId: string, bundleId: string, currency: string) =>
  axios.post<{ paymentId: string; redirectUrl: string }>("/billing/checkout", { tenantId, bundleId, currency }).then((r) => r.data);

// ── Admin ─────────────────────────────────────────────────────────────────────

function adminApi(secret: string) {
  return axios.create({
    baseURL: "/admin",
    headers: { "Content-Type": "application/json", "x-admin-secret": secret },
  });
}

export type AdminTenant = {
  id: string;
  name: string;
  clinicCode: string | null;
  country: string;
  locale: string;
  isActive: boolean;
  credits: number;
  ownerPhone: string | null;
  phoneNumberId: string;
  createdAt: string;
  _count: { appointments: number; patients: number; doctors: number };
};

export type AdminStats = { tenantCount: number; appointmentCount: number; patientCount: number };

export const getAdminStats = (secret: string) =>
  adminApi(secret).get<AdminStats>("/stats").then((r) => r.data);

export const getAdminTenants = (secret: string) =>
  adminApi(secret).get<AdminTenant[]>("/tenants").then((r) => r.data);

export const createAdminTenant = (secret: string, data: {
  name: string; clinicCode: string; dashboardPassword: string;
  phoneNumberId: string; wabaId: string; accessToken: string;
  ownerPhone?: string; locale?: string; country?: string; timezone?: string; credits?: number; sellerId?: string;
}) => adminApi(secret).post<{ id: string; name: string; clinicCode: string }>("/tenants", data).then((r) => r.data);

export const updateAdminTenant = (secret: string, id: string, data: {
  credits?: number; isActive?: boolean; name?: string; dashboardPassword?: string;
}) => adminApi(secret).patch(`/tenants/${id}`, data).then((r) => r.data);

export const deleteAdminTenant = (secret: string, id: string) =>
  adminApi(secret).delete(`/tenants/${id}`).then((r) => r.data);

export type AdminSeller = {
  id: string; name: string; phone: string; referralCode: string;
  commissionRate: number; isActive: boolean; createdAt: string;
  tenantCount: number; totalEarned: number; pendingPayout: number;
};

export const getAdminSellers = (secret: string) =>
  adminApi(secret).get<AdminSeller[]>("/sellers").then((r) => r.data);

export const createAdminSeller = (secret: string, data: {
  name: string; phone: string; referralCode: string; password: string; commissionRate?: number;
}) => adminApi(secret).post<{ id: string; name: string; referralCode: string }>("/sellers", data).then((r) => r.data);

export const updateAdminSeller = (secret: string, id: string, data: {
  isActive?: boolean; commissionRate?: number; name?: string; password?: string;
}) => adminApi(secret).patch(`/sellers/${id}`, data).then((r) => r.data);

export const payAllCommissions = (secret: string, sellerId: string) =>
  adminApi(secret).patch(`/sellers/${sellerId}/pay-all`, {}).then((r) => r.data);

// ── Seller (affiliate) ────────────────────────────────────────────────────────

export type SellerDashboardData = {
  seller: { id: string; name: string; referralCode: string; commissionRate: number };
  stats: { tenantCount: number; totalEarned: number; pendingPayout: number };
  tenants: { id: string; name: string; clinicCode: string | null; country: string; isActive: boolean; createdAt: string; _count: { appointments: number } }[];
  commissions: {
    id: string; tenantName: string; bundle: string; paymentAmount: number;
    commissionAmount: number; currency: string; status: string; createdAt: string;
  }[];
};

export const sellerLogin = (referralCode: string, password: string) =>
  axios.post<{ token: string; sellerId: string; sellerName: string; referralCode: string }>(
    "/seller/login", { referralCode, password }
  ).then((r) => r.data);

export const getSellerDashboard = (token: string) =>
  axios.get<SellerDashboardData>("/seller/dashboard", {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.data);
