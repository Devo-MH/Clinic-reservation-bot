import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "@/pages/Login";
import DashboardPage from "@/pages/Dashboard";
import AppointmentsPage from "@/pages/Appointments";
import DoctorsPage from "@/pages/Doctors";
import DoctorDashboardPage from "@/pages/DoctorDashboard";
import SchedulePage from "@/pages/Schedule";
import ServicesPage from "@/pages/Services";
import BillingPage from "@/pages/Billing";
import AdminLoginPage from "@/pages/AdminLogin";
import AdminPanelPage from "@/pages/AdminPanel";
import SellerLoginPage from "@/pages/SellerLogin";
import SellerDashboardPage from "@/pages/SellerDashboard";

function AdminRoute({ children }: { children: React.ReactNode }) {
  const secret = sessionStorage.getItem("admin_secret");
  return secret ? <>{children}</> : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminRoute><AdminPanelPage /></AdminRoute>} />

      {/* Seller routes */}
      <Route path="/seller/login" element={<SellerLoginPage />} />
      <Route path="/seller" element={
        sessionStorage.getItem("seller_token")
          ? <SellerDashboardPage />
          : <Navigate to="/seller/login" replace />
      } />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/doctors" element={<DoctorsPage />} />
        <Route path="/doctors/:id" element={<DoctorDashboardPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/billing" element={<BillingPage />} />
      </Route>
    </Routes>
  );
}
