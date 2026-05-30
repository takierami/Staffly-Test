import { useState, useMemo } from "react";
import {
  Plus, Pencil, Trash2, Search, Users, BarChart3, Building2,
  X, Check, RotateCcw, Layers,
} from "lucide-react";
import { useApp, type CategoryItem, type GradeItem } from "../context/AppContext";
import {
  employeeCategories as defaultCategories,
  gradeSystem as defaultGrades,
  departments as defaultDepartments,
} from "../data/mock-data";
import { toast } from "sonner";

type Tab = "categories" | "grades" | "departments";

export function Customization() {
  const { t, theme, lang, categories, setCategories, grades, setGrades, customDepartments, setCustomDepartments } = useApp();
  const isDark = theme === "dark";
  const isAr = lang === "ar";

  const cardBg = isDark ? "#1F2937" : "#ffffff";
  const borderColor = isDark ? "#374151" : "#F3F4F6";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const inputBg = isDark ? "#374151" : "#F9FAFB";
  const inputBorder = isDark ? "#4B5563" : "#E5E7EB";
  const accentBg = isDark ? "var(--acc-tint-dark)" : "var(--acc-tint-light)";

  const [activeTab, setActiveTab] = useState<Tab>("categories");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Category form
  const [catForm, setCatForm] = useState({ id: "", name: "", nameAr: "", department: "" });
  // Grade form
  const [gradeForm, setGradeForm] = useState({ id: "", name: "", nameAr: "" });
  // Department form
  const [deptForm, setDeptForm] = useState("");

  const tabs: { id: Tab; label: string; icon: typeof Users; count: number }[] = [
    { id: "categories", label: t("cust.categories"), icon: Users, count: categories.length },
    { id: "grades", label: t("cust.grades"), icon: BarChart3, count: grades.length },
    { id: "departments", label: t("cust.departments"), icon: Building2, count: customDepartments.length },
  ];

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    const s = searchTerm.toLowerCase();
    return categories.filter(c => c.name.toLowerCase().includes(s) || c.nameAr.includes(s) || c.department.toLowerCase().includes(s) || c.id.toLowerCase().includes(s));
  }, [categories, searchTerm]);

  const filteredGrades = useMemo(() => {
    if (!searchTerm) return grades;
    const s = searchTerm.toLowerCase();
    return grades.filter(g => g.name.toLowerCase().includes(s) || g.nameAr.includes(s) || g.id.toLowerCase().includes(s));
  }, [grades, searchTerm]);

  const filteredDepartments = useMemo(() => {
    if (!searchTerm) return customDepartments;
    const s = searchTerm.toLowerCase();
    return customDepartments.filter(d => d.toLowerCase().includes(s));
  }, [customDepartments, searchTerm]);

  // Group categories by department
  const categoryGroups = useMemo(() => {
    const groups: Record<string, CategoryItem[]> = {};
    filteredCategories.forEach(c => {
      if (!groups[c.department]) groups[c.department] = [];
      groups[c.department].push(c);
    });
    return groups;
  }, [filteredCategories]);

  const openAdd = () => {
    setCatForm({ id: "", name: "", nameAr: "", department: customDepartments[0] || "" });
    setGradeForm({ id: "", name: "", nameAr: "" });
    setDeptForm("");
    setEditingItem(null);
    setShowAddModal(true);
  };

  const openEdit = (id: string) => {
    setEditingItem(id);
    if (activeTab === "categories") {
      const cat = categories.find(c => c.id === id);
      if (cat) setCatForm({ ...cat });
    } else if (activeTab === "grades") {
      const g = grades.find(gr => gr.id === id);
      if (g) setGradeForm({ ...g });
    } else {
      setDeptForm(id);
    }
    setShowAddModal(true);
  };

  const handleSave = () => {
    if (activeTab === "categories") {
      if (!catForm.id || !catForm.name || !catForm.department) return;
      if (editingItem) {
        setCategories(prev => prev.map(c => c.id === editingItem ? { ...catForm } : c));
        toast.success(t("cust.itemUpdated"));
      } else {
        if (categories.some(c => c.id === catForm.id)) {
          toast.error("ID already exists");
          return;
        }
        setCategories(prev => [...prev, { ...catForm }]);
        toast.success(t("cust.itemAdded"));
      }
    } else if (activeTab === "grades") {
      if (!gradeForm.id || !gradeForm.name) return;
      if (editingItem) {
        setGrades(prev => prev.map(g => g.id === editingItem ? { ...gradeForm } : g));
        toast.success(t("cust.itemUpdated"));
      } else {
        if (grades.some(g => g.id === gradeForm.id)) {
          toast.error("ID already exists");
          return;
        }
        setGrades(prev => [...prev, { ...gradeForm }]);
        toast.success(t("cust.itemAdded"));
      }
    } else {
      if (!deptForm.trim()) return;
      if (editingItem) {
        setCustomDepartments(prev => prev.map(d => d === editingItem ? deptForm.trim() : d));
        // Also update categories that reference the old department
        setCategories(prev => prev.map(c => c.department === editingItem ? { ...c, department: deptForm.trim() } : c));
        toast.success(t("cust.itemUpdated"));
      } else {
        if (customDepartments.includes(deptForm.trim())) {
          toast.error("Department already exists");
          return;
        }
        setCustomDepartments(prev => [...prev, deptForm.trim()]);
        toast.success(t("cust.itemAdded"));
      }
    }
    setShowAddModal(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    if (activeTab === "categories") {
      setCategories(prev => prev.filter(c => c.id !== id));
    } else if (activeTab === "grades") {
      setGrades(prev => prev.filter(g => g.id !== id));
    } else {
      setCustomDepartments(prev => prev.filter(d => d !== id));
    }
    setDeleteConfirm(null);
    toast.success(t("cust.itemDeleted"));
  };

  const handleReset = () => {
    if (activeTab === "categories") setCategories([...defaultCategories] as CategoryItem[]);
    else if (activeTab === "grades") setGrades([...defaultGrades] as GradeItem[]);
    else setCustomDepartments([...defaultDepartments]);
    toast.success(t("cust.resetDefaults"));
  };

  const searchPlaceholder = activeTab === "categories" ? t("cust.searchCategories") : activeTab === "grades" ? t("cust.searchGrades") : t("cust.searchDepartments");

  const inputClass = "w-full px-3 py-2.5 rounded-lg outline-none focus:border-[var(--acc-primary-strong)] focus:ring-2 focus:ring-[var(--acc-primary-strong)]/10 transition-all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: textPrimary }} className="flex items-center gap-2">
            <Layers className="w-7 h-7 text-[var(--acc-primary-strong)]" />
            {t("cust.title")}
          </h2>
          <p style={{ fontSize: 14, color: textSecondary }} className="mt-1">{t("cust.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors" style={{ fontSize: 13, fontWeight: 500, backgroundColor: isDark ? "#374151" : "#F3F4F6", color: textPrimary }}>
            <RotateCcw className="w-4 h-4" /> {t("cust.resetDefaults")}
          </button>
          <button onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white rounded-lg hover:shadow-lg transition-all" style={{ fontSize: 13, fontWeight: 600 }}>
            <Plus className="w-4 h-4" />
            {activeTab === "categories" ? t("cust.addCategory") : activeTab === "grades" ? t("cust.addGrade") : t("cust.addDepartment")}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearchTerm(""); }} className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all" style={{ backgroundColor: activeTab === tab.id ? accentBg : "transparent", color: activeTab === tab.id ? "var(--acc-primary-strong)" : textSecondary, fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400 }}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 11, fontWeight: 600, backgroundColor: activeTab === tab.id ? "var(--acc-primary-strong)" : isDark ? "#374151" : "#E5E7EB", color: activeTab === tab.id ? "#ffffff" : textSecondary }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: textSecondary, left: isAr ? "auto" : 12, right: isAr ? 12 : "auto" }} />
        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={searchPlaceholder} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary, paddingLeft: isAr ? 12 : 36, paddingRight: isAr ? 36 : 12 }} />
      </div>

      {/* Content */}
      <div className="rounded-xl border" style={{ backgroundColor: cardBg, borderColor }}>
        {activeTab === "categories" && (
          <div>
            {Object.keys(categoryGroups).length === 0 ? (
              <div className="p-12 text-center" style={{ color: textSecondary, fontSize: 14 }}>{t("cust.noItems")}</div>
            ) : (
              Object.entries(categoryGroups).map(([dept, cats]) => (
                <div key={dept}>
                  <div className="px-4 py-2.5 flex items-center gap-2" style={{ backgroundColor: isDark ? "#111827" : "#F9FAFB", borderBottom: `1px solid ${borderColor}` }}>
                    <Building2 className="w-3.5 h-3.5 text-[var(--acc-primary-strong)]" />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--acc-primary-strong)", textTransform: "uppercase", letterSpacing: 0.5 }}>{dept}</span>
                    <span style={{ fontSize: 11, color: textSecondary }}>({cats.length})</span>
                  </div>
                  {cats.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between px-4 py-3 hover:bg-[var(--muted)]/30 transition-colors" style={{ borderBottom: `1px solid ${borderColor}` }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 rounded" style={{ fontSize: 10, fontWeight: 600, backgroundColor: isDark ? "#374151" : "#F3F4F6", color: textSecondary, fontFamily: "monospace" }}>{cat.id}</span>
                          <span style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{isAr ? cat.nameAr : cat.name}</span>
                          {!isAr && cat.nameAr && <span style={{ fontSize: 12, color: textSecondary, direction: "rtl" }}>{cat.nameAr}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(cat.id)} className="p-2 rounded-lg hover:bg-[var(--acc-primary-strong)]/10 transition-colors" title={t("cust.edit")}>
                          <Pencil className="w-3.5 h-3.5 text-[var(--acc-primary-strong)]" />
                        </button>
                        {deleteConfirm === cat.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"><Check className="w-3.5 h-3.5 text-red-500" /></button>
                            <button onClick={() => setDeleteConfirm(null)} className="p-2 rounded-lg hover:bg-gray-500/10 transition-colors"><X className="w-3.5 h-3.5" style={{ color: textSecondary }} /></button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(cat.id)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors" title={t("cust.delete")}>
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "grades" && (
          <div>
            {filteredGrades.length === 0 ? (
              <div className="p-12 text-center" style={{ color: textSecondary, fontSize: 14 }}>{t("cust.noItems")}</div>
            ) : filteredGrades.map(g => (
              <div key={g.id} className="flex items-center justify-between px-4 py-3 hover:bg-[var(--muted)]/30 transition-colors" style={{ borderBottom: `1px solid ${borderColor}` }}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: accentBg, fontSize: 13, fontWeight: 700, color: "var(--acc-primary-strong)" }}>{g.id}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{isAr ? g.nameAr : g.name}</div>
                    {!isAr && g.nameAr && <div style={{ fontSize: 12, color: textSecondary, direction: "rtl" }}>{g.nameAr}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(g.id)} className="p-2 rounded-lg hover:bg-[var(--acc-primary-strong)]/10 transition-colors"><Pencil className="w-3.5 h-3.5 text-[var(--acc-primary-strong)]" /></button>
                  {deleteConfirm === g.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDelete(g.id)} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"><Check className="w-3.5 h-3.5 text-red-500" /></button>
                      <button onClick={() => setDeleteConfirm(null)} className="p-2 rounded-lg hover:bg-gray-500/10 transition-colors"><X className="w-3.5 h-3.5" style={{ color: textSecondary }} /></button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(g.id)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "departments" && (
          <div>
            {filteredDepartments.length === 0 ? (
              <div className="p-12 text-center" style={{ color: textSecondary, fontSize: 14 }}>{t("cust.noItems")}</div>
            ) : filteredDepartments.map(dept => {
              const catCount = categories.filter(c => c.department === dept).length;
              return (
                <div key={dept} className="flex items-center justify-between px-4 py-3 hover:bg-[var(--muted)]/30 transition-colors" style={{ borderBottom: `1px solid ${borderColor}` }}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: accentBg }}>
                      <Building2 className="w-5 h-5 text-[var(--acc-primary-strong)]" />
                    </span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{dept}</div>
                      <div style={{ fontSize: 12, color: textSecondary }}>{catCount} {t("cust.categories").toLowerCase()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(dept)} className="p-2 rounded-lg hover:bg-[var(--acc-primary-strong)]/10 transition-colors"><Pencil className="w-3.5 h-3.5 text-[var(--acc-primary-strong)]" /></button>
                    {deleteConfirm === dept ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(dept)} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"><Check className="w-3.5 h-3.5 text-red-500" /></button>
                        <button onClick={() => setDeleteConfirm(null)} className="p-2 rounded-lg hover:bg-gray-500/10 transition-colors"><X className="w-3.5 h-3.5" style={{ color: textSecondary }} /></button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(dept)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Add Button (mobile) */}
      <button onClick={openAdd} className="fixed bottom-6 right-6 lg:hidden w-14 h-14 rounded-full bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white shadow-xl flex items-center justify-center hover:shadow-2xl transition-all z-30">
        <Plus className="w-6 h-6" />
      </button>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="w-full max-w-md rounded-xl shadow-2xl" style={{ backgroundColor: cardBg }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${borderColor}` }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }}>
                {editingItem ? t("cust.edit") : activeTab === "categories" ? t("cust.addCategory") : activeTab === "grades" ? t("cust.addGrade") : t("cust.addDepartment")}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-gray-500/10"><X className="w-5 h-5" style={{ color: textSecondary }} /></button>
            </div>
            <div className="p-5 space-y-4">
              {activeTab === "categories" && (
                <>
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("cust.id")}</label>
                    <input value={catForm.id} onChange={e => setCatForm(p => ({ ...p, id: e.target.value.toLowerCase().replace(/\s+/g, "_") }))} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} placeholder="e.g. data_engineer" disabled={!!editingItem} />
                  </div>
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("cust.name")} (EN)</label>
                    <input value={catForm.name} onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} placeholder="e.g. Data Engineer" />
                  </div>
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("cust.nameAr")}</label>
                    <input value={catForm.nameAr} onChange={e => setCatForm(p => ({ ...p, nameAr: e.target.value }))} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} dir="rtl" placeholder="مهندس بيانات" />
                  </div>
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("cust.department")}</label>
                    <select value={catForm.department} onChange={e => setCatForm(p => ({ ...p, department: e.target.value }))} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}>
                      {customDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </>
              )}
              {activeTab === "grades" && (
                <>
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("cust.id")}</label>
                    <input value={gradeForm.id} onChange={e => setGradeForm(p => ({ ...p, id: e.target.value.toUpperCase().replace(/\s+/g, "") }))} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} placeholder="e.g. G11" disabled={!!editingItem} />
                  </div>
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("cust.name")} (EN)</label>
                    <input value={gradeForm.name} onChange={e => setGradeForm(p => ({ ...p, name: e.target.value }))} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} placeholder="e.g. Grade 11 - Fellow" />
                  </div>
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("cust.nameAr")}</label>
                    <input value={gradeForm.nameAr} onChange={e => setGradeForm(p => ({ ...p, nameAr: e.target.value }))} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} dir="rtl" placeholder="الرتبة 11 - زميل" />
                  </div>
                </>
              )}
              {activeTab === "departments" && (
                <div>
                  <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("cust.name")}</label>
                  <input value={deptForm} onChange={e => setDeptForm(e.target.value)} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} placeholder="e.g. Research & Development" />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 px-5 py-4" style={{ borderTop: `1px solid ${borderColor}` }}>
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2.5 rounded-lg transition-colors" style={{ fontSize: 13, fontWeight: 500, backgroundColor: isDark ? "#374151" : "#F3F4F6", color: textPrimary }}>{t("cust.cancel")}</button>
              <button onClick={handleSave} className="px-5 py-2.5 bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white rounded-lg hover:shadow-lg transition-all" style={{ fontSize: 13, fontWeight: 600 }}>{t("cust.save")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}