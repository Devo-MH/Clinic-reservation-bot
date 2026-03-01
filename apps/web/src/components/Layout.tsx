import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, CalendarDays, Users, Clock,
  Stethoscope, LogOut, ChevronLeft, Layers, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard",    icon: LayoutDashboard, label: "لوحة التحكم" },
  { to: "/appointments", icon: CalendarDays,    label: "المواعيد" },
  { to: "/doctors",      icon: Users,           label: "الأطباء" },
  { to: "/services",     icon: Layers,          label: "الخدمات" },
  { to: "/schedule",     icon: Clock,           label: "الجداول" },
];

// ── Sidebar content (shared between desktop sidebar and mobile drawer) ─────────

function SidebarContent({ onNav }: { onNav?: () => void }) {
  const navigate = useNavigate();
  const clinicName = localStorage.getItem("clinic_name") ?? "العيادة";

  const handleLogout = () => {
    localStorage.removeItem("clinic_token");
    localStorage.removeItem("clinic_tenant_id");
    localStorage.removeItem("clinic_name");
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-full">
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
            onClick={onNav}
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
                <Icon className={cn(
                  "w-4 h-4 flex-shrink-0 transition-colors",
                  isActive ? "text-white" : "text-white/45 group-hover:text-white/70"
                )} />
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
    </div>
  );
}

// ── Main Layout ────────────────────────────────────────────────────────────────

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const currentPage = NAV.find(n => location.pathname.startsWith(n.to))?.label ?? "ClinicBot";

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* ── Desktop sidebar (hidden on mobile) ───────────────────────── */}
      <aside
        className="hidden md:flex w-64 flex-shrink-0 flex-col"
        style={{ backgroundColor: "hsl(var(--sidebar))" }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile drawer overlay ─────────────────────────────────────── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer panel — slides in from right (RTL) */}
          <div
            className="relative mr-auto w-72 h-full flex flex-col shadow-2xl"
            style={{ backgroundColor: "hsl(var(--sidebar))" }}
          >
            {/* Close button */}
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute top-4 left-4 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent onNav={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Main content area ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile top header */}
        <header
          className="md:hidden flex items-center justify-between px-4 h-14 flex-shrink-0 shadow-sm"
          style={{ backgroundColor: "hsl(var(--sidebar))" }}
        >
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-white font-semibold text-sm">{currentPage}</span>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background pb-16 md:pb-0">
          <Outlet />
        </main>

        {/* ── Mobile bottom nav ─────────────────────────────────────── */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-background border-t border-border flex">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className={cn(
                    "w-8 h-6 rounded-full flex items-center justify-center transition-colors",
                    isActive ? "bg-primary/10" : ""
                  )}>
                    <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
