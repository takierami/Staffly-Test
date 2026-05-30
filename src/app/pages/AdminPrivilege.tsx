import { useState } from "react";
import { Shield, Plus, Search, MoreVertical, Eye, EyeOff, UserCheck, UserX, Key, Trash2, Edit2, Lock, Activity, Crown, Users, Building2, AlertTriangle, CheckCircle2, XCircle, Clock, X } from "lucide-react";
import { useAuth, type ManagedAccount, type UserRole, type AccountStatus } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";

const ROLE_COLORS: Record<UserRole, { bg: string; text: string; darkBg: string }> = {
  admin: { bg: "#FEF3C7", text: "#D97706", darkBg: "#3B2A0A" },
  hr_manager: { bg: "#EFF6FF", text: "#2563EB", darkBg: "#1E2A4A" },
  employee: { bg: "#F0FDF4", text: "#16A34A", darkBg: "#0F2A1A" },
};

const STATUS_CONFIG: Record<AccountStatus, { icon: typeof CheckCircle2; color: string; label: string; labelAr: string }> = {
  active: { icon: CheckCircle2, color: "#22C55E", label: "Active", labelAr: "نشط" },
  frozen: { icon: Lock, color: "#3B82F6", label: "Frozen", labelAr: "مجمّد" },
  suspended: { icon: AlertTriangle, color: "#F59E0B", label: "Suspended", labelAr: "موقوف" },
  disabled: { icon: XCircle, color: "#EF4444", label: "Disabled", labelAr: "معطّل" },
};

interface AccountFormData {
  name: string;
  nameAr: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  position: string;
  employeeId: string;
}

const EMPTY_FORM: AccountFormData = {
  name: "", nameAr: "", email: "", password: "", role: "employee",
  department: "", position: "", employeeId: "",
};

