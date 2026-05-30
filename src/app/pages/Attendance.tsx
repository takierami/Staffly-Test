import { useState } from "react";
import { Clock, CheckCircle, XCircle, AlertCircle, Timer, Plus, Edit, Trash2, X, Save } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

export function Attendance() {
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ employeeId: "", date: new Date().toISOString().split("T")[0], checkIn: "", checkOut: "", status: "present" as "present" | "absent" | "late" | "half-day" });
  const { t, theme, attendanceRecords, addAttendanceRecord, updateAttendanceRecord, deleteAttendanceRecord, employees } = useApp();
  const isDark = theme === "dark";
  const cardBg = isDark ? "#1F2937" : "#ffffff";
  const borderColor = isDark ? "#374151" : "#F3F4F6";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const inputBg = isDark ? "#374151" : "#F9FAFB";
  const inputBorder = isDark ? "#4B5563" : "#E5E7EB";

  const statusConfig: Record<string, { icon: any; bg: string; text: string; label: string }> = {
    present: { icon: CheckCircle, bg: isDark ? "bg-[#064E3B]" : "bg-[#D1FAE5]", text: "text-[#059669]", label: t("att.present") },
    absent: { icon: XCircle, bg: isDark ? "bg-[#7F1D1D]" : "bg-[#FEE2E2]", text: "text-[#DC2626]", label: t("att.absent") },
    late: { icon: AlertCircle, bg: isDark ? "bg-[#78350F]" : "bg-[#FEF3C7]", text: "text-[#D97706]", label: t("att.late") },
    "half-day": { icon: Timer, bg: isDark ? "bg-[#1E3A5F]" : "bg-[#DBEAFE]", text: "text-[var(--acc-primary-strong)]", label: t("att.halfDay") },
  };

  const handleCheckIn = () => {
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    setCheckInTime(now);
    setCheckedIn(true);
    toast.success(`${t("att.checkIn")} ${now}`);
  };

  const summary = {
    present: attendanceRecords.filter((r) => r.status === "present").length,
    absent: attendanceRecords.filter((r) => r.status === "absent").length,
    late: attendanceRecords.filter((r) => r.status === "late").length,
    halfDay: attendanceRecords.filter((r) => r.status === "half-day").length,
  };

  const resetForm = () => {
    setForm({ employeeId: "", date: new Date().toISOString().split("T")[0], checkIn: "", checkOut: "", status: "present" });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((em) => em.id === form.employeeId);
    if (!emp) return;
    const hours = form.checkIn && form.checkOut
      ? Math.round((new Date(`2000-01-01T${form.checkOut}`).getTime() - new Date(`2000-01-01T${form.checkIn}`).getTime()) / 3600000 * 100) / 100
      : 0;

    if (editId) {
      updateAttendanceRecord(editId, {
        employeeId: form.employeeId,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        date: form.date,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        hoursWorked: hours,
        status: form.status,
      });
      toast.success("Attendance record updated");
    } else {
      addAttendanceRecord({
        id: `ATT${String(Date.now()).slice(-6)}`,
        employeeId: form.employeeId,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        date: form.date,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        hoursWorked: hours,
        status: form.status,
      });
      toast.success("Attendance record added");
    }
    resetForm();
  };

  const handleEdit = (id: string) => {
    const rec = attendanceRecords.find((r) => r.id === id);
    if (!rec) return;
    setForm({ employeeId: rec.employeeId, date: rec.date, checkIn: rec.checkIn, checkOut: rec.checkOut, status: rec.status });
    setEditId(id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteAttendanceRecord(id);
    setDeleteConfirm(null);
    toast.success("Attendance record deleted");
  };

  const inputClass = "w-full px-3 py-2.5 rounded-lg outline-none focus:border-[var(--acc-primary-strong)] focus:ring-2 focus:ring-[var(--acc-primary-strong)]/10 transition-all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 style={{ fontSize: 24, fontWeight: 700, color: textPrimary }}>{t("att.title")}</h2>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white rounded-lg" style={{ fontSize: 13, fontWeight: 600 }}>
          <Plus className="w-4 h-4" /> Add Record
        </button>
      </div>

      <div className="bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-soft)] rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 600 }}>{checkedIn ? t("att.checkedIn") : t("att.readyToStart")}</h3>
            <p className="text-white/70" style={{ fontSize: 14 }}>{checkedIn ? `${t("att.since")} ${checkInTime}` : new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          <button onClick={checkedIn ? () => { setCheckedIn(false); toast.success(t("att.checkOut") + "!"); } : handleCheckIn} className={`px-6 py-3 rounded-xl transition-all ${checkedIn ? "bg-white/20 hover:bg-white/30" : "bg-white text-[var(--acc-primary)] hover:shadow-xl"}`} style={{ fontSize: 14, fontWeight: 600 }}>
            <Clock className="w-5 h-5 inline mr-2" />{checkedIn ? t("att.checkOut") : t("att.checkIn")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t("att.present"), value: summary.present, color: "#10B981", bg: isDark ? "#064E3B" : "#D1FAE5" },
          { label: t("att.absent"), value: summary.absent, color: "#EF4444", bg: isDark ? "#7F1D1D" : "#FEE2E2" },
          { label: t("att.late"), value: summary.late, color: "#F59E0B", bg: isDark ? "#78350F" : "#FEF3C7" },
          { label: t("att.halfDay"), value: summary.halfDay, color: "var(--acc-primary-soft)", bg: isDark ? "#1E3A5F" : "#DBEAFE" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border p-4" style={{ backgroundColor: cardBg, borderColor }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: s.bg }}>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: textPrimary }}>{s.value}</div>
            <div style={{ fontSize: 12, color: textSecondary }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border p-6 space-y-4" style={{ backgroundColor: cardBg, borderColor }}>
          <div className="flex items-center justify-between">
            <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }}>{editId ? "Edit Attendance Record" : "Add Attendance Record"}</h3>
            <button type="button" onClick={resetForm} className="p-1.5 rounded hover:bg-[var(--muted)]"><X className="w-4 h-4" style={{ color: textSecondary }} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Employee</label>
              <select required value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}>
                <option value="">Select Employee</option>
                {employees.filter((e) => e.status === "active").map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Date</label>
              <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Check In</label>
              <input type="time" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Check Out</label>
              <input type="time" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="half-day">Half Day</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white rounded-lg" style={{ fontSize: 13, fontWeight: 600 }}><Save className="w-4 h-4" /> {editId ? "Update" : "Add"}</button>
            <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-lg" style={{ fontSize: 13, fontWeight: 500, backgroundColor: isDark ? "#374151" : "#F3F4F6", color: textPrimary }}>Cancel</button>
          </div>
        </form>
      )}

      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: cardBg, borderColor }}>
        <div className="px-5 py-4" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }}>{t("att.todaysAttendance")}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
                {[t("att.employee"), t("att.checkIn"), t("att.checkOut"), t("att.hours"), t("att.status"), "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3" style={{ fontSize: 12, fontWeight: 600, color: textSecondary }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((r) => {
                const s = statusConfig[r.status];
                return (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${isDark ? "#1F2937" : "#F9FAFB"}` }}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--acc-primary)] to-[var(--acc-primary-soft)] flex items-center justify-center text-white" style={{ fontSize: 11, fontWeight: 600 }}>
                          {r.employeeName.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{r.employeeName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3" style={{ fontSize: 13, color: textPrimary }}>{r.checkIn || "\u2014"}</td>
                    <td className="px-5 py-3" style={{ fontSize: 13, color: textPrimary }}>{r.checkOut || "\u2014"}</td>
                    <td className="px-5 py-3" style={{ fontSize: 13, color: textPrimary }}>{r.hoursWorked ? `${r.hoursWorked}h` : "\u2014"}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 ${s.bg} ${s.text} px-2.5 py-1 rounded-md`} style={{ fontSize: 11, fontWeight: 600 }}>
                        <s.icon className="w-3 h-3" />{s.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(r.id)} className="p-1.5 rounded hover:bg-[var(--acc-tint-light)] hover:text-[var(--acc-primary)]" style={{ color: textSecondary }}><Edit className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteConfirm(r.id)} className="p-1.5 rounded hover:bg-[#FEE2E2] hover:text-[#DC2626]" style={{ color: textSecondary }}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="rounded-2xl border shadow-2xl w-full max-w-sm p-6" style={{ backgroundColor: cardBg, borderColor }} onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: isDark ? "#7F1D1D" : "#FEE2E2" }}><Trash2 className="w-6 h-6 text-[#DC2626]" /></div>
            <h3 className="text-center mb-2" style={{ fontSize: 18, fontWeight: 600, color: textPrimary }}>Delete Record?</h3>
            <p className="text-center mb-6" style={{ fontSize: 13, color: textSecondary }}>This attendance record will be permanently removed.</p>
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2.5 rounded-lg" style={{ fontSize: 13, fontWeight: 500, backgroundColor: isDark ? "#374151" : "#F3F4F6", color: textPrimary }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="flex-1 px-4 py-2.5 rounded-lg bg-[#DC2626] text-white hover:bg-[#B91C1C] transition-colors" style={{ fontSize: 13, fontWeight: 600 }} onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
