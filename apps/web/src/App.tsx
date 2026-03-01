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

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
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
      </Route>
    </Routes>
  );
}
