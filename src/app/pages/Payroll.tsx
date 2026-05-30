import { useState } from "react";
import { DollarSign, Download, Send, CheckCircle, ArrowRight, Plus, Edit, Trash2, X, Save, AlertTriangle, FileText, ChevronRight, Upload } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from "recharts";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { ImportDialog } from "../components/imports/ImportDialog";
import { type ImportSchema } from "../lib/import-engine";

const payrollSchema: ImportSchema = {
  fields: [
    { key: "employeeId", label: "Employee ID", type: "string", required: true, aliases: ["Emp ID"] },
    { key: "employeeName", label: "Employee Name", type: "string", required: true, aliases: ["Name", "Full Name"] },
    { key: "basicSalary", label: "Basic Salary", type: "number", required: true, aliases: ["Salary", "Base Pay"] },
    { key: "allowances", label: "Allowances", type: "number", required: false, aliases: ["Bonus"] },
    { key: "deductions", label: "Deductions", type: "number", required: false, aliases: ["Taxes", "Penalty"] },
  ]
};

export function Payroll() {
  const { t, theme, payrollRecords: records, addPayrollRecord, updatePayrollRecord, deletePayrollRecord, employees, formatCurrency, formatNumber } = useApp();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [period, setPeriod] = useState("2026-03");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ employeeId: "", basicSalary: "", allowances: "", deductions: "", status: "draft" as "draft" | "processed" | "paid" });
  const [isImportOpen, setIsImportOpen] = useState(false);
  
  const [viewPayslipId, setViewPayslipId] = useState<string | null>(null);

  const isDark = theme === "dark";
  const cardBg = isDark ? "#1F2937" : "#ffffff";
  const borderColor = isDark ? "#374151" : "#F3F4F6";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const inputBg = isDark ? "#374151" : "#F9FAFB";
  const inputBorder = isDark ? "#4B5563" : "#E5E7EB";

  const statusStyles: Record<string, { bg: string; text: string }> = {
    draft: { bg: isDark ? "bg-[#374151]" : "bg-[#F3F4F6]", text: isDark ? "text-[#9CA3AF]" : "text-[#6B7280]" },
    processed: { bg: isDark ? "bg-[#1E3A5F]" : "bg-[#DBEAFE]", text: "text-[var(--acc-primary-strong)]" },
    paid: { bg: isDark ? "bg-[#064E3B]" : "bg-[#D1FAE5]", text: "text-[#059669]" },
  };

  const totalGross = records.reduce((s, r) => s + r.basicSalary + r.allowances, 0);
  const totalDeductions = records.reduce((s, r) => s + r.deductions, 0);
  const totalNet = records.reduce((s, r) => s + r.netSalary, 0);
  const chartData = records.map((r, i) => ({ name: r.employeeName.split(" ")[0], id: `${r.id}-${i}`, gross: r.basicSalary + r.allowances, net: r.netSalary, deductions: r.deductions }));

  // Mock previous month total net
  const prevMonthNet = totalNet * 0.958; // 4.2% higher this month
  const variancePercent = prevMonthNet ? ((totalNet - prevMonthNet) / prevMonthNet) * 100 : 0;

  const handleProcess = () => {
    records.filter((r) => r.status === "draft").forEach((r) => updatePayrollRecord(r.id, { status: "processed" }));
    setStep(3);
    toast.success(t("pay.processed"));
  };

  const resetForm = () => {
    setForm({ employeeId: "", basicSalary: "", allowances: "", deductions: "", status: "draft" });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((em) => em.id === form.employeeId);
    if (!emp) return;
    const basic = parseInt(form.basicSalary) || 0;
    const allow = parseInt(form.allowances) || 0;
    const deduct = parseInt(form.deductions) || 0;
    const net = basic + allow - deduct;

    if (editId) {
      updatePayrollRecord(editId, {
        employeeId: form.employeeId,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        basicSalary: basic,
        allowances: allow,
        deductions: deduct,
        netSalary: net,
        status: form.status,
      });
      toast.success("Payroll record updated");
    } else {
      addPayrollRecord({
        id: `PR${String(Date.now()).slice(-6)}`,
        employeeId: form.employeeId,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        period,
        basicSalary: basic,
        allowances: allow,
        deductions: deduct,
        netSalary: net,
        status: form.status,
      });
      toast.success("Payroll record added");
    }
    resetForm();
  };

  const handleEdit = (id: string) => {
    const rec = records.find((r) => r.id === id);
    if (!rec) return;
    setForm({ employeeId: rec.employeeId, basicSalary: String(rec.basicSalary), allowances: String(rec.allowances), deductions: String(rec.deductions), status: rec.status });
    setEditId(id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deletePayrollRecord(id);
    setDeleteConfirm(null);
    toast.success("Record deleted");
  };

  const updateInline = (id: string, field: "allowances" | "deductions", value: string) => {
    const rec = records.find((r) => r.id === id);
    if (!rec) return;
    const num = parseInt(value) || 0;
    const newNet = field === "allowances" ? rec.basicSalary + num - rec.deductions : rec.basicSalary + rec.allowances - num;
    updatePayrollRecord(id, { [field]: num, netSalary: newNet });
  };

  const handleImport = (validData: any[]) => {
    validData.forEach((row, i) => {
      const basic = Number(row.basicSalary) || 0;
      const allow = Number(row.allowances) || 0;
      const deduct = Number(row.deductions) || 0;
      addPayrollRecord({
        id: `PR${String(Date.now() + i).slice(-6)}`,
        employeeId: row.employeeId,
        employeeName: row.employeeName,
        period,
        basicSalary: basic,
        allowances: allow,
        deductions: deduct,
        netSalary: basic + allow - deduct,
        status: "draft",
      });
    });
    setIsImportOpen(false);
    toast.success(`Successfully imported ${validData.length} payroll records`);
  };

  const inputClass = "w-full px-3 py-2.5 rounded-lg outline-none focus:border-[var(--acc-primary-strong)] focus:ring-2 focus:ring-[var(--acc-primary-strong)]/10 transition-all";

  const viewingRecord = records.find(r => r.id === viewPayslipId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 style={{ fontSize: 24, fontWeight: 700, color: textPrimary }}>{t("pay.title")}</h2>
        <div className="flex gap-2">
          <button onClick={() => setIsImportOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ fontSize: 13, fontWeight: 500, borderColor, color: textPrimary }}>
            <Upload className="w-4 h-4" /> Import
          </button>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white rounded-lg" style={{ fontSize: 13, fontWeight: 600 }}><Plus className="w-4 h-4" /> Add Record</button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ fontSize: 13, fontWeight: 500, borderColor, color: textPrimary }}><Download className="w-4 h-4" /> {t("pay.export")}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border p-5 shadow-sm" style={{ backgroundColor: cardBg, borderColor }}><div style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("pay.totalGross")}</div><div style={{ fontSize: 28, fontWeight: 700, color: textPrimary }} className="mt-2 tracking-tight">{formatCurrency(totalGross)}</div></div>
        <div className="rounded-xl border p-5 shadow-sm" style={{ backgroundColor: cardBg, borderColor }}><div style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("pay.totalDeductions")}</div><div className="mt-2 text-[#EF4444] tracking-tight" style={{ fontSize: 28, fontWeight: 700 }}>-{formatCurrency(totalDeductions)}</div></div>
        <div className="bg-gradient-to-br from-[var(--acc-primary-strong)] to-[var(--acc-primary)] rounded-xl p-5 shadow-md text-white"><div className="text-white/90 font-medium" style={{ fontSize: 13 }}>{t("pay.totalNetPayout")}</div><div className="mt-2 tracking-tight" style={{ fontSize: 28, fontWeight: 700 }}>{formatCurrency(totalNet)}</div></div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border p-6 space-y-4 shadow-md" style={{ backgroundColor: cardBg, borderColor }}>
          <div className="flex items-center justify-between"><h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }}>{editId ? "Edit Payroll Record" : "New Payroll Record"}</h3><button type="button" onClick={resetForm}><X className="w-4 h-4" style={{ color: textSecondary }} /></button></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div><label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Employee</label><select required value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}><option value="">Select</option>{employees.filter((em) => em.status === "active").map((em) => <option key={em.id} value={em.id}>{em.firstName} {em.lastName}</option>)}</select></div>
            <div><label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Basic Salary</label><input type="number" required value={form.basicSalary} onChange={(e) => setForm({ ...form, basicSalary: e.target.value })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} /></div>
            <div><label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Allowances</label><input type="number" value={form.allowances} onChange={(e) => setForm({ ...form, allowances: e.target.value })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} /></div>
            <div><label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Deductions</label><input type="number" value={form.deductions} onChange={(e) => setForm({ ...form, deductions: e.target.value })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} /></div>
            <div><label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}><option value="draft">Draft</option><option value="processed">Processed</option><option value="paid">Paid</option></select></div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white rounded-lg" style={{ fontSize: 13, fontWeight: 600 }}><Save className="w-4 h-4" /> {editId ? "Update" : "Add"}</button>
            <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-lg" style={{ fontSize: 13, fontWeight: 500, backgroundColor: isDark ? "#374151" : "#F3F4F6", color: textPrimary }}>Cancel</button>
          </div>
        </form>
      )}

      {step === 1 && (
        <div className="rounded-xl border p-5 shadow-sm" style={{ backgroundColor: cardBg, borderColor }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }} className="mb-4">{t("pay.salaryBreakdown")}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#374151" : "#E5E7EB"} />
              <XAxis dataKey="id" tick={{ fontSize: 12, fill: textSecondary }} axisLine={false} tickLine={false} tickFormatter={(id: string) => { const item = chartData.find((d) => d.id === id); return item?.name ?? ""; }} />
              <YAxis tick={{ fontSize: 12, fill: textSecondary }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip cursor={{ fill: isDark ? '#374151' : '#F3F4F6' }} contentStyle={{ borderRadius: 8, border: `1px solid ${borderColor}`, fontSize: 13, backgroundColor: cardBg, color: textPrimary, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(v: number) => `${formatCurrency(v)}`} />
              <Bar key="bar-gross" dataKey="gross" fill="var(--acc-primary-strong)" radius={[4, 4, 0, 0]} name="Gross" maxBarSize={40} />
              <Bar key="bar-net" dataKey="net" fill="#10B981" radius={[4, 4, 0, 0]} name="Net" maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="rounded-xl border shadow-sm" style={{ backgroundColor: cardBg, borderColor }}>
        <div className="flex items-center gap-4 p-5" style={{ borderBottom: `1px solid ${borderColor}` }}>
          {[{ n: 1, label: t("pay.selectPeriod") }, { n: 2, label: t("pay.review") }, { n: 3, label: t("pay.complete") }].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ fontSize: 13, fontWeight: 600, backgroundColor: step >= s.n ? "var(--acc-primary-strong)" : (isDark ? "#374151" : "#F3F4F6"), color: step >= s.n ? "#fff" : textSecondary }}>
                {step > s.n ? <CheckCircle className="w-4 h-4" /> : s.n}
              </div>
              <span style={{ fontSize: 13, fontWeight: step >= s.n ? 600 : 500, color: step >= s.n ? textPrimary : textSecondary }}>{s.label}</span>
              {i < 2 && <ChevronRight className="w-4 h-4 mx-2" style={{ color: isDark ? "#4B5563" : "#D1D5DB" }} />}
            </div>
          ))}
        </div>

        <div className="p-5">
          {step === 1 && (
            <div className="max-w-sm space-y-4">
              <div>
                <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("pay.payPeriod")}</label>
                <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none transition-shadow focus:ring-2 focus:ring-[var(--acc-primary)]/20" style={{ fontSize: 14, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} />
              </div>
              <button onClick={() => setStep(2)} className="w-full px-5 py-3 bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white rounded-lg shadow-md hover:shadow-lg transition-all" style={{ fontSize: 14, fontWeight: 600 }}>{t("pay.loadData")}</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {variancePercent > 0 && (
                <div className="flex items-start gap-3 p-4 rounded-xl mb-4 bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/50">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-800 dark:text-amber-400" style={{ fontSize: 14 }}>Payroll Variance Alert</h4>
                    <p className="text-amber-700 dark:text-amber-500 mt-1" style={{ fontSize: 13 }}>Total net payout is <strong>{variancePercent.toFixed(1)}% higher</strong> than last month. Ensure all bonuses and new hires are accounted for.</p>
                  </div>
                </div>
              )}
              
              <div className="overflow-x-auto rounded-lg border" style={{ borderColor }}>
                <table className="w-full">
                  <thead style={{ backgroundColor: isDark ? "#374151" : "#F9FAFB" }}>
                    <tr>
                      {[t("leave.employee"), t("pay.basic"), t("pay.allowances"), t("pay.deductions"), t("pay.netSalary"), t("pay.status"), "Actions"].map((h) => (
                        <th key={h} className="text-left px-4 py-3" style={{ fontSize: 12, fontWeight: 600, color: textSecondary }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>{records.map((r) => (
                    <tr key={r.id} style={{ borderBottom: `1px solid ${isDark ? "#1F2937" : "#F9FAFB"}` }} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3" style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{r.employeeName}</td>
                      <td className="px-4 py-3" style={{ fontSize: 13, color: textPrimary }}>{formatNumber(r.basicSalary)}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center bg-transparent focus-within:ring-2 focus-within:ring-[var(--acc-primary)]/50 rounded transition-shadow">
                          <span className="pl-2 text-green-500 font-medium">+</span>
                          <input type="number" value={r.allowances} onChange={(e) => updateInline(r.id, "allowances", e.target.value)} className="w-24 px-2 py-1.5 bg-transparent outline-none text-green-600 dark:text-green-400" style={{ fontSize: 13, fontWeight: 500 }} />
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center bg-transparent focus-within:ring-2 focus-within:ring-red-500/50 rounded transition-shadow">
                          <span className="pl-2 text-red-500 font-medium">-</span>
                          <input type="number" value={r.deductions} onChange={(e) => updateInline(r.id, "deductions", e.target.value)} className="w-24 px-2 py-1.5 bg-transparent outline-none text-red-600 dark:text-red-400" style={{ fontSize: 13, fontWeight: 500 }} />
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ fontSize: 14, fontWeight: 600, color: textPrimary }}>{formatNumber(r.netSalary)}</td>
                      <td className="px-4 py-3"><span className={`${statusStyles[r.status].bg} ${statusStyles[r.status].text} px-2.5 py-1 rounded-md`} style={{ fontSize: 11, fontWeight: 600 }}>{r.status}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => setViewPayslipId(r.id)} className="p-1.5 rounded hover:bg-[var(--acc-tint-light)] hover:text-[var(--acc-primary)] transition-colors" style={{ color: textSecondary }} title="View Payslip"><FileText className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteConfirm(r.id)} className="p-1.5 rounded hover:bg-[#FEE2E2] hover:text-[#DC2626] transition-colors" style={{ color: textSecondary }}><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4" style={{ borderTop: `1px solid ${borderColor}` }}>
                <button onClick={() => setStep(1)} className="px-5 py-2.5 rounded-lg border hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ fontSize: 13, fontWeight: 500, borderColor, color: textPrimary }}>{t("pay.back")}</button>
                <button onClick={handleProcess} className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white rounded-lg shadow-md hover:shadow-lg transition-all" style={{ fontSize: 14, fontWeight: 600 }}><DollarSign className="w-4 h-4" /> Execute {t("pay.processPayroll")}</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-10">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: isDark ? "#064E3B" : "#D1FAE5" }}><CheckCircle className="w-10 h-10 text-[#10B981]" /></div>
              <h3 style={{ fontSize: 24, fontWeight: 700, color: textPrimary }} className="mb-2">Payroll Executed Successfully</h3>
              <p style={{ fontSize: 15, color: textSecondary }} className="mb-8">Payslips generated for {records.length} employees for the period of {period}.</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ fontSize: 13, fontWeight: 600, borderColor, color: textPrimary }}><Download className="w-4 h-4" /> Download General Ledger</button>
                <button className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white rounded-lg shadow-md hover:shadow-lg transition-all" style={{ fontSize: 13, fontWeight: 600 }}><Send className="w-4 h-4" /> Distribute Payslips</button>
                <button onClick={() => setStep(1)} className="px-5 py-3 rounded-lg" style={{ fontSize: 13, fontWeight: 500, backgroundColor: isDark ? "#374151" : "#F3F4F6", color: textPrimary }}>Start New Run</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Payslip Modal */}
      {viewPayslipId && viewingRecord && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setViewPayslipId(null)}>
          <div className="rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all" style={{ backgroundColor: isDark ? "#111827" : "#ffffff", border: `1px solid ${borderColor}` }} onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[var(--acc-primary-strong)] to-[var(--acc-primary)] p-6 text-white relative">
              <button onClick={() => setViewPayslipId(null)} className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"><X className="w-5 h-5" /></button>
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Staffly AI</h2>
                  <p className="opacity-80 text-sm mt-1">Official Payslip</p>
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-lg">{viewingRecord.employeeName}</h3>
                  <p className="opacity-80 text-sm">{period}</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm font-medium" style={{ color: textSecondary }}>Basic Salary</span>
                <span className="font-semibold" style={{ color: textPrimary }}>{formatCurrency(viewingRecord.basicSalary)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm font-medium" style={{ color: textSecondary }}>Allowances</span>
                <span className="font-semibold text-green-600 dark:text-green-400">+{formatCurrency(viewingRecord.allowances)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm font-medium" style={{ color: textSecondary }}>Deductions</span>
                <span className="font-semibold text-red-600 dark:text-red-400">-{formatCurrency(viewingRecord.deductions)}</span>
              </div>
              <div className="flex justify-between items-center py-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-4 border border-gray-100 dark:border-gray-700">
                <span className="font-bold" style={{ color: textPrimary }}>Net Pay</span>
                <span className="text-xl font-bold text-[var(--acc-primary-strong)]">{formatCurrency(viewingRecord.netSalary)}</span>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-semibold" style={{ color: textPrimary }}><Download className="w-4 h-4" /> PDF</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="rounded-2xl border shadow-2xl w-full max-w-sm p-6" style={{ backgroundColor: cardBg, borderColor }} onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: isDark ? "#7F1D1D" : "#FEE2E2" }}><Trash2 className="w-6 h-6 text-[#DC2626]" /></div>
            <h3 className="text-center mb-2" style={{ fontSize: 18, fontWeight: 600, color: textPrimary }}>Delete Record?</h3>
            <p className="text-center mb-6" style={{ fontSize: 13, color: textSecondary }}>This payroll record will be permanently removed.</p>
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
        title="Import Payroll Records"
        schema={payrollSchema}
        onImport={handleImport}
      />
    </div>
  );
}