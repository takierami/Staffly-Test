import { useState, useMemo } from "react";
import {
  Award, Zap, Hand, ChevronUp, ChevronDown, Clock, Users, TrendingUp,
  Plus, Check, X, Search, ArrowUpRight, Sparkles, Shield, ToggleLeft, ToggleRight,
  Bell, AlertTriangle, CalendarClock, Timer, Mail,
} from "lucide-react";
import {
  type PromotionRecord, type PromotionRule,
} from "../data/mock-data";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";
import { sendPromotionNotificationEmail, getNotificationEmail, getWeb3FormsKey } from "../lib/email-service";

type Tab = "mode" | "rules" | "eligible" | "manual" | "history" | "notifications";

export function Promotions() {
  const { t, theme, lang, categories: employeeCategories, grades: gradeSystem, employees, promotionRules: ctxPromotionRules, promotionHistory: ctxPromotionHistory, setPromotionRules: ctxSetPromotionRules, setPromotionHistory: ctxSetPromotionHistory, formatCurrency, formatNumber } = useApp();
  const isDark = theme === "dark";
  const isAr = lang === "ar";

  // Colors
  const cardBg = isDark ? "#1F2937" : "#ffffff";
  const borderColor = isDark ? "#374151" : "#F3F4F6";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const inputBg = isDark ? "#374151" : "#F9FAFB";
  const inputBorder = isDark ? "#4B5563" : "#E5E7EB";
  const accentBg = isDark ? "var(--acc-tint-dark)" : "var(--acc-tint-light)";
  const accentText = "var(--acc-primary-strong)";

  // State
  const [activeTab, setActiveTab] = useState<Tab>("mode");
  const [promotionMode, setPromotionMode] = useState<"automatic" | "manual">("automatic");
  const [rules, setRules] = useState<PromotionRule[]>(ctxPromotionRules);
  const [history, setHistory] = useState<PromotionRecord[]>(ctxPromotionHistory);
  const [showManualModal, setShowManualModal] = useState(false);
  const [searchHistory, setSearchHistory] = useState("");
  const [manualForm, setManualForm] = useState({ employeeId: "", newPosition: "", newGrade: "", newSalary: "", reason: "" });

  // Notification state
  const [dismissedNotifs, setDismissedNotifs] = useState<string[]>([]);
  const [notifFilter, setNotifFilter] = useState<"all" | "overdue" | "due_soon" | "upcoming">("all");

  // Promotion notifications: compute approaching/overdue promotion deadlines
  type PromotionNotification = {
    id: string;
    employeeId: string;
    employeeName: string;
    category: string;
    currentGrade: string;
    nextGrade: string;
    requiredYears: number;
    yearsServed: number;
    daysRemaining: number; // negative = overdue
    urgency: "overdue" | "due_soon" | "upcoming";
    salary: number;
    salaryIncreasePercent: number;
  };

  const notifications = useMemo(() => {
    const today = new Date();
    const notifs: PromotionNotification[] = [];

    employees
      .filter((e) => e.status === "active" && e.category && e.grade)
      .forEach((emp) => {
        const activeRules = rules.filter(
          (r) => r.isActive && r.category === emp.category && r.fromGrade === emp.grade
        );
        activeRules.forEach((rule) => {
          const hireDate = new Date(emp.hireDate);
          const msServed = today.getTime() - hireDate.getTime();
          const daysServed = msServed / (1000 * 60 * 60 * 24);
          const requiredDays = rule.requiredYears * 365.25;
          const daysRemaining = Math.round(requiredDays - daysServed);
          const yearsServed = Math.round((daysServed / 365.25) * 10) / 10;

          // Only show notifications within 12 months of deadline, or overdue
          if (daysRemaining <= 365) {
            let urgency: "overdue" | "due_soon" | "upcoming";
            if (daysRemaining <= 0) urgency = "overdue";
            else if (daysRemaining <= 180) urgency = "due_soon";
            else urgency = "upcoming";

            notifs.push({
              id: `${emp.id}-${rule.id}`,
              employeeId: emp.id,
              employeeName: `${emp.firstName} ${emp.lastName}`,
              category: emp.category,
              currentGrade: emp.grade,
              nextGrade: rule.toGrade,
              requiredYears: rule.requiredYears,
              yearsServed,
              daysRemaining,
              urgency,
              salary: emp.salary,
              salaryIncreasePercent: rule.salaryIncreasePercent,
            });
          }
        });
      });

    // Sort: overdue first, then by days remaining ascending
    return notifs
      .filter((n) => !dismissedNotifs.includes(n.id))
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [rules, dismissedNotifs]);

  const notifCounts = useMemo(() => ({
    overdue: notifications.filter((n) => n.urgency === "overdue").length,
    due_soon: notifications.filter((n) => n.urgency === "due_soon").length,
    upcoming: notifications.filter((n) => n.urgency === "upcoming").length,
    total: notifications.length,
  }), [notifications]);

  const filteredNotifications = notifFilter === "all"
    ? notifications
    : notifications.filter((n) => n.urgency === notifFilter);

  // Eligible employees calculation
  const eligibleEmployees = useMemo(() => {
    if (promotionMode !== "automatic") return [];
    const today = new Date();
    return employees
      .filter((e) => e.status === "active" && e.category && e.grade)
      .map((emp) => {
        const hireDate = new Date(emp.hireDate);
        const years = Math.floor((today.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
        const matchingRule = rules.find(
          (r) => r.isActive && r.category === emp.category && r.fromGrade === emp.grade && years >= r.requiredYears
        );
        if (!matchingRule) return null;
        const toGrade = gradeSystem.find((g) => g.id === matchingRule.toGrade);
        const newSalary = Math.round(emp.salary * (1 + matchingRule.salaryIncreasePercent / 100));
        return { ...emp, years, rule: matchingRule, toGradeName: toGrade ? (isAr ? toGrade.nameAr : toGrade.name) : matchingRule.toGrade, newSalary };
      })
      .filter(Boolean) as any[];
  }, [promotionMode, rules, isAr]);

  const getCategoryName = (id: string) => {
    const cat = employeeCategories.find((c) => c.id === id);
    return cat ? (isAr ? cat.nameAr : cat.name) : id;
  };
  const getGradeName = (id: string) => {
    const g = gradeSystem.find((gr) => gr.id === id);
    return g ? (isAr ? g.nameAr : g.name) : id;
  };

  const stats = useMemo(() => ({
    total: history.length,
    auto: history.filter((h) => h.type === "automatic").length,
    manual: history.filter((h) => h.type === "manual").length,
    eligible: eligibleEmployees.length,
  }), [history, eligibleEmployees]);

  const filteredHistory = history.filter((h) =>
    h.employeeName.toLowerCase().includes(searchHistory.toLowerCase()) ||
    h.category.toLowerCase().includes(searchHistory.toLowerCase())
  );

  const handlePromoteEmployee = (emp: any) => {
    const newRecord: PromotionRecord = {
      id: `PH${String(history.length + 1).padStart(3, "0")}`,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      category: emp.category,
      previousPosition: emp.position,
      newPosition: emp.position,
      previousGrade: emp.grade,
      newGrade: emp.rule.toGrade,
      previousSalary: emp.salary,
      newSalary: emp.newSalary,
      promotionDate: new Date().toISOString().split("T")[0],
      type: "automatic",
      reason: `Completed ${emp.years} years at ${getGradeName(emp.grade)} - Time-based promotion`,
      approvedBy: "System",
      status: "pending",
    };
    setHistory([newRecord, ...history]);
    toast.success(`${emp.firstName} ${emp.lastName} promoted to ${getGradeName(emp.rule.toGrade)}`);
    // Send email notification via Web3Forms
    if (getWeb3FormsKey() && getNotificationEmail()) {
      sendPromotionNotificationEmail({
        employeeName: `${emp.firstName} ${emp.lastName}`,
        category: getCategoryName(emp.category),
        currentGrade: getGradeName(emp.grade),
        nextGrade: getGradeName(emp.rule.toGrade),
        urgency: "overdue",
        detail: `Promoted after ${emp.years} years of service. New salary: ${formatCurrency(emp.newSalary)}`,
      }).then((result) => {
        if (result.success) toast.info("📧 Email notification sent");
      });
    }
  };

  const handleManualSubmit = () => {
    const emp = employees.find((e) => e.id === manualForm.employeeId);
    if (!emp) return;
    const newRecord: PromotionRecord = {
      id: `PH${String(history.length + 1).padStart(3, "0")}`,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      category: emp.category || "",
      previousPosition: emp.position,
      newPosition: manualForm.newPosition,
      previousGrade: emp.grade || "G1",
      newGrade: manualForm.newGrade,
      previousSalary: emp.salary,
      newSalary: parseInt(manualForm.newSalary) || emp.salary,
      promotionDate: new Date().toISOString().split("T")[0],
      type: "manual",
      reason: manualForm.reason,
      approvedBy: "Admin User",
      status: "pending",
    };
    setHistory([newRecord, ...history]);
    setShowManualModal(false);
    setManualForm({ employeeId: "", newPosition: "", newGrade: "", newSalary: "", reason: "" });
    toast.success(`Promotion submitted for ${emp.firstName} ${emp.lastName}`);
  };

  const toggleRule = (id: string) => {
    setRules(rules.map((r) => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "mode", label: t("promo.mode"), icon: Zap },
    { id: "rules", label: t("promo.rules"), icon: Shield },
    { id: "eligible", label: t("promo.eligible"), icon: Users },
    { id: "manual", label: t("promo.manual"), icon: Hand },
    { id: "history", label: t("promo.history"), icon: Clock },
    { id: "notifications", label: t("promo.notifications"), icon: Bell },
  ];

  const inputClass = "w-full px-3 py-2.5 rounded-lg outline-none focus:border-[var(--acc-primary-strong)] focus:ring-2 focus:ring-[var(--acc-primary-strong)]/10 transition-all";

  const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: isDark ? "#78350F" : "#FEF3C7", text: "#D97706" },
    approved: { bg: isDark ? "#1E3A5F" : "#DBEAFE", text: "var(--acc-primary-strong)" },
    effective: { bg: isDark ? "#064E3B" : "#D1FAE5", text: "#059669" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: textPrimary }}>{t("promo.title")}</h2>
          <p style={{ fontSize: 14, color: textSecondary }}>{t("promo.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowManualModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white rounded-lg hover:shadow-lg hover:shadow-[var(--acc-primary-strong)]/30 transition-all hover:-translate-y-0.5"
          style={{ fontSize: 13, fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" /> {t("promo.newPromotion")}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t("promo.totalPromotions"), value: stats.total, icon: Award, color: "var(--acc-primary-strong)", bg: isDark ? "var(--acc-tint-dark)" : "var(--acc-tint-light)" },
          { label: t("promo.autoPromotions"), value: stats.auto, icon: Zap, color: "#059669", bg: isDark ? "#064E3B" : "#D1FAE5" },
          { label: t("promo.manualPromotions"), value: stats.manual, icon: Hand, color: "#D97706", bg: isDark ? "#78350F" : "#FEF3C7" },
          { label: t("promo.eligibleCount"), value: stats.eligible, icon: TrendingUp, color: "var(--acc-primary-strong)", bg: isDark ? "#1E3A5F" : "#DBEAFE" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border p-4" style={{ backgroundColor: cardBg, borderColor }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <span style={{ fontSize: 28, fontWeight: 700, color: textPrimary }}>{s.value}</span>
            </div>
            <p style={{ fontSize: 13, color: textSecondary }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: cardBg, borderColor }}>
        <div className="flex overflow-x-auto border-b" style={{ borderColor }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 whitespace-nowrap transition-colors ${
                activeTab === tab.id ? "border-b-2 border-[var(--acc-primary-strong)]" : "hover:bg-[var(--muted)]"
              }`}
              style={{
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 600 : 400,
                color: activeTab === tab.id ? accentText : textSecondary,
              }}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === "notifications" && notifCounts.total > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full" style={{
                  fontSize: 10,
                  fontWeight: 700,
                  backgroundColor: notifCounts.overdue > 0 ? "#DC2626" : "var(--acc-primary-strong)",
                  color: "#fff",
                }}>{notifCounts.total}</span>
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* MODE TAB */}
          {activeTab === "mode" && (
            <div className="space-y-6">
              <h3 style={{ fontSize: 18, fontWeight: 600, color: textPrimary }}>{t("promo.mode")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Automatic */}
                <button
                  onClick={() => setPromotionMode("automatic")}
                  className={`rounded-xl border-2 p-6 text-left transition-all ${
                    promotionMode === "automatic" ? "border-[var(--acc-primary-strong)] shadow-lg shadow-[var(--acc-primary-strong)]/10" : ""
                  }`}
                  style={{
                    backgroundColor: promotionMode === "automatic" ? accentBg : cardBg,
                    borderColor: promotionMode === "automatic" ? "var(--acc-primary-strong)" : borderColor,
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${promotionMode === "automatic" ? "bg-gradient-to-br from-[var(--acc-primary)] to-[var(--acc-primary-strong)]" : ""}`} style={{ backgroundColor: promotionMode !== "automatic" ? (isDark ? "#374151" : "#F3F4F6") : undefined }}>
                      <Zap className="w-6 h-6" style={{ color: promotionMode === "automatic" ? "#fff" : textSecondary }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }}>{t("promo.automatic")}</h4>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ fontSize: 11, fontWeight: 600, backgroundColor: promotionMode === "automatic" ? "#D1FAE5" : "transparent", color: promotionMode === "automatic" ? "#059669" : "transparent" }}>
                        {promotionMode === "automatic" && <><Check className="w-3 h-3" /> Active</>}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: textSecondary, lineHeight: 1.6 }}>{t("promo.autoDesc")}</p>
                  <div className="mt-4 flex items-center gap-2">
                    {promotionMode === "automatic" ? <ToggleRight className="w-6 h-6 text-[var(--acc-primary-strong)]" /> : <ToggleLeft className="w-6 h-6" style={{ color: textSecondary }} />}
                    <span style={{ fontSize: 12, fontWeight: 600, color: promotionMode === "automatic" ? "var(--acc-primary-strong)" : textSecondary }}>
                      {promotionMode === "automatic" ? t("promo.active") : t("promo.inactive")}
                    </span>
                  </div>
                </button>

                {/* Manual */}
                <button
                  onClick={() => setPromotionMode("manual")}
                  className={`rounded-xl border-2 p-6 text-left transition-all ${
                    promotionMode === "manual" ? "border-[var(--acc-primary-strong)] shadow-lg shadow-[var(--acc-primary-strong)]/10" : ""
                  }`}
                  style={{
                    backgroundColor: promotionMode === "manual" ? accentBg : cardBg,
                    borderColor: promotionMode === "manual" ? "var(--acc-primary-strong)" : borderColor,
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${promotionMode === "manual" ? "bg-gradient-to-br from-[var(--acc-primary)] to-[var(--acc-primary-strong)]" : ""}`} style={{ backgroundColor: promotionMode !== "manual" ? (isDark ? "#374151" : "#F3F4F6") : undefined }}>
                      <Hand className="w-6 h-6" style={{ color: promotionMode === "manual" ? "#fff" : textSecondary }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }}>{t("promo.manual")}</h4>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ fontSize: 11, fontWeight: 600, backgroundColor: promotionMode === "manual" ? "#D1FAE5" : "transparent", color: promotionMode === "manual" ? "#059669" : "transparent" }}>
                        {promotionMode === "manual" && <><Check className="w-3 h-3" /> Active</>}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: textSecondary, lineHeight: 1.6 }}>{t("promo.manualDesc")}</p>
                  <div className="mt-4 flex items-center gap-2">
                    {promotionMode === "manual" ? <ToggleRight className="w-6 h-6 text-[var(--acc-primary-strong)]" /> : <ToggleLeft className="w-6 h-6" style={{ color: textSecondary }} />}
                    <span style={{ fontSize: 12, fontWeight: 600, color: promotionMode === "manual" ? "var(--acc-primary-strong)" : textSecondary }}>
                      {promotionMode === "manual" ? t("promo.active") : t("promo.inactive")}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* RULES TAB */}
          {activeTab === "rules" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 style={{ fontSize: 18, fontWeight: 600, color: textPrimary }}>{t("promo.rules")}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full" style={{ fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
                      {[t("promo.category"), t("promo.fromGrade"), t("promo.toGrade"), t("promo.requiredYears"), t("promo.salaryIncrease"), t("promo.status")].map((h) => (
                        <th key={h} className="py-3 px-4 text-left" style={{ fontWeight: 600, color: textSecondary, fontSize: 12 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-[var(--muted)] transition-colors" style={{ borderBottom: `1px solid ${borderColor}` }}>
                        <td className="py-3 px-4" style={{ color: textPrimary, fontWeight: 500 }}>{getCategoryName(rule.category)}</td>
                        <td className="py-3 px-4"><span className="px-2 py-1 rounded-md" style={{ backgroundColor: isDark ? "#374151" : "#F3F4F6", color: textPrimary, fontSize: 12 }}>{getGradeName(rule.fromGrade)}</span></td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md" style={{ backgroundColor: accentBg, color: accentText, fontSize: 12 }}>
                            <ArrowUpRight className="w-3 h-3" /> {getGradeName(rule.toGrade)}
                          </span>
                        </td>
                        <td className="py-3 px-4" style={{ color: textPrimary }}>{rule.requiredYears} {t("promo.years")}</td>
                        <td className="py-3 px-4"><span style={{ color: "#059669", fontWeight: 600 }}>+{rule.salaryIncreasePercent}%</span></td>
                        <td className="py-3 px-4">
                          <button onClick={() => toggleRule(rule.id)} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full transition-colors" style={{ backgroundColor: rule.isActive ? "#D1FAE5" : (isDark ? "#374151" : "#F3F4F6"), color: rule.isActive ? "#059669" : textSecondary, fontSize: 12, fontWeight: 600 }}>
                            {rule.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            {rule.isActive ? t("promo.active") : t("promo.inactive")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ELIGIBLE TAB */}
          {activeTab === "eligible" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: textPrimary }}>{t("promo.eligible")}</h3>
                  <p style={{ fontSize: 13, color: textSecondary }}>{t("promo.eligibleDesc")}</p>
                </div>
                {eligibleEmployees.length > 0 && (
                  <button
                    onClick={() => { eligibleEmployees.forEach(handlePromoteEmployee); }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#059669] to-[#10B981] text-white rounded-lg hover:shadow-lg transition-all"
                    style={{ fontSize: 13, fontWeight: 600 }}
                  >
                    <Sparkles className="w-4 h-4" /> {t("promo.promoteAll")}
                  </button>
                )}
              </div>

              {promotionMode !== "automatic" ? (
                <div className="text-center py-12">
                  <Zap className="w-12 h-12 mx-auto mb-3" style={{ color: textSecondary }} />
                  <p style={{ fontSize: 14, color: textSecondary }}>Switch to Automatic mode to see eligible employees</p>
                </div>
              ) : eligibleEmployees.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto mb-3" style={{ color: textSecondary }} />
                  <p style={{ fontSize: 14, color: textSecondary }}>No employees currently eligible for automatic promotion</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eligibleEmployees.map((emp: any) => (
                    <div key={emp.id} className="rounded-xl border p-5 transition-all hover:shadow-md" style={{ borderColor, backgroundColor: isDark ? "#111827" : "#FAFAFA" }}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--acc-primary)] to-[var(--acc-primary-soft)] flex items-center justify-center text-white" style={{ fontSize: 13, fontWeight: 700 }}>
                            {emp.firstName[0]}{emp.lastName[0]}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary }}>{emp.firstName} {emp.lastName}</div>
                            <div style={{ fontSize: 12, color: textSecondary }}>{getCategoryName(emp.category)}</div>
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded-full" style={{ fontSize: 11, fontWeight: 600, backgroundColor: "#D1FAE5", color: "#059669" }}>
                          {emp.years} {t("promo.years")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 rounded-md" style={{ fontSize: 11, backgroundColor: isDark ? "#374151" : "#F3F4F6", color: textPrimary }}>{getGradeName(emp.grade)}</span>
                        <ArrowUpRight className="w-4 h-4 text-[var(--acc-primary-strong)]" />
                        <span className="px-2 py-1 rounded-md" style={{ fontSize: 11, backgroundColor: accentBg, color: accentText, fontWeight: 600 }}>{emp.toGradeName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div style={{ fontSize: 12, color: textSecondary }}>
                          {formatCurrency(emp.salary)} <ArrowUpRight className="w-3 h-3 inline text-[#059669]" /> <span style={{ color: "#059669", fontWeight: 600 }}>{formatCurrency(emp.newSalary)}</span>
                        </div>
                        <button onClick={() => handlePromoteEmployee(emp)} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white transition-all hover:shadow-md" style={{ fontSize: 12, fontWeight: 600 }}>
                          {t("promo.promote")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MANUAL TAB */}
          {activeTab === "manual" && (
            <div className="space-y-6 max-w-2xl">
              <h3 style={{ fontSize: 18, fontWeight: 600, color: textPrimary }}>{t("promo.newPromotion")} ({t("promo.manual")})</h3>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("promo.selectEmployee")}</label>
                  <select value={manualForm.employeeId} onChange={(e) => setManualForm({ ...manualForm, employeeId: e.target.value })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}>
                    <option value="">{t("promo.selectEmployee")}</option>
                    {employees.filter((e) => e.status === "active").map((e) => (
                      <option key={e.id} value={e.id}>{e.firstName} {e.lastName} - {e.position} ({getGradeName(e.grade || "G1")})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("promo.newPosition")}</label>
                    <input value={manualForm.newPosition} onChange={(e) => setManualForm({ ...manualForm, newPosition: e.target.value })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} placeholder={t("promo.newPosition")} />
                  </div>
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("promo.newGrade")}</label>
                    <select value={manualForm.newGrade} onChange={(e) => setManualForm({ ...manualForm, newGrade: e.target.value })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}>
                      <option value="">{t("empForm.selectGrade")}</option>
                      {gradeSystem.map((g) => <option key={g.id} value={g.id}>{isAr ? g.nameAr : g.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("promo.newSalary")}</label>
                  <input type="number" value={manualForm.newSalary} onChange={(e) => setManualForm({ ...manualForm, newSalary: e.target.value })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} />
                </div>
                <div>
                  <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("promo.reason")}</label>
                  <textarea value={manualForm.reason} onChange={(e) => setManualForm({ ...manualForm, reason: e.target.value })} rows={3} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary, resize: "vertical" }} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleManualSubmit}
                    disabled={!manualForm.employeeId || !manualForm.newGrade}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontSize: 13, fontWeight: 600 }}
                  >
                    <Check className="w-4 h-4" /> {t("promo.submit")}
                  </button>
                  <button onClick={() => setManualForm({ employeeId: "", newPosition: "", newGrade: "", newSalary: "", reason: "" })} className="px-5 py-2.5 rounded-lg transition-colors" style={{ fontSize: 13, fontWeight: 500, backgroundColor: isDark ? "#374151" : "#F3F4F6", color: textPrimary }}>
                    {t("promo.cancel")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === "history" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 style={{ fontSize: 18, fontWeight: 600, color: textPrimary }}>{t("promo.history")}</h3>
                <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ backgroundColor: inputBg }}>
                  <Search className="w-4 h-4" style={{ color: textSecondary }} />
                  <input
                    value={searchHistory}
                    onChange={(e) => setSearchHistory(e.target.value)}
                    placeholder={t("nav.search")}
                    className="bg-transparent border-none outline-none"
                    style={{ fontSize: 13, color: textPrimary, width: 180 }}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full" style={{ fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
                      {[t("promo.employee"), t("promo.category"), t("promo.fromGrade"), t("promo.toGrade"), t("promo.salaryBefore"), t("promo.salaryAfter"), t("promo.type"), t("promo.date"), t("promo.status")].map((h) => (
                        <th key={h} className="py-3 px-3 text-left whitespace-nowrap" style={{ fontWeight: 600, color: textSecondary, fontSize: 12 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((record) => {
                      const sc = statusColors[record.status] || statusColors.pending;
                      return (
                        <tr key={record.id} className="hover:bg-[var(--muted)] transition-colors" style={{ borderBottom: `1px solid ${borderColor}` }}>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--acc-primary)] to-[var(--acc-primary-soft)] flex items-center justify-center text-white" style={{ fontSize: 10, fontWeight: 700 }}>
                                {record.employeeName.split(" ").map((n) => n[0]).join("")}
                              </div>
                              <span style={{ fontWeight: 500, color: textPrimary }}>{record.employeeName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3" style={{ color: textSecondary }}>{getCategoryName(record.category)}</td>
                          <td className="py-3 px-3"><span className="px-2 py-0.5 rounded" style={{ fontSize: 11, backgroundColor: isDark ? "#374151" : "#F3F4F6", color: textPrimary }}>{getGradeName(record.previousGrade)}</span></td>
                          <td className="py-3 px-3"><span className="px-2 py-0.5 rounded" style={{ fontSize: 11, backgroundColor: accentBg, color: accentText, fontWeight: 600 }}>{getGradeName(record.newGrade)}</span></td>
                          <td className="py-3 px-3" style={{ color: textSecondary }}>{formatNumber(record.previousSalary)}</td>
                          <td className="py-3 px-3" style={{ color: "#059669", fontWeight: 600 }}>{formatNumber(record.newSalary)}</td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ fontSize: 11, fontWeight: 600, backgroundColor: record.type === "automatic" ? (isDark ? "#064E3B" : "#D1FAE5") : (isDark ? "#78350F" : "#FEF3C7"), color: record.type === "automatic" ? "#059669" : "#D97706" }}>
                              {record.type === "automatic" ? <Zap className="w-3 h-3" /> : <Hand className="w-3 h-3" />}
                              {record.type === "automatic" ? t("promo.automatic") : t("promo.manual")}
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap" style={{ color: textSecondary }}>{record.promotionDate}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 11, fontWeight: 600, backgroundColor: sc.bg, color: sc.text }}>
                              {t(`promo.${record.status}`)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="space-y-5">
              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {([
                  { key: "overdue" as const, label: t("promo.notifOverdueCount"), count: notifCounts.overdue, color: "#DC2626", bg: isDark ? "#7F1D1D" : "#FEE2E2", icon: AlertTriangle },
                  { key: "due_soon" as const, label: t("promo.notifDueSoonCount"), count: notifCounts.due_soon, color: "#D97706", bg: isDark ? "#78350F" : "#FEF3C7", icon: Timer },
                  { key: "upcoming" as const, label: t("promo.notifUpcomingCount"), count: notifCounts.upcoming, color: "var(--acc-primary-strong)", bg: isDark ? "#1E3A5F" : "#DBEAFE", icon: CalendarClock },
                ]).map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setNotifFilter(notifFilter === item.key ? "all" : item.key)}
                    className={`rounded-xl border p-4 text-left transition-all ${notifFilter === item.key ? "ring-2 ring-[var(--acc-primary-strong)]" : ""}`}
                    style={{ backgroundColor: isDark ? "#111827" : "#FAFAFA", borderColor }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: item.bg }}>
                        <item.icon className="w-4 h-4" style={{ color: item.color }} />
                      </div>
                      <span style={{ fontSize: 24, fontWeight: 700, color: item.color }}>{item.count}</span>
                    </div>
                    <p style={{ fontSize: 12, color: textSecondary, fontWeight: 500 }}>{item.label}</p>
                  </button>
                ))}
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {([
                  { key: "all" as const, label: t("promo.notifAll"), count: notifCounts.total },
                  { key: "overdue" as const, label: t("promo.notifOverdueCount"), count: notifCounts.overdue },
                  { key: "due_soon" as const, label: t("promo.notifDueSoonCount"), count: notifCounts.due_soon },
                  { key: "upcoming" as const, label: t("promo.notifUpcomingCount"), count: notifCounts.upcoming },
                ]).map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setNotifFilter(f.key)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors"
                    style={{
                      fontSize: 12,
                      fontWeight: notifFilter === f.key ? 600 : 400,
                      backgroundColor: notifFilter === f.key ? accentBg : (isDark ? "#374151" : "#F3F4F6"),
                      color: notifFilter === f.key ? accentText : textSecondary,
                    }}
                  >
                    {f.label}
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full" style={{
                      fontSize: 10,
                      fontWeight: 700,
                      backgroundColor: notifFilter === f.key ? accentText : textSecondary,
                      color: "#fff",
                    }}>{f.count}</span>
                  </button>
                ))}
              </div>

              {/* Notification cards */}
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 mx-auto mb-3" style={{ color: textSecondary }} />
                  <p style={{ fontSize: 14, color: textSecondary }}>{t("promo.notifEmpty")}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notif) => {
                    const urgencyConfig = {
                      overdue: { color: "#DC2626", bg: isDark ? "#7F1D1D" : "#FEE2E2", borderAccent: "#DC2626", icon: AlertTriangle, label: t("promo.notifOverdue") },
                      due_soon: { color: "#D97706", bg: isDark ? "#78350F" : "#FEF3C7", borderAccent: "#D97706", icon: Timer, label: t("promo.notifDueSoon") },
                      upcoming: { color: "var(--acc-primary-strong)", bg: isDark ? "#1E3A5F" : "#DBEAFE", borderAccent: "var(--acc-primary-strong)", icon: CalendarClock, label: t("promo.notifUpcoming") },
                    }[notif.urgency];
                    const UrgencyIcon = urgencyConfig.icon;

                    const timeDisplay = notif.daysRemaining <= 0
                      ? `${Math.abs(notif.daysRemaining)} ${t("promo.notifDays")}`
                      : notif.daysRemaining > 30
                        ? `${Math.round(notif.daysRemaining / 30)} ${t("promo.notifMonths")}`
                        : `${notif.daysRemaining} ${t("promo.notifDays")}`;

                    const descKey = notif.urgency === "overdue" ? "promo.notifOverdueDesc"
                      : notif.urgency === "due_soon" ? "promo.notifDueSoonDesc"
                      : "promo.notifUpcomingDesc";

                    return (
                      <div
                        key={notif.id}
                        className="rounded-xl border p-5 transition-all hover:shadow-md"
                        style={{
                          borderColor,
                          backgroundColor: isDark ? "#111827" : "#FAFAFA",
                          borderLeftWidth: 4,
                          borderLeftColor: urgencyConfig.borderAccent,
                        }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--acc-primary)] to-[var(--acc-primary-soft)] flex items-center justify-center text-white shrink-0" style={{ fontSize: 13, fontWeight: 700 }}>
                              {notif.employeeName.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span style={{ fontSize: 14, fontWeight: 600, color: textPrimary }}>{notif.employeeName}</span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ fontSize: 10, fontWeight: 700, backgroundColor: urgencyConfig.bg, color: urgencyConfig.color }}>
                                  <UrgencyIcon className="w-3 h-3" />
                                  {urgencyConfig.label}
                                </span>
                              </div>
                              <p style={{ fontSize: 13, color: textSecondary, lineHeight: 1.5 }}>
                                {notif.employeeName} {t(descKey)} <span style={{ fontWeight: 600, color: urgencyConfig.color }}>{timeDisplay}</span>
                              </p>
                              <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <span style={{ fontSize: 12, color: textSecondary }}>{getCategoryName(notif.category)}</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="px-2 py-0.5 rounded" style={{ fontSize: 11, backgroundColor: isDark ? "#374151" : "#F3F4F6", color: textPrimary }}>{getGradeName(notif.currentGrade)}</span>
                                  <ArrowUpRight className="w-3.5 h-3.5 text-[var(--acc-primary-strong)]" />
                                  <span className="px-2 py-0.5 rounded" style={{ fontSize: 11, backgroundColor: accentBg, color: accentText, fontWeight: 600 }}>{getGradeName(notif.nextGrade)}</span>
                                </div>
                                <span style={{ fontSize: 11, color: "#059669", fontWeight: 600 }}>+{notif.salaryIncreasePercent}%</span>
                                <span style={{ fontSize: 11, color: textSecondary }}>{notif.yearsServed} / {notif.requiredYears} {t("promo.years")}</span>
                              </div>
                              {/* Progress bar */}
                              <div className="mt-3 w-full max-w-xs">
                                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? "#374151" : "#E5E7EB" }}>
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                      width: `${Math.min(100, (notif.yearsServed / notif.requiredYears) * 100)}%`,
                                      backgroundColor: notif.urgency === "overdue" ? "#DC2626" : notif.urgency === "due_soon" ? "#D97706" : "var(--acc-primary-strong)",
                                    }}
                                  />
                                </div>
                                <p style={{ fontSize: 10, color: textSecondary, marginTop: 2 }}>
                                  {Math.min(100, Math.round((notif.yearsServed / notif.requiredYears) * 100))}%
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {notif.urgency === "overdue" && (
                              <button
                                onClick={() => {
                                  const emp = employees.find((e) => e.id === notif.employeeId);
                                  const rule = rules.find((r) => r.isActive && r.category === notif.category && r.fromGrade === notif.currentGrade && r.toGrade === notif.nextGrade);
                                  if (emp && rule) {
                                    const newSalary = Math.round(emp.salary * (1 + rule.salaryIncreasePercent / 100));
                                    const toGrade = gradeSystem.find((g) => g.id === rule.toGrade);
                                    handlePromoteEmployee({ ...emp, years: notif.yearsServed, rule, toGradeName: toGrade ? (isAr ? toGrade.nameAr : toGrade.name) : rule.toGrade, newSalary });
                                    setDismissedNotifs([...dismissedNotifs, notif.id]);
                                  }
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white transition-all hover:shadow-md"
                                style={{ fontSize: 12, fontWeight: 600 }}
                              >
                                <ArrowUpRight className="w-3.5 h-3.5" />
                                {t("promo.notifPromoteNow")}
                              </button>
                            )}
                            <button
                              onClick={() => setDismissedNotifs([...dismissedNotifs, notif.id])}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors hover:bg-[var(--muted)]"
                              style={{ fontSize: 12, fontWeight: 500, color: textSecondary }}
                            >
                              <X className="w-3.5 h-3.5" />
                              {t("promo.notifDismiss")}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Manual Promotion Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowManualModal(false)}>
          <div className="rounded-2xl border shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ backgroundColor: cardBg, borderColor }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: textPrimary }}>{t("promo.newPromotion")}</h3>
              <button onClick={() => setShowManualModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--muted)] transition-colors">
                <X className="w-4 h-4" style={{ color: textSecondary }} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("promo.selectEmployee")}</label>
                <select value={manualForm.employeeId} onChange={(e) => setManualForm({ ...manualForm, employeeId: e.target.value })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}>
                  <option value="">{t("promo.selectEmployee")}</option>
                  {employees.filter((e) => e.status === "active").map((e) => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName} - {e.position}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("promo.newPosition")}</label>
                  <input value={manualForm.newPosition} onChange={(e) => setManualForm({ ...manualForm, newPosition: e.target.value })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} />
                </div>
                <div>
                  <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("promo.newGrade")}</label>
                  <select value={manualForm.newGrade} onChange={(e) => setManualForm({ ...manualForm, newGrade: e.target.value })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}>
                    <option value="">{t("empForm.selectGrade")}</option>
                    {gradeSystem.map((g) => <option key={g.id} value={g.id}>{isAr ? g.nameAr : g.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("promo.newSalary")}</label>
                <input type="number" value={manualForm.newSalary} onChange={(e) => setManualForm({ ...manualForm, newSalary: e.target.value })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} />
              </div>
              <div>
                <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("promo.reason")}</label>
                <textarea value={manualForm.reason} onChange={(e) => setManualForm({ ...manualForm, reason: e.target.value })} rows={3} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary, resize: "vertical" }} />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t" style={{ borderColor }}>
              <button onClick={handleManualSubmit} disabled={!manualForm.employeeId || !manualForm.newGrade} className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50" style={{ fontSize: 13, fontWeight: 600 }}>
                <Check className="w-4 h-4" /> {t("promo.submit")}
              </button>
              <button onClick={() => setShowManualModal(false)} className="px-5 py-2.5 rounded-lg" style={{ fontSize: 13, fontWeight: 500, backgroundColor: isDark ? "#374151" : "#F3F4F6", color: textPrimary }}>
                {t("promo.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}