import { useParams, Link } from "react-router";
import { ArrowLeft, Mail, Phone, Calendar, Briefcase, DollarSign, FileText, Edit } from "lucide-react";
import { useApp } from "../context/AppContext";

export function EmployeeDetail() {
  const { id } = useParams();
  const { t, theme, employees, formatCurrency } = useApp();
  const isDark = theme === "dark";
  const employee = employees.find((e) => e.id === id);
  const cardBg = isDark ? "#1F2937" : "#ffffff";
  const borderColor = isDark ? "#374151" : "#F3F4F6";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const textMuted = isDark ? "#6B7280" : "#9CA3AF";
  const subtleBg = isDark ? "#374151" : "#F9FAFB";

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h3 style={{ fontSize: 18, fontWeight: 600, color: textPrimary }}>{t("empDetail.notFound")}</h3>
        <Link to="/employees" className="text-[var(--acc-primary-strong)] mt-2" style={{ fontSize: 14 }}>{t("empDetail.backToEmployees")}</Link>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    active: isDark ? "bg-[#064E3B] text-[#34D399]" : "bg-[#D1FAE5] text-[#059669]",
    "on-leave": isDark ? "bg-[#78350F] text-[#FBBF24]" : "bg-[#FEF3C7] text-[#D97706]",
    probation: isDark ? "bg-[#1E3A5F] text-[#60A5FA]" : "bg-[#DBEAFE] text-[var(--acc-primary-strong)]",
    terminated: isDark ? "bg-[#7F1D1D] text-[#F87171]" : "bg-[#FEE2E2] text-[#DC2626]",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/employees" className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ color: textSecondary }}>
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: textPrimary }}>{t("empDetail.profile")}</h2>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: cardBg, borderColor }}>
        <div className="h-32 bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-soft)]" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <div className="w-24 h-24 rounded-2xl border-4 shadow-lg flex items-center justify-center bg-gradient-to-br from-[var(--acc-primary-strong)] to-[#EC4899] text-white" style={{ fontSize: 28, fontWeight: 700, borderColor: cardBg }}>
              {employee.firstName[0]}{employee.lastName[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 style={{ fontSize: 22, fontWeight: 700, color: textPrimary }}>{employee.firstName} {employee.lastName}</h3>
                <span className={`${statusColors[employee.status]} px-2.5 py-1 rounded-md`} style={{ fontSize: 12, fontWeight: 600 }}>
                  {employee.status.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              </div>
              <p style={{ fontSize: 14, color: textSecondary }}>{employee.position} · {employee.department}</p>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors" style={{ fontSize: 13, fontWeight: 500, backgroundColor: isDark ? "var(--acc-tint-dark)" : "var(--acc-tint-light)", color: "var(--acc-primary-strong)" }}>
              <Edit className="w-4 h-4" /> {t("empDetail.editProfile")}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border p-6" style={{ backgroundColor: cardBg, borderColor }}>
            <h4 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }} className="mb-4">{t("empDetail.personalInfo")}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: t("empDetail.employeeCode"), value: employee.code },
                { label: t("empDetail.email"), value: employee.email, icon: Mail },
                { label: t("empDetail.phone"), value: employee.phone, icon: Phone },
                { label: t("emp.department"), value: employee.department, icon: Briefcase },
                { label: t("emp.position"), value: employee.position },
                { label: t("empDetail.employmentType"), value: employee.employmentType },
                { label: t("emp.hireDate"), value: employee.hireDate, icon: Calendar },
                { label: t("empDetail.reportsTo"), value: employee.reportsTo || "N/A" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  {item.icon ? <item.icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: textMuted }} /> : <div className="w-4" />}
                  <div>
                    <div style={{ fontSize: 12, color: textMuted }}>{item.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: textPrimary }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border p-6" style={{ backgroundColor: cardBg, borderColor }}>
            <h4 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }} className="mb-4">{t("empDetail.compensation")}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: t("empDetail.basicSalary"), value: formatCurrency(employee.salary), color: textPrimary },
                { label: t("empDetail.allowances"), value: formatCurrency(employee.salary * 0.1), color: "#10B981" },
                { label: t("empDetail.netSalary"), value: formatCurrency(Math.round(employee.salary * 0.946)), color: "var(--acc-primary-strong)" },
              ].map((item) => (
                <div key={item.label} className="rounded-lg p-4" style={{ backgroundColor: subtleBg }}>
                  <div style={{ fontSize: 12, color: textMuted }}>{item.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: item.color }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border p-6" style={{ backgroundColor: cardBg, borderColor }}>
            <h4 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }} className="mb-4">{t("empDetail.quickActions")}</h4>
            <div className="space-y-2">
              {[
                { label: t("empDetail.genWorkCert"), icon: FileText, color: "var(--acc-primary-strong)" },
                { label: t("empDetail.genSalaryCert"), icon: FileText, color: "var(--acc-primary-soft)" },
                { label: t("empDetail.viewPayslips"), icon: DollarSign, color: "#10B981" },
                { label: t("empDetail.viewAttendance"), icon: Calendar, color: "#F59E0B" },
              ].map((action) => (
                <button key={action.label} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left" style={{ color: textPrimary }}>
                  <action.icon className="w-4 h-4" style={{ color: action.color }} />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border p-6" style={{ backgroundColor: cardBg, borderColor }}>
            <h4 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }} className="mb-4">{t("empDetail.leaveBalance")}</h4>
            <div className="space-y-3">
              {[
                { type: t("empDetail.annualLeave"), used: 5, total: 30, color: "var(--acc-primary-strong)" },
                { type: t("empDetail.sickLeave"), used: 2, total: 15, color: "#F59E0B" },
                { type: t("empDetail.unpaidLeave"), used: 0, total: 10, color: "#9CA3AF" },
              ].map((leave) => (
                <div key={leave.type}>
                  <div className="flex justify-between mb-1">
                    <span style={{ fontSize: 12, color: textSecondary }}>{leave.type}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: textPrimary }}>{leave.used}/{leave.total}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? "#374151" : "#F3F4F6" }}>
                    <div className="h-full rounded-full" style={{ width: `${(leave.used / leave.total) * 100}%`, backgroundColor: leave.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}