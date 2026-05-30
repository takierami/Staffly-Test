import { useState } from "react";
import { Star, Target, TrendingUp, Plus, Edit, Trash2, X, Save } from "lucide-react";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";

export function Performance() {
  const { t, theme, performanceReviews: reviews, addPerformanceReview, updatePerformanceReview, deletePerformanceReview, employees } = useApp();
  const isDark = theme === "dark";
  const cardBg = isDark ? "#1F2937" : "#ffffff";
  const borderColor = isDark ? "#374151" : "#F3F4F6";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const textMuted = isDark ? "#6B7280" : "#9CA3AF";
  const inputBg = isDark ? "#374151" : "#F9FAFB";
  const inputBorder = isDark ? "#4B5563" : "#E5E7EB";

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ employeeId: "", reviewPeriod: "Q1 2026", rating: 0, status: "pending" as "pending" | "in-progress" | "completed", reviewer: "", goals: [{ title: "", progress: 0 }] });

  const statusStyles: Record<string, { bg: string; text: string }> = {
    pending: { bg: isDark ? "bg-[#78350F]" : "bg-[#FEF3C7]", text: "text-[#D97706]" },
    "in-progress": { bg: isDark ? "bg-[#1E3A5F]" : "bg-[#DBEAFE]", text: "text-[var(--acc-primary-strong)]" },
    completed: { bg: isDark ? "bg-[#064E3B]" : "bg-[#D1FAE5]", text: "text-[#059669]" },
  };

  const avgRating = reviews.filter((r) => r.rating > 0).length > 0 ? (reviews.filter((r) => r.rating > 0).reduce((s, r) => s + r.rating, 0) / reviews.filter((r) => r.rating > 0).length).toFixed(1) : "0";
  const goalsOnTrack = reviews.length > 0 ? Math.round(reviews.flatMap((r) => r.goals).filter((g) => g.progress >= 70).length / Math.max(reviews.flatMap((r) => r.goals).length, 1) * 100) : 0;

  const resetForm = () => {
    setForm({ employeeId: "", reviewPeriod: "Q1 2026", rating: 0, status: "pending", reviewer: "", goals: [{ title: "", progress: 0 }] });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((em) => em.id === form.employeeId);
    if (!emp) return;
    const validGoals = form.goals.filter((g) => g.title.trim());

    if (editId) {
      updatePerformanceReview(editId, {
        employeeId: form.employeeId,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        reviewPeriod: form.reviewPeriod,
        rating: form.rating,
        status: form.status,
        reviewer: form.reviewer,
        goals: validGoals,
      });
      toast.success("Review updated");
    } else {
      addPerformanceReview({
        id: `PF${String(Date.now()).slice(-6)}`,
        employeeId: form.employeeId,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        reviewPeriod: form.reviewPeriod,
        rating: form.rating,
        status: form.status,
        reviewer: form.reviewer,
        goals: validGoals,
      });
      toast.success("Review created");
    }
    resetForm();
  };

  const handleEdit = (id: string) => {
    const rev = reviews.find((r) => r.id === id);
    if (!rev) return;
    setForm({ employeeId: rev.employeeId, reviewPeriod: rev.reviewPeriod, rating: rev.rating, status: rev.status, reviewer: rev.reviewer, goals: rev.goals.length > 0 ? [...rev.goals] : [{ title: "", progress: 0 }] });
    setEditId(id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deletePerformanceReview(id);
    setDeleteConfirm(null);
    toast.success("Review deleted");
  };

  const addGoal = () => setForm({ ...form, goals: [...form.goals, { title: "", progress: 0 }] });
  const updateGoal = (i: number, field: "title" | "progress", val: string | number) => {
    const goals = [...form.goals];
    (goals[i] as any)[field] = field === "progress" ? Number(val) : val;
    setForm({ ...form, goals });
  };
  const removeGoal = (i: number) => setForm({ ...form, goals: form.goals.filter((_, idx) => idx !== i) });

  const inputClass = "w-full px-3 py-2.5 rounded-lg outline-none focus:border-[var(--acc-primary-strong)] focus:ring-2 focus:ring-[var(--acc-primary-strong)]/10 transition-all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 style={{ fontSize: 24, fontWeight: 700, color: textPrimary }}>{t("perf.title")}</h2>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white rounded-lg" style={{ fontSize: 13, fontWeight: 600 }}><Plus className="w-4 h-4" /> {t("perf.newReviewCycle")}</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: t("perf.avgRating"), value: avgRating, icon: Star, color: "#F59E0B", bg: isDark ? "#78350F" : "#FEF3C7" },
          { label: t("perf.reviewsCompleted"), value: `${reviews.filter((r) => r.status === "completed").length}/${reviews.length}`, icon: Target, color: "#10B981", bg: isDark ? "#064E3B" : "#D1FAE5" },
          { label: t("perf.goalsOnTrack"), value: `${goalsOnTrack}%`, icon: TrendingUp, color: "var(--acc-primary-strong)", bg: isDark ? "var(--acc-tint-dark)" : "var(--acc-tint-light)" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border p-5 flex items-center gap-4" style={{ backgroundColor: cardBg, borderColor }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}><s.icon className="w-6 h-6" style={{ color: s.color }} /></div>
            <div><div style={{ fontSize: 22, fontWeight: 700, color: textPrimary }}>{s.value}</div><div style={{ fontSize: 13, color: textSecondary }}>{s.label}</div></div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border p-6 space-y-4" style={{ backgroundColor: cardBg, borderColor }}>
          <div className="flex items-center justify-between">
            <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }}>{editId ? "Edit Review" : "New Performance Review"}</h3>
            <button type="button" onClick={resetForm}><X className="w-4 h-4" style={{ color: textSecondary }} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Employee</label>
              <select required value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}>
                <option value="">Select</option>
                {employees.filter((e) => e.status === "active").map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Period</label>
              <input value={form.reviewPeriod} onChange={(e) => setForm({ ...form, reviewPeriod: e.target.value })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} placeholder="Q1 2026" />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Rating (0-5)</label>
              <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 0 })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Reviewer</label>
              <input value={form.reviewer} onChange={(e) => setForm({ ...form, reviewer: e.target.value })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} />
            </div>
          </div>
          <div>
            <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className={inputClass + " max-w-xs"} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Goals</label>
              <button type="button" onClick={addGoal} className="px-3 py-1 rounded-lg" style={{ fontSize: 12, fontWeight: 500, backgroundColor: isDark ? "var(--acc-tint-dark)" : "var(--acc-tint-light)", color: "var(--acc-primary-strong)" }}>+ Add Goal</button>
            </div>
            {form.goals.map((g, i) => (
              <div key={i} className="flex items-center gap-3 mb-2">
                <input value={g.title} onChange={(e) => updateGoal(i, "title", e.target.value)} placeholder="Goal title" className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} />
                <input type="number" min="0" max="100" value={g.progress} onChange={(e) => updateGoal(i, "progress", e.target.value)} className="w-20 px-3 py-2.5 rounded-lg outline-none" style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} />
                <span style={{ fontSize: 12, color: textMuted }}>%</span>
                {form.goals.length > 1 && <button type="button" onClick={() => removeGoal(i)} className="text-[#DC2626]"><X className="w-4 h-4" /></button>}
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white rounded-lg" style={{ fontSize: 13, fontWeight: 600 }}><Save className="w-4 h-4" /> {editId ? "Update" : "Create"}</button>
            <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-lg" style={{ fontSize: 13, fontWeight: 500, backgroundColor: isDark ? "#374151" : "#F3F4F6", color: textPrimary }}>Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-xl border p-5 hover:shadow-md transition-all duration-300" style={{ backgroundColor: cardBg, borderColor }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--acc-primary)] to-[var(--acc-primary-soft)] flex items-center justify-center text-white" style={{ fontSize: 12, fontWeight: 600 }}>{r.employeeName.split(" ").map((n) => n[0]).join("")}</div>
                <div><div style={{ fontSize: 14, fontWeight: 600, color: textPrimary }}>{r.employeeName}</div><div style={{ fontSize: 12, color: textMuted }}>{r.reviewPeriod} &middot; {r.reviewer}</div></div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`${statusStyles[r.status].bg} ${statusStyles[r.status].text} px-2.5 py-1 rounded-md`} style={{ fontSize: 11, fontWeight: 600 }}>{r.status}</span>
                <button onClick={() => handleEdit(r.id)} className="p-1.5 rounded hover:bg-[var(--acc-tint-light)]" style={{ color: textSecondary }}><Edit className="w-3.5 h-3.5" /></button>
                <button onClick={() => setDeleteConfirm(r.id)} className="p-1.5 rounded hover:bg-[#FEE2E2]" style={{ color: textSecondary }}><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            {r.rating > 0 && (<div className="flex items-center gap-2 mb-4"><div className="flex gap-0.5">{[1,2,3,4,5].map((s) => <Star key={s} className={`w-4 h-4 ${s <= r.rating ? "text-[#F59E0B] fill-[#F59E0B]" : "text-[#E5E7EB]"}`} />)}</div><span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{r.rating}/5</span></div>)}
            <div className="space-y-3"><div style={{ fontSize: 12, fontWeight: 600, color: textSecondary }}>{t("perf.goals")}</div>
              {r.goals.map((g, i) => (<div key={i}><div className="flex justify-between mb-1"><span style={{ fontSize: 13, color: textPrimary }}>{g.title}</span><span style={{ fontSize: 12, fontWeight: 600, color: textSecondary }}>{g.progress}%</span></div><div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? "#374151" : "#F3F4F6" }}><div className="h-full rounded-full" style={{ width: `${g.progress}%`, backgroundColor: g.progress >= 80 ? "#10B981" : g.progress >= 50 ? "#F59E0B" : "#EF4444" }} /></div></div>))}
            </div>
          </div>
        ))}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="rounded-2xl border shadow-2xl w-full max-w-sm p-6" style={{ backgroundColor: cardBg, borderColor }} onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: isDark ? "#7F1D1D" : "#FEE2E2" }}><Trash2 className="w-6 h-6 text-[#DC2626]" /></div>
            <h3 className="text-center mb-2" style={{ fontSize: 18, fontWeight: 600, color: textPrimary }}>Delete Review?</h3>
            <p className="text-center mb-6" style={{ fontSize: 13, color: textSecondary }}>This review will be permanently removed.</p>
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
