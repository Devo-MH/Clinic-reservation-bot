import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import DashboardPage from "@/pages/Dashboard";
import AppointmentsPage from "@/pages/Appointments";
import DoctorsPage from "@/pages/Doctors";
import DoctorDashboardPage from "@/pages/DoctorDashboard";
import SchedulePage from "@/pages/Schedule";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/doctors" element={<DoctorsPage />} />
        <Route path="/doctors/:id" element={<DoctorDashboardPage />} />
      </Route>
    </Routes>
  );
}
