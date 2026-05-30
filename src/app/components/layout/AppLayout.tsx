import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import stafflyLogo from "@/imports/photo_2026-05-24_18-48-49-removebg-preview__3_.png";
import {
  LayoutDashboard, Users, Clock, CalendarDays, DollarSign,
  TrendingUp, Briefcase, GraduationCap, FileText, Settings,
  Bell, Search, ChevronLeft, Menu, LogOut, Sun, Moon, Languages,
  Award, Layers, Shield,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useAuth, type UserRole } from "../../context/AuthContext";

interface NavItem {
  to: string;
  icon: React.ElementType;
  labelKey: string;
  roles: UserRole[];
}

const ALL_NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", icon: LayoutDashboard, labelKey: "nav.dashboard", roles: ["admin", "hr_manager"] },
  { to: "/dashboard/employees", icon: Users, labelKey: "nav.employees", roles: ["admin", "hr_manager"] },
  { to: "/dashboard/attendance", icon: Clock, labelKey: "nav.attendance", roles: ["admin", "hr_manager"] },
  { to: "/dashboard/leaves", icon: CalendarDays, labelKey: "nav.leaves", roles: ["admin", "hr_manager"] },
  { to: "/dashboard/payroll", icon: DollarSign, labelKey: "nav.payroll", roles: ["admin", "hr_manager"] },
  { to: "/dashboard/performance", icon: TrendingUp, labelKey: "nav.performance", roles: ["admin", "hr_manager"] },
  { to: "/dashboard/promotions", icon: Award, labelKey: "nav.promotions", roles: ["admin", "hr_manager"] },
  { to: "/dashboard/recruitment", icon: Briefcase, labelKey: "nav.recruitment", roles: ["admin", "hr_manager"] },
  { to: "/dashboard/training", icon: GraduationCap, labelKey: "nav.training", roles: ["admin", "hr_manager"] },
  { to: "/dashboard/documents", icon: FileText, labelKey: "nav.documents", roles: ["admin", "hr_manager"] },
  { to: "/dashboard/customization", icon: Layers, labelKey: "nav.customization", roles: ["admin"] },
  { to: "/dashboard/settings", icon: Settings, labelKey: "nav.settings", roles: ["admin", "hr_manager"] },
  { to: "/dashboard/admin-privilege", icon: Shield, labelKey: "nav.adminPrivilege", roles: ["admin"] },
];

