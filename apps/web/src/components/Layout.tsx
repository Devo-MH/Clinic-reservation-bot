import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, CalendarDays, Users, Clock,
  Stethoscope, LogOut, ChevronLeft, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "لوحة التحكم" },
  { to: "/appointments", icon: CalendarDays, label: "المواعيد" },
  { to: "/doctors", icon: Users, label: "الأطباء" },
  { to: "/services", icon: Layers, label: "الخدمات" },
  { to: "/schedule", icon: Clock, label: "الجداول" },
];

export default function Layout() {
  const navigate = useNavigate();
  const clinicName = localStorage.getItem("clinic_name") ?? "العيادة";

  const handleLogout = () => {
    localStorage.removeItem("clinic_token");
    localStorage.removeItem("clinic_tenant_id");
    localStorage.removeItem("clinic_name");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside
        className="w-64 flex-shrink-0 flex flex-col"
        style={{ backgroundColor: "hsl(var(--sidebar))" }}
      >
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm leading-none">ClinicBot</p>
              <p className="text-white/50 text-xs mt-1 truncate">{clinicName}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/55 hover:text-white hover:bg-white/8"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      "w-4 h-4 flex-shrink-0 transition-colors",
                      isActive ? "text-white" : "text-white/45 group-hover:text-white/70"
                    )}
                  />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronLeft className="w-3.5 h-3.5 text-white/35" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/8 transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto bg-background">
        <Outlet />
      </main>
    </div>
  );
}