export function AdminPrivilege() {
  const { accounts, createAccount, updateAccount, deleteAccount, resetPassword, setAccountStatus, currentUser, can } = useAuth();
  const { t, theme, isRTL, lang } = useApp();

  const isDark = theme === "dark";
  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const border = isDark ? "#334155" : "#E2E8F0";
  const textPrimary = isDark ? "#F1F5F9" : "#0F172A";
  const textSecondary = isDark ? "#94A3B8" : "#64748B";
  const inputBg = isDark ? "#0F172A" : "#F8FAFC";
  const pageBg = isDark ? "#0F172A" : "#F8FAFC";

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "all">("all");
  const [filterStatus, setFilterStatus] = useState<AccountStatus | "all">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ManagedAccount | null>(null);
  const [resetingId, setResetingId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AccountFormData>(EMPTY_FORM);
  const [formPassword, setFormPassword] = useState("");
  const [showFormPw, setShowFormPw] = useState(false);
  const [activeTab, setActiveTab] = useState<"accounts" | "activity">("accounts");

  if (!can("admin_privilege")) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4" style={{ color: textSecondary }}>
        <Shield className="w-12 h-12" style={{ color: "#EF4444" }} />
        <p className="text-lg font-semibold" style={{ color: textPrimary }}>
          {isRTL ? "وصول مرفوض" : "Access Denied"}
        </p>
        <p className="text-sm">{isRTL ? "هذه المنطقة مخصصة للمسؤولين فقط." : "This area is restricted to administrators only."}</p>
      </div>
    );
  }

  const filtered = accounts.filter((acc) => {
    const matchSearch =
      acc.name.toLowerCase().includes(search.toLowerCase()) ||
      acc.email.toLowerCase().includes(search.toLowerCase()) ||
      acc.employeeId?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || acc.role === filterRole;
    const matchStatus = filterStatus === "all" || acc.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const stats = {
    total: accounts.length,
    active: accounts.filter((a) => a.status === "active").length,
    admins: accounts.filter((a) => a.role === "admin").length,
    frozen: accounts.filter((a) => a.status === "frozen" || a.status === "suspended").length,
  };

  const openEdit = (acc: ManagedAccount) => {
    setEditingAccount(acc);
    setFormData({ name: acc.name, nameAr: acc.nameAr, email: acc.email, password: "", role: acc.role, department: acc.department || "", position: acc.position || "", employeeId: acc.employeeId || "" });
    setFormPassword("");
    setShowCreateModal(true);
  };

  const handleCreate = () => {
    if (!formData.name || !formData.email || (!editingAccount && !formPassword)) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (editingAccount) {
      updateAccount(editingAccount.id, {
        name: formData.name,
        nameAr: formData.nameAr,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        position: formData.position,
        employeeId: formData.employeeId,
        ...(formPassword ? { password: formPassword } : {}),
      });
      toast.success(isRTL ? "تم تحديث الحساب" : "Account updated successfully");
    } else {
      createAccount({
        name: formData.name,
        nameAr: formData.nameAr,
        email: formData.email,
        password: formPassword,
        role: formData.role,
        status: "active",
        department: formData.department,
        position: formData.position,
        employeeId: formData.employeeId,
        createdBy: currentUser?.id || "admin",
      });
      toast.success(isRTL ? "تم إنشاء الحساب" : "Account created successfully");
    }
    setShowCreateModal(false);
    setEditingAccount(null);
    setFormData(EMPTY_FORM);
    setFormPassword("");
  };

  const handleResetPassword = () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error(isRTL ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters");
      return;
    }
    resetPassword(resetingId!, newPassword);
    toast.success(isRTL ? "تم إعادة تعيين كلمة المرور" : "Password reset successfully");
    setResetingId(null);
    setNewPassword("");
  };

  const handleStatusChange = (id: string, status: AccountStatus) => {
    setAccountStatus(id, status);
    setOpenMenuId(null);
    toast.success(isRTL ? "تم تحديث حالة الحساب" : `Account status updated to ${status}`);
  };

  const handleDelete = (acc: ManagedAccount) => {
    if (acc.id === currentUser?.id) {
      toast.error(isRTL ? "لا يمكنك حذف حسابك الخاص" : "You cannot delete your own account");
      return;
    }
    deleteAccount(acc.id);
    toast.success(isRTL ? "تم حذف الحساب" : "Account deleted");
    setOpenMenuId(null);
  };

  return (
    <div style={{ background: pageBg, minHeight: "100%" }}>
      {/* Header */}
      <div
        className="rounded-2xl p-5 mb-6 flex items-center gap-4"
        style={{ background: isDark ? "#1E293B" : "#0F172A", border: `1px solid ${isDark ? "#334155" : "transparent"}` }}
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shrink-0">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white">{isRTL ? "صلاحية المسؤول" : "Admin Privilege"}</h1>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-red-500/20 text-red-400">
              {isRTL ? "مقيّد" : "RESTRICTED"}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-0.5">
            {isRTL ? "إدارة حسابات المستخدمين، الصلاحيات، ودورة حياة الحسابات" : "Manage user accounts, permissions, and account lifecycle"}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-slate-400">{isRTL ? "حساب" : "Accounts"}</div>
          </div>
          <div className="w-px h-10 bg-slate-600" />
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">{stats.active}</div>
            <div className="text-xs text-slate-400">{isRTL ? "نشط" : "Active"}</div>
          </div>
          <div className="w-px h-10 bg-slate-600" />
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">{stats.frozen}</div>
            <div className="text-xs text-slate-400">{isRTL ? "موقوف" : "Restricted"}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {([["accounts", isRTL ? "الحسابات" : "Accounts"], ["activity", isRTL ? "سجل النشاط" : "Activity Log"]] as const).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: activeTab === tab ? "var(--acc-primary)" : (isDark ? "#1E293B" : "#F1F5F9"),
              color: activeTab === tab ? "#fff" : textSecondary,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "accounts" && (
        <>
          {/* Toolbar */}
          <div className={`flex flex-wrap gap-3 mb-5 ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className="relative flex-1 min-w-48">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 ${isRTL ? "right-3" : "left-3"}`} style={{ color: textSecondary }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isRTL ? "بحث عن حساب..." : "Search accounts..."}
                className="w-full rounded-xl border py-2 text-sm outline-none"
                style={{ background: cardBg, borderColor: border, color: textPrimary, paddingLeft: isRTL ? "0.75rem" : "2.25rem", paddingRight: isRTL ? "2.25rem" : "0.75rem" }}
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as UserRole | "all")}
              className="rounded-xl border px-3 py-2 text-sm outline-none"
              style={{ background: cardBg, borderColor: border, color: textPrimary }}
            >
              <option value="all">{isRTL ? "جميع الأدوار" : "All Roles"}</option>
              <option value="admin">{isRTL ? "مسؤول" : "Admin"}</option>
              <option value="hr_manager">{isRTL ? "مدير HR" : "HR Manager"}</option>
              <option value="employee">{isRTL ? "موظف" : "Employee"}</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as AccountStatus | "all")}
              className="rounded-xl border px-3 py-2 text-sm outline-none"
              style={{ background: cardBg, borderColor: border, color: textPrimary }}
            >
              <option value="all">{isRTL ? "جميع الحالات" : "All Status"}</option>
              <option value="active">{isRTL ? "نشط" : "Active"}</option>
              <option value="frozen">{isRTL ? "مجمّد" : "Frozen"}</option>
              <option value="suspended">{isRTL ? "موقوف" : "Suspended"}</option>
              <option value="disabled">{isRTL ? "معطّل" : "Disabled"}</option>
            </select>
            <button
              onClick={() => { setEditingAccount(null); setFormData(EMPTY_FORM); setFormPassword(""); setShowCreateModal(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white"
              style={{ background: "var(--acc-primary)" }}
            >
              <Plus className="w-4 h-4" />
              <span>{isRTL ? "إنشاء حساب" : "Create Account"}</span>
            </button>
          </div>

          {/* Accounts table */}
          <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${border}` }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${border}`, background: isDark ? "#0F172A" : "#F8FAFC" }}>
                    {[
                      isRTL ? "المستخدم" : "User",
                      isRTL ? "الدور" : "Role",
                      isRTL ? "الحالة" : "Status",
                      isRTL ? "آخر تسجيل" : "Last Login",
                      isRTL ? "عدد الدخولات" : "Logins",
                      isRTL ? "الإجراءات" : "Actions",
                    ].map((h) => (
                      <th key={h} className="px-4 py-3 font-semibold text-left" style={{ color: textSecondary }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((acc) => {
                    const roleColors = ROLE_COLORS[acc.role];
                    const statusCfg = STATUS_CONFIG[acc.status];
                    const StatusIcon = statusCfg.icon;
                    return (
                      <tr key={acc.id} style={{ borderBottom: `1px solid ${border}` }} className="hover:bg-[var(--muted)]/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
                              style={{ background: "var(--acc-primary)", color: "#fff" }}
                            >
                              {acc.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold" style={{ color: textPrimary }}>{lang === "ar" ? acc.nameAr : acc.name}</div>
                              <div style={{ color: textSecondary }}>{acc.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ background: isDark ? roleColors.darkBg : roleColors.bg, color: roleColors.text }}
                          >
                            {acc.role === "admin" && <Crown className="w-3 h-3" />}
                            {acc.role === "hr_manager" && <Users className="w-3 h-3" />}
                            {acc.role === "employee" && <Building2 className="w-3 h-3" />}
                            {acc.role === "admin" ? (isRTL ? "مسؤول" : "Admin") : acc.role === "hr_manager" ? (isRTL ? "مدير HR" : "HR Manager") : (isRTL ? "موظف" : "Employee")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: statusCfg.color }}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {isRTL ? statusCfg.labelAr : statusCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs flex items-center gap-1" style={{ color: textSecondary }}>
                            <Clock className="w-3 h-3" />
                            {acc.lastLogin ? new Date(acc.lastLogin).toLocaleDateString() : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold" style={{ color: textPrimary }}>{acc.loginCount}</span>
                          {acc.failedAttempts > 0 && (
                            <span className="ml-2 text-xs text-red-500">({acc.failedAttempts} {isRTL ? "فشل" : "failed"})</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenuId(openMenuId === acc.id ? null : acc.id)}
                              className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors"
                              style={{ color: textSecondary }}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {openMenuId === acc.id && (
                              <div
                                className="absolute right-0 top-8 w-48 rounded-xl shadow-xl border z-50 py-1 overflow-hidden"
                                style={{ background: cardBg, borderColor: border }}
                              >
                                <button onClick={() => { openEdit(acc); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--muted)] transition-colors" style={{ color: textPrimary }}>
                                  <Edit2 className="w-3.5 h-3.5" /> {isRTL ? "تعديل" : "Edit Account"}
                                </button>
                                <button onClick={() => { setResetingId(acc.id); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--muted)] transition-colors" style={{ color: textPrimary }}>
                                  <Key className="w-3.5 h-3.5" /> {isRTL ? "إعادة تعيين كلمة المرور" : "Reset Password"}
                                </button>
                                <div className="h-px my-1" style={{ background: border }} />
                                {(["active", "frozen", "suspended", "disabled"] as AccountStatus[]).filter((s) => s !== acc.status).map((s) => {
                                  const cfg = STATUS_CONFIG[s];
                                  const StatusIco = cfg.icon;
                                  return (
                                    <button key={s} onClick={() => handleStatusChange(acc.id, s)} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--muted)] transition-colors" style={{ color: cfg.color }}>
                                      <StatusIco className="w-3.5 h-3.5" />
                                      {isRTL ? `تعيين كـ ${cfg.labelAr}` : `Set as ${cfg.label}`}
                                    </button>
                                  );
                                })}
                                <div className="h-px my-1" style={{ background: border }} />
                                <button onClick={() => handleDelete(acc)} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 transition-colors text-red-500">
                                  <Trash2 className="w-3.5 h-3.5" /> {isRTL ? "حذف الحساب" : "Delete Account"}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: textSecondary }}>
                        {isRTL ? "لا توجد حسابات" : "No accounts found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === "activity" && (
        <div className="rounded-2xl p-6" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5" style={{ color: "var(--acc-primary)" }} />
            <h3 className="font-semibold" style={{ color: textPrimary }}>{isRTL ? "سجل نشاط الحسابات" : "Account Activity Log"}</h3>
          </div>
          <div className="space-y-3">
            {accounts.slice(0, 10).map((acc) => (
              <div key={acc.id} className={`flex items-center gap-3 py-2.5 border-b ${isRTL ? "flex-row-reverse" : ""}`} style={{ borderColor: border }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs" style={{ background: "var(--acc-primary)", color: "#fff" }}>
                  {acc.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <span className="font-medium text-sm" style={{ color: textPrimary }}>{lang === "ar" ? acc.nameAr : acc.name}</span>
                  <span className="mx-2 text-xs" style={{ color: textSecondary }}>
                    {isRTL ? `سجّل الدخول ${acc.loginCount} مرة` : `logged in ${acc.loginCount} times`}
                  </span>
                </div>
                <span className="text-xs" style={{ color: textSecondary }}>
                  {acc.lastLogin ? new Date(acc.lastLogin).toLocaleDateString() : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="w-full max-w-md rounded-2xl shadow-2xl" style={{ background: cardBg, border: `1px solid ${border}` }} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between p-5 border-b ${isRTL ? "flex-row-reverse" : ""}`} style={{ borderColor: border }}>
              <h2 className="font-bold text-base" style={{ color: textPrimary }}>
                {editingAccount ? (isRTL ? "تعديل الحساب" : "Edit Account") : (isRTL ? "إنشاء حساب جديد" : "Create New Account")}
              </h2>
              <button onClick={() => setShowCreateModal(false)} style={{ color: textSecondary }}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: textSecondary }}>{isRTL ? "الاسم (إنجليزي)" : "Full Name (EN)"} *</label>
                  <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ background: inputBg, borderColor: border, color: textPrimary }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: textSecondary }}>{isRTL ? "الاسم (عربي)" : "Full Name (AR)"}</label>
                  <input value={formData.nameAr} onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm outline-none" dir="rtl" style={{ background: inputBg, borderColor: border, color: textPrimary }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: textSecondary }}>{isRTL ? "البريد الإلكتروني" : "Work Email"} *</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ background: inputBg, borderColor: border, color: textPrimary }} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: textSecondary }}>{isRTL ? "كلمة المرور" : "Password"} {!editingAccount && "*"}</label>
                <div className="relative">
                  <input type={showFormPw ? "text" : "password"} value={formPassword} onChange={(e) => setFormPassword(e.target.value)} placeholder={editingAccount ? (isRTL ? "اتركه فارغاً لعدم التغيير" : "Leave blank to keep unchanged") : ""} className="w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none" style={{ background: inputBg, borderColor: border, color: textPrimary }} />
                  <button type="button" onClick={() => setShowFormPw(!showFormPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: textSecondary }}>
                    {showFormPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: textSecondary }}>{isRTL ? "الدور" : "Role"}</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })} className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ background: inputBg, borderColor: border, color: textPrimary }}>
                  <option value="employee">{isRTL ? "موظف" : "Employee"}</option>
                  <option value="hr_manager">{isRTL ? "مدير HR" : "HR Manager"}</option>
                  <option value="admin">{isRTL ? "مسؤول" : "Admin"}</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: textSecondary }}>{isRTL ? "القسم" : "Department"}</label>
                  <input value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ background: inputBg, borderColor: border, color: textPrimary }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: textSecondary }}>{isRTL ? "المنصب" : "Position"}</label>
                  <input value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ background: inputBg, borderColor: border, color: textPrimary }} />
                </div>
              </div>
            </div>
            <div className={`flex gap-2 p-5 border-t ${isRTL ? "flex-row-reverse" : ""}`} style={{ borderColor: border }}>
              <button onClick={() => setShowCreateModal(false)} className="flex-1 py-2 rounded-xl text-sm font-semibold" style={{ background: isDark ? "#334155" : "#F1F5F9", color: textSecondary }}>
                {isRTL ? "إلغاء" : "Cancel"}
              </button>
              <button onClick={handleCreate} className="flex-1 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--acc-primary)" }}>
                {editingAccount ? (isRTL ? "حفظ التعديلات" : "Save Changes") : (isRTL ? "إنشاء الحساب" : "Create Account")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setResetingId(null)}>
          <div className="w-full max-w-sm rounded-2xl shadow-2xl p-6" style={{ background: cardBg, border: `1px solid ${border}` }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <Key className="w-5 h-5" style={{ color: "var(--acc-primary)" }} />
              <h2 className="font-bold" style={{ color: textPrimary }}>{isRTL ? "إعادة تعيين كلمة المرور" : "Reset Password"}</h2>
            </div>
            <div className="relative mb-4">
              <input
                type={showNewPw ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={isRTL ? "كلمة مرور جديدة (6 أحرف على الأقل)" : "New password (min 6 characters)"}
                className="w-full rounded-xl border px-3 py-2.5 pr-10 text-sm outline-none"
                style={{ background: inputBg, borderColor: border, color: textPrimary }}
              />
              <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: textSecondary }}>
                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <button onClick={() => setResetingId(null)} className="flex-1 py-2 rounded-xl text-sm font-semibold" style={{ background: isDark ? "#334155" : "#F1F5F9", color: textSecondary }}>
                {isRTL ? "إلغاء" : "Cancel"}
              </button>
              <button onClick={handleResetPassword} className="flex-1 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--acc-primary)" }}>
                {isRTL ? "تأكيد" : "Reset"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
