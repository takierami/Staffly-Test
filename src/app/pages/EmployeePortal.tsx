import { useState } from "react";
import { CalendarDays, FileText, GraduationCap, User, Bell, LogOut, Sun, Moon, Languages, Home, ChevronRight, Plus, CheckCircle2, Clock, XCircle, Building2, Award, BookOpen, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import stafflyLogo from "@/imports/photo_2026-05-24_18-48-49-removebg-preview__3_.png";

type PortalTab = "home" | "leave" | "documents" | "training" | "profile";

export function EmployeePortal() {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme, lang, setLang, isRTL, t, leaveRequests, addLeaveRequest, updateLeaveRequest, leaveAdjustmentProposals, updateLeaveAdjustmentProposal, trainingPrograms, employees, documents, addDocument, formatDate } = useApp();

  const [activeTab, setActiveTab] = useState<PortalTab>("home");
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ type: "Annual", startDate: "", endDate: "", reason: "" });
  const [showDocReq, setShowDocReq] = useState(false);
  const [docType, setDocType] = useState("Work Certificate");

  const isDark = theme === "dark";
  const bg = isDark ? "#0F172A" : "#F0F4F8";
  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const border = isDark ? "#334155" : "#E2E8F0";
  const textPrimary = isDark ? "#F1F5F9" : "#0F172A";
  const textSecondary = isDark ? "#94A3B8" : "#64748B";
  const inputBg = isDark ? "#0F172A" : "#F8FAFC";

  // Find this employee's actual record
  const myEmployee = employees.find((e) => e.id === currentUser?.employeeId) || employees[0];
  const myLeaves = leaveRequests.filter((l) => l.employeeId === currentUser?.employeeId || l.employeeName === currentUser?.name);
  const myDocuments = documents.filter((d) => d.employeeName === currentUser?.name);
  const availableTraining = trainingPrograms.filter((tp) => tp.status === "upcoming" || tp.status === "in-progress");
  const myProposals = leaveAdjustmentProposals ? leaveAdjustmentProposals.filter((p) => p.status === "pending" && myLeaves.some((l) => l.id === p.leaveRequestId)) : [];

  const leaveStats = {
    annual: { used: myLeaves.filter((l) => l.type === "annual" && l.status === "approved").length, total: 21 },
    sick: { used: myLeaves.filter((l) => l.type === "sick" && l.status === "approved").length, total: 10 },
    pending: myLeaves.filter((l) => l.status === "pending").length,
  };

  const handleSubmitLeave = () => {
    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
      toast.error(isRTL ? "يرجى ملء جميع الحقول" : "Please fill all fields");
      return;
    }
    addLeaveRequest({
      id: `LVR_${Date.now()}`,
      employeeId: currentUser?.employeeId || "EMP003",
      employeeName: currentUser?.name || "Employee",
      type: leaveForm.type.toLowerCase() as "annual" | "sick" | "maternity" | "unpaid",
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      days: Math.ceil((new Date(leaveForm.endDate).getTime() - new Date(leaveForm.startDate).getTime()) / 86400000) + 1,
      reason: leaveForm.reason,
      status: "pending",
      requestDate: new Date().toISOString().split("T")[0],
    });
    toast.success(isRTL ? "تم تقديم طلب الإجازة" : "Leave request submitted successfully");
    setShowLeaveForm(false);
    setLeaveForm({ type: "Annual", startDate: "", endDate: "", reason: "" });
  };

  const handleDocRequest = () => {
    addDocument({
      id: `DOC_${Date.now()}`,
      name: `${docType} - ${currentUser?.name || "Employee"}`,
      type: docType,
      employeeName: currentUser?.name || "Employee",
      generatedDate: new Date().toISOString().split("T")[0],
      status: "pending",
    });
    toast.success(isRTL ? "تم تقديم طلب الوثيقة" : "Document request submitted");
    setShowDocReq(false);
  };

  const nav: { id: PortalTab; icon: typeof Home; label: string; labelAr: string }[] = [
    { id: "home", icon: Home, label: "Home", labelAr: "الرئيسية" },
    { id: "leave", icon: CalendarDays, label: "Leave", labelAr: "الإجازات" },
    { id: "documents", icon: FileText, label: "Documents", labelAr: "المستندات" },
    { id: "training", icon: GraduationCap, label: "Training", labelAr: "التدريب" },
    { id: "profile", icon: User, label: "Profile", labelAr: "ملفي" },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: bg, direction: isRTL ? "rtl" : "ltr" }}>
      {/* Sidebar */}
      <aside className={`w-64 shrink-0 flex flex-col border-${isRTL ? "l" : "r"} hidden md:flex`} style={{ background: cardBg, borderColor: border }}>
        {/* Logo */}
        <div className={`flex items-center gap-2.5 px-5 h-16 border-b ${isRTL ? "flex-row-reverse" : ""}`} style={{ borderColor: border }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #050816, #0d1f3c)" }}>
            <ImageWithFallback src={stafflyLogo} alt="Staffly AI" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <div className="font-bold text-sm" style={{ color: textPrimary }}>Staffly AI</div>
            <div className="text-xs" style={{ color: textSecondary }}>{isRTL ? "بوابة الموظف" : "Employee Portal"}</div>
          </div>
        </div>

        {/* User card */}
        <div className="p-4 border-b" style={{ borderColor: border }}>
          <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0" style={{ background: "var(--acc-primary)", color: "#fff" }}>
              {currentUser?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate" style={{ color: textPrimary }}>
                {lang === "ar" ? currentUser?.nameAr : currentUser?.name}
              </div>
              <div className="text-xs truncate" style={{ color: textSecondary }}>{currentUser?.position}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isRTL ? "flex-row-reverse text-right" : ""}`}
              style={{
                background: activeTab === item.id ? (isDark ? "#1E3A5F" : "#EFF6FF") : "transparent",
                color: activeTab === item.id ? "var(--acc-primary)" : textSecondary,
              }}
            >
              <item.icon className="w-4.5 h-4.5 shrink-0" />
              <span>{isRTL ? item.labelAr : item.label}</span>
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t space-y-1" style={{ borderColor: border }}>
          <button onClick={() => setLang(lang === "en" ? "ar" : "en")} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-[var(--muted)] transition-colors ${isRTL ? "flex-row-reverse text-right" : ""}`} style={{ color: textSecondary }}>
            <Languages className="w-4 h-4" />
            <span>{lang === "en" ? "عربي" : "English"}</span>
          </button>
          <button onClick={toggleTheme} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-[var(--muted)] transition-colors ${isRTL ? "flex-row-reverse text-right" : ""}`} style={{ color: textSecondary }}>
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{isDark ? (isRTL ? "الوضع النهاري" : "Light Mode") : (isRTL ? "الوضع الليلي" : "Dark Mode")}</span>
          </button>
          <button onClick={logout} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-red-50 transition-colors text-red-500 ${isRTL ? "flex-row-reverse text-right" : ""}`}>
            <LogOut className="w-4 h-4" />
            <span>{isRTL ? "تسجيل الخروج" : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar mobile */}
        <header className={`h-14 flex items-center justify-between px-4 border-b md:hidden ${isRTL ? "flex-row-reverse" : ""}`} style={{ background: cardBg, borderColor: border }}>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #050816, #0d1f3c)" }}>
              <ImageWithFallback src={stafflyLogo} alt="Staffly AI" className="w-8 h-8 object-contain" />
            </div>
            <span className="font-bold" style={{ color: textPrimary }}>Staffly AI</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: textSecondary }}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={logout} className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* HOME */}
          {activeTab === "home" && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-bold" style={{ color: textPrimary }}>
                  {isRTL ? `مرحباً، ${currentUser?.nameAr || currentUser?.name}` : `Welcome back, ${currentUser?.name}`}
                </h1>
                <p className="text-sm mt-1" style={{ color: textSecondary }}>
                  {isRTL ? "إليك ملخص يومك" : "Here's your daily summary"}
                </p>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: isRTL ? "إجازات سنوية متبقية" : "Annual Leave Left", value: `${leaveStats.annual.total - leaveStats.annual.used}`, sub: isRTL ? "يوم" : "days", color: "#3B82F6" },
                  { label: isRTL ? "طلبات معلقة" : "Pending Requests", value: String(leaveStats.pending), sub: isRTL ? "طلب" : "requests", color: "#F59E0B" },
                  { label: isRTL ? "دورات تدريبية" : "Training Available", value: String(availableTraining.length), sub: isRTL ? "دورة" : "courses", color: "#8B5CF6" },
                  { label: isRTL ? "وثائق" : "My Documents", value: String(myDocuments.length), sub: isRTL ? "وثيقة" : "docs", color: "#10B981" },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl p-4" style={{ background: cardBg, border: `1px solid ${border}` }}>
                    <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-xs mt-0.5" style={{ color: textSecondary }}>{s.sub}</div>
                    <div className="text-xs font-medium mt-1" style={{ color: textPrimary }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Quick actions */}
              <div className="rounded-2xl p-5" style={{ background: cardBg, border: `1px solid ${border}` }}>
                <h3 className="font-semibold mb-4" style={{ color: textPrimary }}>{isRTL ? "إجراءات سريعة" : "Quick Actions"}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: isRTL ? "طلب إجازة" : "Request Leave", icon: CalendarDays, action: () => { setActiveTab("leave"); setShowLeaveForm(true); } },
                    { label: isRTL ? "طلب وثيقة" : "Request Document", icon: FileText, action: () => { setActiveTab("documents"); setShowDocReq(true); } },
                    { label: isRTL ? "عرض التدريب" : "Browse Training", icon: BookOpen, action: () => setActiveTab("training") },
                    { label: isRTL ? "ملفي الشخصي" : "My Profile", icon: User, action: () => setActiveTab("profile") },
                  ].map((qa) => (
                    <button
                      key={qa.label}
                      onClick={qa.action}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border hover:border-[var(--acc-primary)] transition-all group"
                      style={{ borderColor: border }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isDark ? "#1E3A5F" : "#EFF6FF" }}>
                        <qa.icon className="w-5 h-5" style={{ color: "var(--acc-primary)" }} />
                      </div>
                      <span className="text-xs font-medium text-center" style={{ color: textPrimary }}>{qa.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent leave requests */}
              {myLeaves.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: cardBg, border: `1px solid ${border}` }}>
                  <div className={`flex items-center justify-between mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <h3 className="font-semibold" style={{ color: textPrimary }}>{isRTL ? "طلبات الإجازة الأخيرة" : "Recent Leave Requests"}</h3>
                    <button onClick={() => setActiveTab("leave")} className="text-xs font-medium flex items-center gap-1" style={{ color: "var(--acc-primary)" }}>
                      {isRTL ? "عرض الكل" : "View all"} <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {myLeaves.slice(0, 3).map((l) => {
                      const statusColor = l.status === "approved" ? "#22C55E" : l.status === "rejected" ? "#EF4444" : "#F59E0B";
                      const StatusIcon = l.status === "approved" ? CheckCircle2 : l.status === "rejected" ? XCircle : Clock;
                      return (
                        <div key={l.id} className={`flex items-center justify-between py-2 border-b ${isRTL ? "flex-row-reverse" : ""}`} style={{ borderColor: border }}>
                          <div>
                            <span className="text-sm font-medium" style={{ color: textPrimary }}>{l.type}</span>
                            <span className="mx-2 text-xs" style={{ color: textSecondary }}>{formatDate(l.startDate)} – {formatDate(l.endDate)}</span>
                          </div>
                          <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: statusColor }}>
                            <StatusIcon className="w-3.5 h-3.5" /> {l.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LEAVE */}
          {activeTab === "leave" && (
            <div className="space-y-5">
              <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                <h1 className="text-xl font-bold" style={{ color: textPrimary }}>{isRTL ? "إجازاتي" : "My Leave"}</h1>
                <button onClick={() => setShowLeaveForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--acc-primary)" }}>
                  <Plus className="w-4 h-4" /> {isRTL ? "طلب إجازة" : "Request Leave"}
                </button>
              </div>

              {/* Pending Proposals */}
              {myProposals.length > 0 && (
                <div className="space-y-3">
                  {myProposals.map(proposal => {
                    const originalReq = myLeaves.find(l => l.id === proposal.leaveRequestId);
                    if (!originalReq) return null;
                    return (
                      <div key={proposal.id} className="rounded-2xl p-4 border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                            <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300 mb-1">
                              {isRTL ? "اقتراح تعديل الإجازة من الموارد البشرية" : "Leave Adjustment Proposal from HR"}
                            </h3>
                            <p className="text-xs text-amber-800 dark:text-amber-400/80 mb-3">
                              {isRTL ? `نظراً لتغطية العمل، تقترح الإدارة تعديل إجازتك (${originalReq.type}) لتكون:` : `Due to coverage requirements, HR proposes adjusting your ${originalReq.type} leave to:`}
                              <br />
                              <strong className="mt-1 inline-block">{formatDate(proposal.proposedStartDate)} – {formatDate(proposal.proposedEndDate)}</strong>
                            </p>
                            <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                              <button 
                                onClick={() => {
                                  updateLeaveAdjustmentProposal(proposal.id, { status: "accepted" });
                                  updateLeaveRequest(originalReq.id, { startDate: proposal.proposedStartDate, endDate: proposal.proposedEndDate, status: "approved" });
                                  toast.success(isRTL ? "تم قبول الاقتراح واعتماد الإجازة" : "Proposal accepted. Leave approved.");
                                }}
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors"
                              >
                                {isRTL ? "قبول وتأكيد" : "Accept & Approve"}
                              </button>
                              <button 
                                onClick={() => {
                                  updateLeaveAdjustmentProposal(proposal.id, { status: "rejected" });
                                  toast.info(isRTL ? "تم رفض الاقتراح. الإجازة بانتظار قرار الإدارة." : "Proposal rejected. Leave awaits HR decision.");
                                }}
                                className="px-3 py-1.5 bg-white dark:bg-black/20 border border-amber-300 dark:border-amber-700/50 text-amber-800 dark:text-amber-400 text-xs font-semibold rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                              >
                                {isRTL ? "رفض الاقتراح" : "Reject Proposal"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Balance cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: isRTL ? "إجازة سنوية" : "Annual Leave", used: leaveStats.annual.used, total: leaveStats.annual.total, color: "#3B82F6" },
                  { label: isRTL ? "إجازة مرضية" : "Sick Leave", used: leaveStats.sick.used, total: leaveStats.sick.total, color: "#EF4444" },
                  { label: isRTL ? "إجازة طارئة" : "Emergency", used: 0, total: 3, color: "#F59E0B" },
                ].map((b) => (
                  <div key={b.label} className="rounded-2xl p-4" style={{ background: cardBg, border: `1px solid ${border}` }}>
                    <div className="text-xs font-semibold mb-3" style={{ color: textSecondary }}>{b.label}</div>
                    <div className="flex items-end gap-1 mb-2">
                      <span className="text-2xl font-bold" style={{ color: b.color }}>{b.total - b.used}</span>
                      <span className="text-sm mb-0.5" style={{ color: textSecondary }}>/ {b.total} {isRTL ? "يوم" : "days"}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ background: isDark ? "#334155" : "#E2E8F0" }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${(b.used / b.total) * 100}%`, background: b.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Leave history */}
              <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${border}` }}>
                <div className="px-5 py-3 border-b" style={{ borderColor: border }}>
                  <h3 className="font-semibold text-sm" style={{ color: textPrimary }}>{isRTL ? "سجل الطلبات" : "Request History"}</h3>
                </div>
                {myLeaves.length === 0 ? (
                  <div className="p-10 text-center text-sm" style={{ color: textSecondary }}>{isRTL ? "لا توجد طلبات بعد" : "No leave requests yet"}</div>
                ) : (
                  <div className="divide-y" style={{ borderColor: border }}>
                    {myLeaves.map((l) => {
                      const sc = l.status === "approved" ? "#22C55E" : l.status === "rejected" ? "#EF4444" : "#F59E0B";
                      return (
                        <div key={l.id} className={`flex items-center justify-between px-5 py-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <div>
                            <div className="font-medium text-sm" style={{ color: textPrimary }}>{l.type} Leave · {l.days} {isRTL ? "أيام" : "days"}</div>
                            <div className="text-xs mt-0.5" style={{ color: textSecondary }}>{formatDate(l.startDate)} → {formatDate(l.endDate)}</div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: `${sc}20`, color: sc }}>{l.status}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Leave form modal */}
              {showLeaveForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowLeaveForm(false)}>
                  <div className="w-full max-w-md rounded-2xl shadow-2xl" style={{ background: cardBg, border: `1px solid ${border}` }} onClick={(e) => e.stopPropagation()}>
                    <div className={`flex items-center justify-between p-5 border-b ${isRTL ? "flex-row-reverse" : ""}`} style={{ borderColor: border }}>
                      <h2 className="font-bold" style={{ color: textPrimary }}>{isRTL ? "طلب إجازة جديدة" : "New Leave Request"}</h2>
                      <button onClick={() => setShowLeaveForm(false)} style={{ color: textSecondary }}><XCircle className="w-5 h-5" /></button>
                    </div>
                    <div className="p-5 space-y-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: textSecondary }}>{isRTL ? "نوع الإجازة" : "Leave Type"}</label>
                        <select value={leaveForm.type} onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm outline-none" style={{ background: inputBg, borderColor: border, color: textPrimary }}>
                          {["Annual", "Sick", "Emergency", "Maternity", "Unpaid"].map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold mb-1.5" style={{ color: textSecondary }}>{isRTL ? "من" : "Start Date"}</label>
                          <input type="date" value={leaveForm.startDate} onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm outline-none" style={{ background: inputBg, borderColor: border, color: textPrimary }} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1.5" style={{ color: textSecondary }}>{isRTL ? "إلى" : "End Date"}</label>
                          <input type="date" value={leaveForm.endDate} onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm outline-none" style={{ background: inputBg, borderColor: border, color: textPrimary }} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: textSecondary }}>{isRTL ? "السبب" : "Reason"}</label>
                        <textarea value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} rows={3} className="w-full rounded-xl border px-3 py-2 text-sm outline-none resize-none" style={{ background: inputBg, borderColor: border, color: textPrimary }} />
                      </div>
                    </div>
                    <div className={`flex gap-2 p-5 border-t ${isRTL ? "flex-row-reverse" : ""}`} style={{ borderColor: border }}>
                      <button onClick={() => setShowLeaveForm(false)} className="flex-1 py-2 rounded-xl text-sm font-semibold" style={{ background: isDark ? "#334155" : "#F1F5F9", color: textSecondary }}>{isRTL ? "إلغاء" : "Cancel"}</button>
                      <button onClick={handleSubmitLeave} className="flex-1 py-2 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2" style={{ background: "var(--acc-primary)" }}>
                        <Send className="w-4 h-4" /> {isRTL ? "إرسال الطلب" : "Submit Request"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="space-y-5">
              <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                <h1 className="text-xl font-bold" style={{ color: textPrimary }}>{isRTL ? "وثائقي" : "My Documents"}</h1>
                <button onClick={() => setShowDocReq(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--acc-primary)" }}>
                  <Plus className="w-4 h-4" /> {isRTL ? "طلب وثيقة" : "Request Document"}
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {["Work Certificate", "Salary Certificate", "Experience Letter", "ID Copy"].map((dtype) => (
                  <div key={dtype} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer hover:border-[var(--acc-primary)] transition-all ${isRTL ? "flex-row-reverse" : ""}`} style={{ background: cardBg, border: `1px solid ${border}` }} onClick={() => { setDocType(dtype); setShowDocReq(true); }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: isDark ? "#1E3A5F" : "#EFF6FF" }}>
                      <FileText className="w-5 h-5" style={{ color: "var(--acc-primary)" }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm" style={{ color: textPrimary }}>{dtype}</div>
                      <div className="text-xs" style={{ color: textSecondary }}>{isRTL ? "اضغط للطلب" : "Click to request"}</div>
                    </div>
                    <ChevronRight className="w-4 h-4" style={{ color: textSecondary }} />
                  </div>
                ))}
              </div>

              {myDocuments.length > 0 && (
                <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${border}` }}>
                  <div className="px-5 py-3 border-b" style={{ borderColor: border }}>
                    <h3 className="font-semibold text-sm" style={{ color: textPrimary }}>{isRTL ? "الوثائق المطلوبة" : "Requested Documents"}</h3>
                  </div>
                  <div className="divide-y" style={{ borderColor: border }}>
                    {myDocuments.map((d) => {
                      const sc = d.status === "signed" ? "#22C55E" : d.status === "generated" ? "#3B82F6" : "#F59E0B";
                      return (
                        <div key={d.id} className={`flex items-center justify-between px-5 py-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <div className="font-medium text-sm" style={{ color: textPrimary }}>{d.name}</div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: `${sc}20`, color: sc }}>{d.status}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {showDocReq && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDocReq(false)}>
                  <div className="w-full max-w-sm rounded-2xl shadow-2xl p-6" style={{ background: cardBg, border: `1px solid ${border}` }} onClick={(e) => e.stopPropagation()}>
                    <h2 className="font-bold mb-4" style={{ color: textPrimary }}>{isRTL ? "طلب وثيقة" : "Request Document"}</h2>
                    <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm outline-none mb-4" style={{ background: inputBg, borderColor: border, color: textPrimary }}>
                      {["Work Certificate", "Salary Certificate", "Experience Letter", "ID Copy", "Other"].map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <button onClick={() => setShowDocReq(false)} className="flex-1 py-2 rounded-xl text-sm font-semibold" style={{ background: isDark ? "#334155" : "#F1F5F9", color: textSecondary }}>{isRTL ? "إلغاء" : "Cancel"}</button>
                      <button onClick={handleDocRequest} className="flex-1 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--acc-primary)" }}>{isRTL ? "إرسال" : "Submit"}</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TRAINING */}
          {activeTab === "training" && (
            <div className="space-y-5">
              <h1 className="text-xl font-bold" style={{ color: textPrimary }}>{isRTL ? "الدورات التدريبية المتاحة" : "Available Training"}</h1>
              <div className="grid md:grid-cols-2 gap-4">
                {availableTraining.length === 0 ? (
                  <div className="col-span-2 p-10 text-center rounded-2xl text-sm" style={{ background: cardBg, border: `1px solid ${border}`, color: textSecondary }}>
                    {isRTL ? "لا توجد دورات متاحة حالياً" : "No training courses available right now"}
                  </div>
                ) : availableTraining.map((tp) => (
                  <div key={tp.id} className="rounded-2xl p-5" style={{ background: cardBg, border: `1px solid ${border}` }}>
                    <div className={`flex items-start justify-between mb-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: isDark ? "#2D1B69" : "#F5F3FF" }}>
                        <GraduationCap className="w-5 h-5 text-violet-500" />
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: tp.status === "Active" ? "#DCFCE7" : "#DBEAFE", color: tp.status === "Active" ? "#16A34A" : "#2563EB" }}>
                        {tp.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1" style={{ color: textPrimary }}>{tp.title}</h3>
                    <p className="text-xs mb-3" style={{ color: textSecondary }}>{tp.description || tp.category}</p>
                    <div className={`flex items-center justify-between text-xs ${isRTL ? "flex-row-reverse" : ""}`}>
                      <span style={{ color: textSecondary }}>{tp.instructor} · {tp.duration}</span>
                      <button
                        onClick={() => toast.success(isRTL ? `تم التسجيل في ${tp.title}` : `Enrolled in ${tp.title}`)}
                        className="px-3 py-1 rounded-lg font-semibold text-white"
                        style={{ background: "var(--acc-primary)" }}
                      >
                        {isRTL ? "تسجيل" : "Enroll"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROFILE */}
          {activeTab === "profile" && myEmployee && (
            <div className="space-y-5 max-w-xl">
              <h1 className="text-xl font-bold" style={{ color: textPrimary }}>{isRTL ? "ملفي الشخصي" : "My Profile"}</h1>
              <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${border}` }}>
                <div className="p-6 border-b flex items-center gap-4" style={{ borderColor: border, background: isDark ? "#0F172A" : "#F8FAFC" }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl text-white" style={{ background: "var(--acc-primary)" }}>
                    {currentUser?.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg" style={{ color: textPrimary }}>{lang === "ar" ? currentUser?.nameAr : currentUser?.name}</h2>
                    <p className="text-sm" style={{ color: textSecondary }}>{currentUser?.position}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs text-emerald-600 font-medium">{isRTL ? "نشط" : "Active"}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-2 gap-4">
                  {[
                    { label: isRTL ? "رقم الموظف" : "Employee ID", value: currentUser?.employeeId || "—" },
                    { label: isRTL ? "القسم" : "Department", value: currentUser?.department || "—" },
                    { label: isRTL ? "البريد الإلكتروني" : "Email", value: currentUser?.email || "—" },
                    { label: isRTL ? "تاريخ الانضمام" : "Joined", value: currentUser?.createdAt || "—" },
                    { label: isRTL ? "الصلاحية" : "Access Level", value: isRTL ? "موظف" : "Employee" },
                    { label: isRTL ? "آخر دخول" : "Last Login", value: currentUser?.lastLogin ? new Date(currentUser.lastLogin).toLocaleDateString() : "—" },
                  ].map((f) => (
                    <div key={f.label}>
                      <div className="text-xs font-semibold mb-0.5" style={{ color: textSecondary }}>{f.label}</div>
                      <div className="text-sm font-medium" style={{ color: textPrimary }}>{f.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Promotions / achievements teaser */}
              <div className="rounded-2xl p-5" style={{ background: cardBg, border: `1px solid ${border}` }}>
                <div className={`flex items-center gap-2 mb-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Award className="w-5 h-5" style={{ color: "#F59E0B" }} />
                  <h3 className="font-semibold text-sm" style={{ color: textPrimary }}>{isRTL ? "الإنجازات" : "Achievements"}</h3>
                </div>
                <p className="text-sm" style={{ color: textSecondary }}>{isRTL ? "لا توجد ترقيات أو تقييمات بعد." : "No promotions or evaluations on record yet."}</p>
              </div>
            </div>
          )}
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden border-t flex" style={{ background: cardBg, borderColor: border }}>
          {nav.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className="flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium" style={{ color: activeTab === item.id ? "var(--acc-primary)" : textSecondary }}>
              <item.icon className="w-5 h-5" />
              <span>{isRTL ? item.labelAr : item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
