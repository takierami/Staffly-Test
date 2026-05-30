import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Users, Clock, CalendarDays, Briefcase, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { Link } from "react-router";

export function Dashboard() {
  const { t, theme, employees, leaveRequests, attendanceRecords, jobPostings, recentActivities } = useApp();
  const isDark = theme === "dark";
  const cardBg = isDark ? "#1F2937" : "#ffffff";
  const borderColor = isDark ? "#374151" : "#F3F4F6";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const textMuted = isDark ? "#6B7280" : "#9CA3AF";
  const subtleBg = isDark ? "#374151" : "#F9FAFB";

  const departmentData = useMemo(() => {
    const deptColors: Record<string, string> = { Engineering: "var(--acc-primary-strong)", HR: "var(--acc-primary-soft)", Marketing: "#EC4899", Finance: "#10B981", Operations: "#F59E0B", Design: "#EF4444", Sales: "#06B6D4", Product: "#8B5CF6" };
    const counts: Record<string, number> = {};
    employees.forEach((e) => { counts[e.department] = (counts[e.department] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value, fill: deptColors[name] || "#6B7280" }));
  }, [employees]);

  const attendanceWeek = [
    { day: "Mon", present: 9, absent: 1 },
    { day: "Tue", present: 10, absent: 0 },
    { day: "Wed", present: 8, absent: 2 },
    { day: "Thu", present: 9, absent: 1 },
    { day: "Fri", present: 7, absent: 3 },
  ];

  const payrollTrend = [
    { month: "Oct", amount: 1100000 },
    { month: "Nov", amount: 1150000 },
    { month: "Dec", amount: 1200000 },
    { month: "Jan", amount: 1180000 },
    { month: "Feb", amount: 1220000 },
    { month: "Mar", amount: 1250000 },
  ];

  const presentToday = attendanceRecords.filter((r) => r.status === "present" || r.status === "late").length;
  const openPositions = jobPostings.filter((j) => j.status === "open").length;

  const stats = [
    { label: t("dash.totalEmployees"), value: employees.length, icon: Users, trend: `${employees.length}`, up: true, color: "var(--acc-primary-strong)", bg: isDark ? "var(--acc-tint-dark)" : "var(--acc-tint-light)" },
    { label: t("dash.presentToday"), value: presentToday, icon: Clock, trend: employees.length > 0 ? `${Math.round(presentToday / employees.length * 100)}%` : "0%", up: true, color: "#10B981", bg: isDark ? "#064E3B" : "#D1FAE5" },
    { label: t("dash.pendingLeaves"), value: leaveRequests.filter((l) => l.status === "pending").length, icon: CalendarDays, trend: `${leaveRequests.filter((l) => l.status === "pending").length}`, up: false, color: "#F59E0B", bg: isDark ? "#78350F" : "#FEF3C7" },
    { label: t("dash.openPositions"), value: openPositions, icon: Briefcase, trend: `${openPositions}`, up: true, color: "var(--acc-primary-soft)", bg: isDark ? "var(--acc-tint-dark)" : "var(--acc-tint-light)" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-soft)] rounded-2xl p-6 lg:p-8 text-white">
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>{t("dash.greeting")}</h2>
        <p className="text-white/80 mt-1" style={{ fontSize: 14 }}>{t("dash.subtitle")}</p>
        <div className="flex gap-3 mt-4">
          <Link to="/employees" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg transition-all" style={{ fontSize: 13, fontWeight: 500 }}>
            {t("dash.viewEmployees")}
          </Link>
          <Link to="/leaves" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg transition-all" style={{ fontSize: 13, fontWeight: 500 }}>
            {t("dash.reviewLeaves")}
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl p-5 border hover:shadow-md transition-all duration-300 hover:-translate-y-0.5" style={{ backgroundColor: cardBg, borderColor }}>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-md`} style={{ fontSize: 12, fontWeight: 600, backgroundColor: s.up ? (isDark ? "#064E3B" : "#D1FAE5") : (isDark ? "#7F1D1D" : "#FEE2E2"), color: s.up ? "#059669" : "#DC2626" }}>
                {s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {s.trend}
              </div>
            </div>
            <div className="mt-3">
              <div style={{ fontSize: 28, fontWeight: 700, color: textPrimary }}>{s.value}</div>
              <div style={{ fontSize: 13, color: textSecondary }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl p-5 border" style={{ backgroundColor: cardBg, borderColor }}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }}>{t("dash.weeklyAttendance")}</h3>
            <span style={{ fontSize: 12, color: textSecondary }}>{t("dash.thisWeek")}</span>
          </div>
          <div style={{ height: 240 }}>
            <svg width="100%" height="100%" viewBox="0 0 500 240" preserveAspectRatio="xMidYMid meet">
              {/* Y axis labels */}
              {[0, 2, 4, 6, 8, 10].map((v) => (
                <text key={`y-${v}`} x="25" y={220 - v * 20} fill={textSecondary} fontSize="11" textAnchor="end" dominantBaseline="middle">{v}</text>
              ))}
              {/* Bars */}
              {attendanceWeek.map((d, i) => {
                const x = 60 + i * 90;
                const barW = 30;
                return (
                  <g key={d.day}>
                    <rect x={x} y={220 - d.present * 20} width={barW} height={d.present * 20} fill="var(--acc-primary-strong)" rx="6" ry="6" />
                    <rect x={x + barW + 4} y={220 - d.absent * 20} width={barW} height={d.absent * 20} fill="#FCA5A5" rx="6" ry="6" />
                    <text x={x + barW + 2} y={235} fill={textSecondary} fontSize="11" textAnchor="middle">{d.day}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div className="rounded-xl p-5 border" style={{ backgroundColor: cardBg, borderColor }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }} className="mb-4">{t("dash.byDepartment")}</h3>
          <div className="flex items-center justify-center" style={{ height: 200 }}>
            <svg width="160" height="160" viewBox="0 0 160 160">
              {(() => {
                const total = departmentData.reduce((sum, d) => sum + d.value, 0);
                const radius = 70;
                const innerRadius = 45;
                const cx = 80;
                const cy = 80;
                let cumulative = 0;
                return departmentData.map((d) => {
                  const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
                  cumulative += d.value;
                  const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
                  const largeArc = d.value / total > 0.5 ? 1 : 0;
                  const gap = 0.02;
                  const sA = startAngle + gap;
                  const eA = endAngle - gap;
                  const x1 = cx + radius * Math.cos(sA);
                  const y1 = cy + radius * Math.sin(sA);
                  const x2 = cx + radius * Math.cos(eA);
                  const y2 = cy + radius * Math.sin(eA);
                  const x3 = cx + innerRadius * Math.cos(eA);
                  const y3 = cy + innerRadius * Math.sin(eA);
                  const x4 = cx + innerRadius * Math.cos(sA);
                  const y4 = cy + innerRadius * Math.sin(sA);
                  return (
                    <path
                      key={d.name}
                      d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`}
                      fill={d.fill}
                    />
                  );
                });
              })()}
            </svg>
          </div>
        </div>
      </div>

      {/* Payroll & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl p-5 border" style={{ backgroundColor: cardBg, borderColor }}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }}>{t("dash.payrollTrend")}</h3>
            <span style={{ fontSize: 12, color: textSecondary }}>{t("dash.last6Months")}</span>
          </div>
          <div style={{ height: 220 }}>
            <svg width="100%" height="100%" viewBox="0 0 500 220" preserveAspectRatio="xMidYMid meet">
              {/* Y axis */}
              {(() => {
                const min = Math.min(...payrollTrend.map((d) => d.amount));
                const max = Math.max(...payrollTrend.map((d) => d.amount));
                const range = max - min || 1;
                const ticks = [min, min + range * 0.25, min + range * 0.5, min + range * 0.75, max];
                return (
                  <>
                    {ticks.map((v, i) => (
                      <text key={`py-${i}`} x="45" y={190 - (i / (ticks.length - 1)) * 170} fill={textSecondary} fontSize="11" textAnchor="end" dominantBaseline="middle">
                        {(v / 1000000).toFixed(1)}M
                      </text>
                    ))}
                    {/* Line */}
                    <polyline
                      fill="none"
                      stroke="var(--acc-primary-strong)"
                      strokeWidth="2.5"
                      points={payrollTrend.map((d, i) => {
                        const x = 70 + i * ((430) / (payrollTrend.length - 1));
                        const y = 190 - ((d.amount - min) / range) * 170;
                        return `${x},${y}`;
                      }).join(" ")}
                    />
                    {/* Dots and labels */}
                    {payrollTrend.map((d, i) => {
                      const x = 70 + i * ((430) / (payrollTrend.length - 1));
                      const y = 190 - ((d.amount - min) / range) * 170;
                      return (
                        <g key={d.month}>
                          <circle cx={x} cy={y} r="4" fill="var(--acc-primary-strong)" />
                          <text x={x} y={210} fill={textSecondary} fontSize="11" textAnchor="middle">{d.month}</text>
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>

        <div className="rounded-xl p-5 border" style={{ backgroundColor: cardBg, borderColor }}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }}>{t("dash.recentActivity")}</h3>
            <button className="text-[var(--acc-primary-strong)] flex items-center gap-1" style={{ fontSize: 13, fontWeight: 500 }}>
              {t("dash.viewAll")} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {recentActivities.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-start gap-3 py-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: isDark ? "#374151" : "#F3F4F6" }}>
                  <div className="w-2 h-2 rounded-full bg-[var(--acc-primary-strong)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate" style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{a.action}</div>
                  <div style={{ fontSize: 12, color: textMuted }}>{a.user} · {a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="rounded-xl p-5 border" style={{ backgroundColor: cardBg, borderColor }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }}>{t("dash.pendingApprovals")}</h3>
            <p style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>Click a request to review and process it in the Leave Management module</p>
          </div>
          <Link to="/leaves" className="text-[var(--acc-primary-strong)] flex items-center gap-1" style={{ fontSize: 13, fontWeight: 500 }}>
            {t("dash.viewAll")} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="space-y-3">
          {leaveRequests.filter((l) => l.status === "pending").length === 0 ? (
            <div className="text-center py-8" style={{ color: textMuted, fontSize: 13 }}>
              No pending approvals
            </div>
          ) : (
            leaveRequests.filter((l) => l.status === "pending").map((l) => (
              <Link key={l.id} to="/leaves" className="flex items-center justify-between p-3 rounded-lg hover:opacity-80 transition-opacity cursor-pointer" style={{ backgroundColor: subtleBg, textDecoration: "none" }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--acc-primary)] to-[var(--acc-primary-soft)] flex items-center justify-center text-white" style={{ fontSize: 12, fontWeight: 600 }}>
                    {l.employeeName.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{l.employeeName}</div>
                    <div style={{ fontSize: 12, color: textMuted }}>{l.type} · {l.days} days · {l.startDate} → {l.endDate}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md" style={{ fontSize: 11, fontWeight: 600, backgroundColor: isDark ? "#78350F" : "#FEF3C7", color: "#D97706" }}>Pending</span>
                  <ArrowRight className="w-4 h-4" style={{ color: textSecondary }} />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}