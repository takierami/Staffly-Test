import { useState } from "react";
import { GraduationCap, Calendar, Users, Plus, BookOpen, Edit, Trash2, X, Save } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

const categoryColors: Record<string, string> = { Technical: "var(--acc-primary-strong)", Management: "var(--acc-primary-soft)", Compliance: "#F59E0B", Other: "#6B7280" };

export function Training() {
  const { t, theme, trainingPrograms: programs, addTrainingProgram, updateTrainingProgram, deleteTrainingProgram } = useApp();
  const isDark = theme === "dark";
  const cardBg = isDark ? "#1F2937" : "#ffffff";
  const borderColor = isDark ? "#374151" : "#F3F4F6";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const inputBg = isDark ? "#374151" : "#F9FAFB";
  const inputBorder = isDark ? "#4B5563" : "#E5E7EB";

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", category: "Technical", instructor: "", startDate: "", endDate: "", capacity: 15, status: "upcoming" as "upcoming" | "in-progress" | "completed" });

  const statusStyles: Record<string, { bg: string; text: string }> = {
    upcoming: { bg: isDark ? "bg-[#1E3A5F]" : "bg-[#DBEAFE]", text: "text-[var(--acc-primary-strong)]" },
    "in-progress": { bg: isDark ? "bg-[#78350F]" : "bg-[#FEF3C7]", text: "text-[#D97706]" },
    completed: { bg: isDark ? "bg-[#064E3B]" : "bg-[#D1FAE5]", text: "text-[#059669]" },
  };

  const handleEnroll = (id: string) => {
    const prog = programs.find((p) => p.id === id);
    if (prog && prog.enrolled < prog.capacity) {
      updateTrainingProgram(id, { enrolled: prog.enrolled + 1 });
      toast.success(t("train.enroll") + "!");
    }
  };

  const resetForm = () => {
    setForm({ title: "", category: "Technical", instructor: "", startDate: "", endDate: "", capacity: 15, status: "upcoming" });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      updateTrainingProgram(editId, { ...form });
      toast.success("Program updated");
    } else {
      addTrainingProgram({ id: `TR${String(Date.now()).slice(-6)}`, ...form, enrolled: 0 });
      toast.success("Program created");
    }
    resetForm();
  };

  const handleEdit = (id: string) => {
    const prog = programs.find((p) => p.id === id);
    if (!prog) return;
    setForm({ title: prog.title, category: prog.category, instructor: prog.instructor, startDate: prog.startDate, endDate: prog.endDate, capacity: prog.capacity, status: prog.status });
    setEditId(id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteTrainingProgram(id);
    setDeleteConfirm(null);
    toast.success("Program deleted");
  };

  const inputClass = "w-full px-3 py-2.5 rounded-lg outline-none focus:border-[var(--acc-primary-strong)] focus:ring-2 focus:ring-[var(--acc-primary-strong)]/10 transition-all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 style={{ fontSize: 24, fontWeight: 700, color: textPrimary }}>{t("train.title")}</h2>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white rounded-lg" style={{ fontSize: 13, fontWeight: 600 }}><Plus className="w-4 h-4" /> {t("train.createProgram")}</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: t("train.activePrograms"), value: programs.filter((p) => p.status !== "completed").length, icon: BookOpen, color: "var(--acc-primary-strong)", bg: isDark ? "var(--acc-tint-dark)" : "var(--acc-tint-light)" },
          { label: t("train.totalEnrollments"), value: programs.reduce((s, p) => s + p.enrolled, 0), icon: Users, color: "#10B981", bg: isDark ? "#064E3B" : "#D1FAE5" },
          { label: t("train.completionRate"), value: programs.length > 0 ? `${Math.round(programs.filter((p) => p.status === "completed").length / programs.length * 100)}%` : "0%", icon: GraduationCap, color: "#F59E0B", bg: isDark ? "#78350F" : "#FEF3C7" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border p-5 flex items-center gap-4" style={{ backgroundColor: cardBg, borderColor }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}><s.icon className="w-6 h-6" style={{ color: s.color }} /></div>
            <div><div style={{ fontSize: 22, fontWeight: 700, color: textPrimary }}>{s.value}</div><div style={{ fontSize: 13, color: textSecondary }}>{s.label}</div></div>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border p-6 space-y-4" style={{ backgroundColor: cardBg, borderColor }}>
          <div className="flex items-center justify-between">
            <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }}>{editId ? "Edit Program" : "New Training Program"}</h3>
            <button type="button" onClick={resetForm}><X className="w-4 h-4" style={{ color: textSecondary }} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2 lg:col-span-3"><label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Title</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} /></div>
            <div><label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}><option>Technical</option><option>Management</option><option>Compliance</option><option>Other</option></select></div>
            <div><label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Instructor</label><input value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} /></div>
            <div><label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Capacity</label><input type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 15 })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} /></div>
            <div><label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Start Date</label><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} /></div>
            <div><label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>End Date</label><input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} /></div>
            <div><label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}><option value="upcoming">Upcoming</option><option value="in-progress">In Progress</option><option value="completed">Completed</option></select></div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white rounded-lg" style={{ fontSize: 13, fontWeight: 600 }}><Save className="w-4 h-4" /> {editId ? "Update" : "Create"}</button>
            <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-lg" style={{ fontSize: 13, fontWeight: 500, backgroundColor: isDark ? "#374151" : "#F3F4F6", color: textPrimary }}>Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {programs.map((p) => (
          <div key={p.id} className="rounded-xl border p-5 hover:shadow-md transition-all" style={{ backgroundColor: cardBg, borderColor }}>
            <div className="flex items-start justify-between mb-3">
              <div><div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColors[p.category] || "#6B7280" }} /><span style={{ fontSize: 12, color: textSecondary }}>{p.category}</span></div><h4 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }}>{p.title}</h4></div>
              <div className="flex items-center gap-2">
                <span className={`${statusStyles[p.status].bg} ${statusStyles[p.status].text} px-2.5 py-1 rounded-md`} style={{ fontSize: 11, fontWeight: 600 }}>{p.status}</span>
                <button onClick={() => handleEdit(p.id)} className="p-1.5 rounded hover:bg-[var(--acc-tint-light)]" style={{ color: textSecondary }}><Edit className="w-3.5 h-3.5" /></button>
                <button onClick={() => setDeleteConfirm(p.id)} className="p-1.5 rounded hover:bg-[#FEE2E2]" style={{ color: textSecondary }}><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2" style={{ fontSize: 13, color: textSecondary }}><GraduationCap className="w-4 h-4" />{p.instructor}</div>
              <div className="flex items-center gap-2" style={{ fontSize: 13, color: textSecondary }}><Calendar className="w-4 h-4" />{p.startDate} &rarr; {p.endDate}</div>
            </div>
            <div className="mb-3">
              <div className="flex justify-between mb-1"><span style={{ fontSize: 12, color: textSecondary }}>{t("train.enrollment")}</span><span style={{ fontSize: 12, fontWeight: 600, color: textPrimary }}>{p.enrolled}/{p.capacity}</span></div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? "#374151" : "#F3F4F6" }}><div className="h-full rounded-full bg-[var(--acc-primary-strong)]" style={{ width: `${(p.enrolled / p.capacity) * 100}%` }} /></div>
            </div>
            {p.status !== "completed" && p.enrolled < p.capacity && (
              <button onClick={() => handleEnroll(p.id)} className="w-full px-4 py-2 rounded-lg transition-colors" style={{ fontSize: 13, fontWeight: 500, backgroundColor: isDark ? "var(--acc-tint-dark)" : "var(--acc-tint-light)", color: "var(--acc-primary-strong)" }}>{t("train.enroll")}</button>
            )}
          </div>
        ))}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="rounded-2xl border shadow-2xl w-full max-w-sm p-6" style={{ backgroundColor: cardBg, borderColor }} onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: isDark ? "#7F1D1D" : "#FEE2E2" }}><Trash2 className="w-6 h-6 text-[#DC2626]" /></div>
            <h3 className="text-center mb-2" style={{ fontSize: 18, fontWeight: 600, color: textPrimary }}>Delete Program?</h3>
            <p className="text-center mb-6" style={{ fontSize: 13, color: textSecondary }}>This training program will be permanently removed.</p>
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
