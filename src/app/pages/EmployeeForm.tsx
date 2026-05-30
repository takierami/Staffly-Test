import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

export function EmployeeForm() {
  const navigate = useNavigate();
  const { t, theme, lang, categories: employeeCategories, grades: gradeSystem, customDepartments: departments, addEmployee, employees } = useApp();
  const isAr = lang === "ar";
  const isDark = theme === "dark";
  const cardBg = isDark ? "#1F2937" : "#ffffff";
  const borderColor = isDark ? "#374151" : "#F3F4F6";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#374151";
  const inputBg = isDark ? "#374151" : "#F9FAFB";
  const inputBorder = isDark ? "#4B5563" : "#E5E7EB";

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", department: "", position: "", employmentType: "full-time", salary: "", hireDate: "", category: "", grade: "G1" });
  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  // Group categories by department for the optgroup dropdown
  const categoryGroups = useMemo(() => {
    const groups: Record<string, typeof employeeCategories[number][]> = {};
    employeeCategories.forEach((cat) => {
      if (!groups[cat.department]) groups[cat.department] = [];
      groups[cat.department].push(cat);
    });
    return groups;
  }, [employeeCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `EMP${String(employees.length + 1).padStart(3, "0")}`;
    const newCode = newId;
    addEmployee({
      id: newId,
      code: newCode,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      department: form.department,
      position: form.position,
      status: "active",
      hireDate: form.hireDate,
      salary: parseInt(form.salary) || 0,
      employmentType: form.employmentType as "full-time" | "part-time" | "contract",
      category: form.category,
      grade: form.grade,
      currentRank: employees.length + 1,
    });
    toast.success(t("empForm.save") + "!");
    navigate("/employees");
  };

  const inputClass = `w-full px-3 py-2.5 rounded-lg outline-none focus:border-[var(--acc-primary-strong)] focus:ring-2 focus:ring-[var(--acc-primary-strong)]/10 transition-all`;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link to="/employees" className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ color: textSecondary }}><ArrowLeft className="w-5 h-5" /></Link>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: textPrimary }}>{t("empForm.addNew")}</h2>
      </div>
      <form onSubmit={handleSubmit} className="rounded-xl border p-6 space-y-6" style={{ backgroundColor: cardBg, borderColor }}>
        {/* Personal Info */}
        <div>
          <h4 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }} className="mb-4">{t("empForm.personalInfo")}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: t("empForm.firstName"), field: "firstName", type: "text" },
              { label: t("empForm.lastName"), field: "lastName", type: "text" },
              { label: t("empForm.email"), field: "email", type: "email" },
              { label: t("empForm.phone"), field: "phone", type: "tel" },
            ].map((input) => (
              <div key={input.field}>
                <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{input.label}</label>
                <input type={input.type} required value={(form as any)[input.field]} onChange={(e) => update(input.field, e.target.value)} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} />
              </div>
            ))}
          </div>
        </div>

        {/* Employment Details */}
        <div className="pt-6" style={{ borderTop: `1px solid ${borderColor}` }}>
          <h4 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }} className="mb-4">{t("empForm.employmentDetails")}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("empForm.department")}</label>
              <select value={form.department} onChange={(e) => update("department", e.target.value)} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} required>
                <option value="">{t("empForm.selectDept")}</option>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("empForm.position")}</label>
              <input value={form.position} onChange={(e) => update("position", e.target.value)} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} required />
            </div>

            {/* Employee Category - grouped by department */}
            <div className="sm:col-span-2">
              <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("empForm.category")}</label>
              <select value={form.category} onChange={(e) => update("category", e.target.value)} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}>
                <option value="">{t("empForm.selectCategory")}</option>
                {Object.entries(categoryGroups).map(([dept, cats]) => (
                  <optgroup key={dept} label={dept}>
                    {cats.map((cat) => (
                      <option key={cat.id} value={cat.id}>{isAr ? cat.nameAr : cat.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("empForm.grade")}</label>
              <select value={form.grade} onChange={(e) => update("grade", e.target.value)} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}>
                {gradeSystem.map((g) => (
                  <option key={g.id} value={g.id}>{isAr ? g.nameAr : g.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("empForm.employmentType")}</label>
              <select value={form.employmentType} onChange={(e) => update("employmentType", e.target.value)} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}>
                <option value="full-time">{t("empForm.fullTime")}</option>
                <option value="part-time">{t("empForm.partTime")}</option>
                <option value="contract">{t("empForm.contract")}</option>
              </select>
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("empForm.hireDate")}</label>
              <input type="date" value={form.hireDate} onChange={(e) => update("hireDate", e.target.value)} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} required />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("empForm.basicSalary")}</label>
              <input type="number" value={form.salary} onChange={(e) => update("salary", e.target.value)} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} required />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4" style={{ borderTop: `1px solid ${borderColor}` }}>
          <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white rounded-lg hover:shadow-lg transition-all" style={{ fontSize: 13, fontWeight: 600 }}><Save className="w-4 h-4" /> {t("empForm.save")}</button>
          <Link to="/employees" className="px-5 py-2.5 rounded-lg transition-colors" style={{ fontSize: 13, fontWeight: 500, backgroundColor: isDark ? "#374151" : "#F3F4F6", color: textPrimary }}>{t("empForm.cancel")}</Link>
        </div>
      </form>
    </div>
  );
}