export function AppLayout() {
  const { t, lang, setLang, theme, toggleTheme, isRTL, appearance, setAppearance } = useApp();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(appearance.sidebar === "collapsed");
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const role = currentUser?.role ?? "hr_manager";
  const navItems = ALL_NAV_ITEMS.filter((item) => item.roles.includes(role));

  useEffect(() => {
    setCollapsed(appearance.sidebar === "collapsed");
  }, [appearance.sidebar]);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    setAppearance({ ...appearance, sidebar: next ? "collapsed" : "expanded" });
  };

  const currentPage = navItems.find(
    (item) => item.to === "/dashboard" ? location.pathname === "/dashboard" : location.pathname.startsWith(item.to)
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = lang === "ar" ? (currentUser?.nameAr || currentUser?.name) : currentUser?.name;
  const roleLabel = role === "admin" ? (isRTL ? "مسؤول" : "Admin") : (isRTL ? "مدير HR" : "HR Manager");

  return (
    <div className={`flex h-screen overflow-hidden bg-[var(--background)] transition-colors duration-300 ${isRTL ? "flex-row-reverse" : ""}`}>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 z-50
          flex flex-col border-[var(--sidebar-border)] transition-all duration-300 ease-in-out
          ${isRTL ? "right-0 border-l" : "left-0 border-r"}
          ${collapsed ? "w-[72px]" : "w-[260px]"}
          ${mobileOpen ? "translate-x-0" : isRTL ? "translate-x-full lg:translate-x-0" : "-translate-x-full lg:translate-x-0"}
          bg-[var(--sidebar)] text-[var(--sidebar-foreground)]
        `}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-5 h-16 border-b border-[var(--sidebar-border)] ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #050816, #0d1f3c)" }}>
            <ImageWithFallback src={stafflyLogo} alt="Staffly AI" className="w-8 h-8 object-contain" />
          </div>
          {!collapsed && (
            <span style={{ fontWeight: 700, fontSize: 18 }}>Staffly AI</span>
          )}
          <button
            onClick={toggleCollapsed}
            className={`hidden lg:flex items-center justify-center w-6 h-6 rounded hover:bg-[var(--sidebar-accent)] ${isRTL ? "mr-auto" : "ml-auto"}`}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? (isRTL ? "" : "rotate-180") : (isRTL ? "rotate-180" : "")}`} />
          </button>
        </div>

        {/* Role badge */}
        {!collapsed && (
          <div className="px-4 py-2.5 border-b border-[var(--sidebar-border)]">
            <span
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{
                background: role === "admin" ? "rgba(239,68,68,0.15)" : "rgba(59,130,246,0.15)",
                color: role === "admin" ? "#EF4444" : "var(--acc-primary)",
              }}
            >
              {role === "admin" && <Shield className="w-3 h-3" />}
              {roleLabel}
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                ${isRTL ? "flex-row-reverse text-right" : ""}
                ${isActive
                  ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-primary)]"
                  : "hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]"
                }
                ${collapsed ? "justify-center" : ""}
                ${item.to === "/admin-privilege" ? "mt-2 border-t border-[var(--sidebar-border)] pt-3" : ""}`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-5 h-5 shrink-0 ${isActive ? "text-[var(--sidebar-primary)]" : ""} ${item.to === "/admin-privilege" ? "text-red-400" : ""}`}
                  />
                  {!collapsed && (
                    <span style={{ fontSize: 14, fontWeight: isActive ? 600 : 400 }}>
                      {item.to === "/admin-privilege" ? (isRTL ? "صلاحية المسؤول" : "Admin Privilege") : t(item.labelKey)}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className={`border-t border-[var(--sidebar-border)] p-3 ${collapsed ? "flex justify-center" : ""}`}>
          <div
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--sidebar-accent)] cursor-pointer ${collapsed ? "px-0 justify-center" : ""} ${isRTL ? "flex-row-reverse" : ""}`}
            onClick={handleLogout}
            title={isRTL ? "تسجيل الخروج" : "Sign out"}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--acc-primary-strong)] to-[#EC4899] flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">{currentUser?.name?.charAt(0) || "U"}</span>
            </div>
            {!collapsed && (
              <div className={`flex-1 min-w-0 ${isRTL ? "text-right" : ""}`}>
                <div className="truncate" style={{ fontSize: 13, fontWeight: 600 }}>{displayName}</div>
                <div className="text-[var(--muted-foreground)] truncate" style={{ fontSize: 12 }}>{currentUser?.email}</div>
              </div>
            )}
            {!collapsed && <LogOut className="w-4 h-4 text-[var(--muted-foreground)]" />}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className={`h-16 bg-[var(--card)] border-b border-[var(--border)] flex items-center justify-between px-4 lg:px-6 shrink-0 ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-[var(--muted-foreground)]">
              <Menu className="w-5 h-5" />
            </button>
            <h1 style={{ fontSize: 20, fontWeight: 600 }} className="text-[var(--foreground)]">
              {currentPage
                ? (currentPage.to === "/admin-privilege" ? (isRTL ? "صلاحية المسؤول" : "Admin Privilege") : t(currentPage.labelKey))
                : t("nav.dashboard")}
            </h1>
          </div>
          <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className={`hidden md:flex items-center gap-2 bg-[var(--muted)] rounded-lg px-3 py-2 w-52 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Search className="w-4 h-4 text-[var(--muted-foreground)]" />
              <input
                placeholder={t("nav.search")}
                className="bg-transparent border-none outline-none text-[var(--foreground)] placeholder-[var(--muted-foreground)] w-full"
                style={{ fontSize: 13 }}
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <Languages className="w-4 h-4" />
              <span style={{ fontSize: 12, fontWeight: 600 }}>{lang === "en" ? "AR" : "EN"}</span>
            </button>
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg hover:bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              {theme === "light" ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
            </button>
            <button className="relative w-9 h-9 rounded-lg hover:bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              <Bell className="w-5 h-5" />
              <span className={`absolute top-1.5 w-2 h-2 bg-[#EF4444] rounded-full ${isRTL ? "left-1.5" : "right-1.5"}`} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6" dir={isRTL ? "rtl" : "ltr"}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
