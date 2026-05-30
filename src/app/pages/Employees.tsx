import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Search, Plus, Mail, Edit, Trash2, Upload } from "lucide-react";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";
import { ImportDialog } from "../components/imports/ImportDialog";
import { type ImportSchema } from "../lib/import-engine";

const employeeSchema: ImportSchema = {
  fields: [
    { key: "firstName", label: "First Name", type: "string", required: true, aliases: ["Given Name"] },
    { key: "lastName", label: "Last Name", type: "string", required: true, aliases: ["Surname", "Family Name"] },
    { key: "email", label: "Email", type: "email", required: true, aliases: ["Email Address"] },
    { key: "department", label: "Department", type: "string", required: true },
    { key: "position", label: "Position", type: "string", required: true, aliases: ["Job Title", "Role"] },
    { key: "code", label: "Employee ID", type: "string", required: true, aliases: ["Emp ID"] },
    { key: "hireDate", label: "Hire Date", type: "date", required: true, aliases: ["Date of Joining", "Joined"] },
    { key: "salary", label: "Salary", type: "number", required: false, aliases: ["Basic Salary"] },
  ]
};
export function Employees() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const navigate = useNavigate();
  const { t, theme, customDepartments: departments, employees: allEmployees, deleteEmployee, addEmployee } = useApp();
  const isDark = theme === "dark";
  const cardBg = isDark ? "#1F2937" : "#ffffff";
  const borderColor = isDark ? "#374151" : "#F3F4F6";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const textMuted = isDark ? "#6B7280" : "#9CA3AF";
  const inputBg = isDark ? "#374151" : "#F9FAFB";

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    active: { bg: isDark ? "bg-[#064E3B]" : "bg-[#D1FAE5]", text: "text-[#059669]", label: t("emp.active") },
    "on-leave": { bg: isDark ? "bg-[#78350F]" : "bg-[#FEF3C7]", text: "text-[#D97706]", label: t("emp.onLeave") },
    probation: { bg: isDark ? "bg-[#1E3A5F]" : "bg-[#DBEAFE]", text: "text-[var(--acc-primary-strong)]", label: t("emp.probation") },
    terminated: { bg: isDark ? "bg-[#7F1D1D]" : "bg-[#FEE2E2]", text: "text-[#DC2626]", label: t("emp.terminated") },
  };

  const filtered = allEmployees.filter((e) => {
    const matchSearch = `${e.firstName} ${e.lastName} ${e.code} ${e.email}`.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "all" || e.department === deptFilter;
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const handleDelete = (id: string) => {
    deleteEmployee(id);
    setDeleteConfirm(null);
    toast.success(t("emp.employee") + " deleted successfully");
  };

  const handleImport = (validData: any[]) => {
    validData.forEach((row, i) => {
      addEmployee({
        id: `EMP${String(Date.now() + i).slice(-6)}`,
        code: row.code || `E${String(Date.now() + i).slice(-4)}`,
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        phone: row.phone || "",
        department: row.department,
        position: row.position,
        grade: row.grade || "G1",
        hireDate: row.hireDate,
        manager: row.manager || "",
        status: "active",
        avatar: "",
        rating: 0
      });
    });
    setIsImportOpen(false);
    toast.success(`Successfully imported ${validData.length} employees`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: textPrimary }}>{t("emp.title")}</h2>
          <p style={{ fontSize: 14, color: textSecondary }}>{allEmployees.length} {t("emp.totalEmployees")}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsImportOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ fontSize: 13, fontWeight: 500, borderColor, color: textPrimary }}>
            <Upload className="w-4 h-4" /> Import
          </button>
          <Link to="/employees/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white rounded-lg hover:shadow-lg hover:shadow-[var(--acc-primary-strong)]/30 transition-all hover:-translate-y-0.5" style={{ fontSize: 13, fontWeight: 600 }}>
            <Plus className="w-4 h-4" /> {t("emp.addEmployee")}
          </Link>
        </div>
      </div>

      <div className="rounded-xl border p-4" style={{ backgroundColor: cardBg, borderColor }}>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 rounded-lg px-3 py-2" style={{ backgroundColor: inputBg }}>
            <Search className="w-4 h-4" style={{ color: textSecondary }} />
            <input placeholder={t("emp.searchEmployees")} value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none w-full" style={{ fontSize: 13, color: textPrimary }} />
          </div>
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="px-3 py-2 rounded-lg border-none outline-none" style={{ fontSize: 13, backgroundColor: inputBg, color: textPrimary }}>
            <option value="all">{t("emp.allDepartments")}</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg border-none outline-none" style={{ fontSize: 13, backgroundColor: inputBg, color: textPrimary }}>
            <option value="all">{t("emp.allStatus")}</option>
            <option value="active">{t("emp.active")}</option>
            <option value="on-leave">{t("emp.onLeave")}</option>
            <option value="probation">{t("emp.probation")}</option>
          </select>
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor }}>
            <button onClick={() => setView("grid")} className="px-3 py-2" style={{ fontSize: 12, backgroundColor: view === "grid" ? (isDark ? "var(--acc-tint-dark)" : "var(--acc-tint-light)") : cardBg, color: view === "grid" ? "var(--acc-primary-strong)" : textSecondary }}>{t("emp.grid")}</button>
            <button onClick={() => setView("table")} className="px-3 py-2" style={{ fontSize: 12, backgroundColor: view === "table" ? (isDark ? "var(--acc-tint-dark)" : "var(--acc-tint-light)") : cardBg, color: view === "table" ? "var(--acc-primary-strong)" : textSecondary }}>{t("emp.table")}</button>
          </div>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((e) => {
            const st = statusColors[e.status];
            return (
              <div key={e.id} className="rounded-xl border p-5 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer" style={{ backgroundColor: cardBg, borderColor }} onClick={() => navigate(`/employees/${e.id}`)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--acc-primary)] to-[var(--acc-primary-soft)] flex items-center justify-center text-white" style={{ fontSize: 14, fontWeight: 600 }}>{e.firstName[0]}{e.lastName[0]}</div>
                  <span className={`${st.bg} ${st.text} px-2.5 py-1 rounded-md`} style={{ fontSize: 11, fontWeight: 600 }}>{st.label}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: textPrimary }}>{e.firstName} {e.lastName}</div>
                <div style={{ fontSize: 12, color: textSecondary }}>{e.position}</div>
                <div style={{ fontSize: 12, color: textMuted }}>{e.department} · {e.code}</div>
                <div className="mt-3 pt-3 flex items-center gap-2" style={{ borderTop: `1px solid ${borderColor}` }}>
                  <Mail className="w-3.5 h-3.5" style={{ color: textMuted }} />
                  <span className="truncate" style={{ fontSize: 12, color: textSecondary }}>{e.email}</span>
                </div>
                <div className="mt-2 flex justify-end">
                  <button className="p-1.5 rounded hover:bg-[#FEE2E2]" onClick={(ev) => { ev.stopPropagation(); setDeleteConfirm(e.id); }} style={{ color: textMuted }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: cardBg, borderColor }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
                  {[t("emp.employee"), t("emp.department"), t("emp.position"), t("emp.status"), t("emp.hireDate"), t("emp.actions")].map((h) => (
                    <th key={h} className="text-left px-4 py-3" style={{ fontSize: 12, fontWeight: 600, color: textSecondary }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const st = statusColors[e.status];
                  return (
                    <tr key={e.id} className="hover:opacity-80 transition-colors cursor-pointer" style={{ borderBottom: `1px solid ${isDark ? "#1F2937" : "#F9FAFB"}` }} onClick={() => navigate(`/employees/${e.id}`)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--acc-primary)] to-[var(--acc-primary-soft)] flex items-center justify-center text-white" style={{ fontSize: 11, fontWeight: 600 }}>{e.firstName[0]}{e.lastName[0]}</div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{e.firstName} {e.lastName}</div>
                            <div style={{ fontSize: 12, color: textMuted }}>{e.code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ fontSize: 13, color: textSecondary }}>{e.department}</td>
                      <td className="px-4 py-3" style={{ fontSize: 13, color: textSecondary }}>{e.position}</td>
                      <td className="px-4 py-3"><span className={`${st.bg} ${st.text} px-2.5 py-1 rounded-md`} style={{ fontSize: 11, fontWeight: 600 }}>{st.label}</span></td>
                      <td className="px-4 py-3" style={{ fontSize: 13, color: textSecondary }}>{e.hireDate}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1" onClick={(ev) => ev.stopPropagation()}>
                          <button onClick={() => navigate(`/employees/${e.id}`)} className="p-1.5 rounded hover:bg-[var(--acc-tint-light)] hover:text-[var(--acc-primary)]" style={{ color: textSecondary }}><Edit className="w-4 h-4" /></button>
                          <button className="p-1.5 rounded hover:bg-[var(--acc-tint-light)] hover:text-[var(--acc-primary)]" style={{ color: textSecondary }}><Trash2 className="w-4 h-4" onClick={() => setDeleteConfirm(e.id)} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="rounded-2xl border shadow-2xl w-full max-w-sm p-6" style={{ backgroundColor: cardBg, borderColor }} onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: isDark ? "#7F1D1D" : "#FEE2E2" }}>
              <Trash2 className="w-6 h-6 text-[#DC2626]" />
            </div>
            <h3 className="text-center mb-2" style={{ fontSize: 18, fontWeight: 600, color: textPrimary }}>Delete Employee?</h3>
            <p className="text-center mb-6" style={{ fontSize: 13, color: textSecondary }}>This action cannot be undone. All data for this employee will be permanently removed.</p>
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2.5 rounded-lg" style={{ fontSize: 13, fontWeight: 500, backgroundColor: isDark ? "#374151" : "#F3F4F6", color: textPrimary }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="flex-1 px-4 py-2.5 rounded-lg bg-[#DC2626] text-white hover:bg-[#B91C1C] transition-colors" style={{ fontSize: 13, fontWeight: 600 }} onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
      <ImportDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        title="Import Employees"
        schema={employeeSchema}
        onImport={handleImport}
      />
    </div>
  );
}