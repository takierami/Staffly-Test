import { useState, useMemo, Fragment } from "react";
import { Plus, Check, X, Trash2, Edit, Users, AlertTriangle, ChevronDown, ChevronUp, Shield, Clock, Send, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import type { Employee, LeaveRequest, LeaveAdjustmentProposal } from "../data/mock-data";
import { analyzeLeaveCoverage, type ReplacementRecommendation } from "../lib/leave-intelligence";

export function Leaves() {
  const { t, theme, leaveRequests: requests, updateLeaveRequest, deleteLeaveRequest, employees, addLeaveAdjustmentProposal } = useApp();
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState("pending");
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [proposalModal, setProposalModal] = useState<{ isOpen: boolean; reqId: string; proposedStart: string; proposedEnd: string } | null>(null);
  const isDark = theme === "dark";
  const cardBg = isDark ? "#1F2937" : "#ffffff";
  const borderColor = isDark ? "#374151" : "#F3F4F6";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const textMuted = isDark ? "#6B7280" : "#9CA3AF";
  const inputBg = isDark ? "#374151" : "#F9FAFB";
  const inputBorder = isDark ? "#4B5563" : "#E5E7EB";
  const subtleBg = isDark ? "#374151" : "#F9FAFB";

  const statusStyles: Record<string, { bg: string; text: string }> = {
    pending: { bg: isDark ? "bg-[#78350F]" : "bg-[#FEF3C7]", text: "text-[#D97706]" },
    approved: { bg: isDark ? "bg-[#064E3B]" : "bg-[#D1FAE5]", text: "text-[#059669]" },
    rejected: { bg: isDark ? "bg-[#7F1D1D]" : "bg-[#FEE2E2]", text: "text-[#DC2626]" },
  };
  const typeStyles: Record<string, string> = {
    annual: isDark ? "bg-[var(--acc-tint-dark)] text-[#93C5FD]" : "bg-[var(--acc-tint-light)] text-[var(--acc-primary)]",
    sick: isDark ? "bg-[#78350F] text-[#FBBF24]" : "bg-[#FEF3C7] text-[#D97706]",
    unpaid: isDark ? "bg-[#374151] text-[#9CA3AF]" : "bg-[#F3F4F6] text-[#6B7280]",
    maternity: isDark ? "bg-[#831843] text-[#F9A8D4]" : "bg-[#FCE7F3] text-[#DB2777]",
  };

  const filtered = requests.filter((r) => filter === "all" || r.status === filter);

  // Compute replacements for a leave request
  const getReplacements = useMemo(() => (req: LeaveRequest) => {
    return analyzeLeaveCoverage(req.employeeId, req.startDate, req.endDate, employees, requests, req.organizationId || "ORG001");
  }, [employees, requests]);

  // Coverage conflict detection
  const getCoverageRisk = (req: LeaveRequest): { risk: "low" | "medium" | "high"; message: string } => {
    if (!req.startDate || !req.endDate) return { risk: "low", message: "" };
    const deptEmployees = employees.filter((e) => e.department === employees.find((em) => em.id === req.employeeId)?.department && e.status === "active");
    const concurrentLeaves = requests.filter((l) => {
      if (l.id === req.id || l.status !== "approved") return false;
      const ls = new Date(l.startDate);
      const le = new Date(l.endDate);
      const rs = new Date(req.startDate);
      const re = new Date(req.endDate);
      if (ls > re || le < rs) return false;
      const lEmp = employees.find((e) => e.id === l.employeeId);
      return lEmp?.department === employees.find((e) => e.id === req.employeeId)?.department;
    });
    const availableCount = deptEmployees.length - concurrentLeaves.length - 1;
    if (availableCount <= 0) return { risk: "high", message: "Critical: No coverage available in this department during the requested period." };
    if (availableCount === 1) return { risk: "medium", message: `Caution: Only 1 team member available to cover ${employees.find((e) => e.id === req.employeeId)?.department || "this department"}.` };
    return { risk: "low", message: `${availableCount} team members available for coverage.` };
  };

  const handleApprove = (id: string) => { updateLeaveRequest(id, { status: "approved" }); toast.success(t("leave.approved") + "!"); setExpandedId(null); };
  const handleReject = (id: string) => { updateLeaveRequest(id, { status: "rejected" }); toast.success(t("leave.rejected")); setExpandedId(null); };

  const handleDelete = (id: string) => {
    deleteLeaveRequest(id);
    setDeleteConfirm(null);
    toast.success("Leave request deleted");
  };

  // Staffing Impact Stats
  const pendingCount = requests.filter(r => r.status === "pending").length;
  const approvedCount = requests.filter(r => r.status === "approved").length;
  const activeLeaves = requests.filter(r => {
    if (r.status !== "approved") return false;
    const now = new Date();
    return new Date(r.startDate) <= now && new Date(r.endDate) >= now;
  }).length;
  
  const staffingStats = [
    { type: "Pending Approvals", value: pendingCount, color: "#F59E0B" },
    { type: "Currently on Leave", value: activeLeaves, color: "var(--acc-primary-strong)" },
    { type: "Total Approved", value: approvedCount, color: "#10B981" },
  ];

  const availabilityColors: Record<string, { bg: string; text: string; label: string }> = {
    full: { bg: isDark ? "#064E3B" : "#D1FAE5", text: "#059669", label: "Fully Available" },
    partial: { bg: isDark ? "#78350F" : "#FEF3C7", text: "#D97706", label: "Partially Available" },
    none: { bg: isDark ? "#7F1D1D" : "#FEE2E2", text: "#DC2626", label: "Unavailable" },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: textPrimary }}>
            {currentUser?.role === "admin" ? "Organization Leave Overview" : "Leave Management"}
          </h2>
          <p style={{ fontSize: 13, color: textSecondary, marginTop: 4 }}>
            {currentUser?.role === "admin" ? "Monitor organization-wide leave requests and workforce impact." : "Review employee requests and manage workforce coverage."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {staffingStats.map((s) => (
          <div key={s.type} className="rounded-xl border p-5 flex items-center justify-between" style={{ backgroundColor: cardBg, borderColor }}>
            <div>
              <div style={{ fontSize: 13, color: textSecondary, marginBottom: 4 }}>{s.type}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: textPrimary }}>{s.value}</div>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
              <Users className="w-6 h-6" style={{ color: s.color }} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {[{ key: "all", label: t("leave.all") }, { key: "pending", label: t("leave.pending") }, { key: "approved", label: t("leave.approved") }, { key: "rejected", label: t("leave.rejected") }].map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)} className="px-4 py-2 rounded-lg transition-colors" style={{ fontSize: 13, fontWeight: filter === f.key ? 600 : 400, backgroundColor: filter === f.key ? (isDark ? "var(--acc-tint-dark)" : "var(--acc-tint-light)") : "transparent", color: filter === f.key ? "var(--acc-primary-strong)" : textSecondary }}>
            {f.label}{f.key !== "all" && <span className="ml-1.5" style={{ color: textMuted }}>({requests.filter((r) => r.status === f.key).length})</span>}
          </button>
        ))}
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: cardBg, borderColor }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr style={{ borderBottom: `1px solid ${borderColor}` }}>
              {[t("leave.employee"), t("leave.type"), t("leave.duration"), t("leave.days"), t("leave.reason"), t("leave.status"), t("leave.actions")].map((h) => (
                <th key={h} className="text-left px-5 py-3" style={{ fontSize: 12, fontWeight: 600, color: textSecondary }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((r) => {
                const isExpanded = expandedId === r.id;
                const replacements = r.status === "pending" ? getReplacements(r) : [];
                const coverage = r.status === "pending" ? getCoverageRisk(r) : null;
                return (
                  <Fragment key={r.id}>
                    <tr style={{ borderBottom: isExpanded ? "none" : `1px solid ${isDark ? "#1F2937" : "#F9FAFB"}` }}>
                      <td className="px-5 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--acc-primary)] to-[var(--acc-primary-soft)] flex items-center justify-center text-white" style={{ fontSize: 11, fontWeight: 600 }}>{r.employeeName.split(" ").map((n) => n[0]).join("")}</div><span style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{r.employeeName}</span></div></td>
                      <td className="px-5 py-3"><span className={`${typeStyles[r.type.toLowerCase()] ?? typeStyles["annual"]} px-2.5 py-1 rounded-md`} style={{ fontSize: 11, fontWeight: 600 }}>{r.type}</span></td>
                      <td className="px-5 py-3" style={{ fontSize: 13, color: textSecondary }}>{r.startDate} &rarr; {r.endDate}</td>
                      <td className="px-5 py-3" style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{r.days}</td>
                      <td className="px-5 py-3 max-w-[200px] truncate" style={{ fontSize: 13, color: textSecondary }}>{r.reason}</td>
                      <td className="px-5 py-3"><span className={`${(statusStyles[r.status.toLowerCase()] ?? statusStyles["pending"]).bg} ${(statusStyles[r.status.toLowerCase()] ?? statusStyles["pending"]).text} px-2.5 py-1 rounded-md`} style={{ fontSize: 11, fontWeight: 600 }}>{r.status}</span></td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1 items-center">
                          {r.status === "pending" && (
                            <>
                              <button onClick={() => setExpandedId(isExpanded ? null : r.id)} className="p-1.5 rounded hover:bg-[var(--acc-tint-light)] text-[var(--acc-primary-strong)]" title="View workforce analysis">{isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</button>
                            </>
                          )}
                          <div className="flex items-center gap-2">
                            {currentUser?.role === "hr_manager" && r.status === "pending" && (
                              <>
                                <button onClick={(e) => { e.stopPropagation(); handleApprove(r.id); }} className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#D1FAE5] hover:bg-[#A7F3D0] text-[#059669] transition-colors"><Check className="w-4 h-4" /></button>
                                <button onClick={(e) => { e.stopPropagation(); handleReject(r.id); }} className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#FEE2E2] hover:bg-[#FECACA] text-[#DC2626] transition-colors"><X className="w-4 h-4" /></button>
                              </>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(r.id); }} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr key={`${r.id}-expanded`} style={{ borderBottom: `1px solid ${isDark ? "#1F2937" : "#F9FAFB"}` }}>
                        <td colSpan={7} className="px-5 pb-5">
                          <div className="rounded-xl border mt-2 overflow-hidden" style={{ borderColor: isDark ? "#374151" : "#E5E7EB" }}>
                            {/* Coverage Risk Banner */}
                            {coverage && coverage.message && (
                              <div className="flex items-center gap-3 px-5 py-3 border-b" style={{
                                borderColor: isDark ? "#374151" : "#E5E7EB",
                                backgroundColor: coverage.risk === "high" ? (isDark ? "#450A0A" : "#FEF2F2") : coverage.risk === "medium" ? (isDark ? "#431407" : "#FFFBEB") : (isDark ? "#052E16" : "#F0FDF4"),
                              }}>
                                {coverage.risk === "high" ? (
                                  <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: "#DC2626" }} />
                                ) : coverage.risk === "medium" ? (
                                  <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: "#D97706" }} />
                                ) : (
                                  <Shield className="w-4 h-4 shrink-0" style={{ color: "#16A34A" }} />
                                )}
                                <span style={{ fontSize: 13, fontWeight: 500, color: coverage.risk === "high" ? "#DC2626" : coverage.risk === "medium" ? "#D97706" : "#16A34A" }}>
                                  {coverage.message}
                                </span>
                                {coverage.risk === "high" && (
                                  <span className="ml-auto px-2.5 py-1 rounded-md text-white" style={{ fontSize: 11, fontWeight: 600, backgroundColor: "#DC2626" }}>High Risk</span>
                                )}
                                {coverage.risk === "medium" && (
                                  <span className="ml-auto px-2.5 py-1 rounded-md" style={{ fontSize: 11, fontWeight: 600, backgroundColor: isDark ? "#78350F" : "#FEF3C7", color: "#D97706" }}>Medium Risk</span>
                                )}
                              </div>
                            )}

                            {/* Suggested Replacements Header */}
                            <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: isDark ? "#374151" : "#E5E7EB", backgroundColor: isDark ? "#1F2937" : "#F9FAFB" }}>
                              <Users className="w-4 h-4" style={{ color: "var(--acc-primary-strong)" }} />
                              <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>Suggested Replacements</span>
                              <span className="ml-auto" style={{ fontSize: 12, color: textMuted }}>Based on role, department & availability during leave period</span>
                            </div>

                            {replacements.length === 0 ? (
                              <div className="px-5 py-6 text-center" style={{ color: textMuted, fontSize: 13 }}>
                                No suitable replacements found. Consider adjusting leave dates or requesting backup staffing.
                              </div>
                            ) : (
                              <div className="divide-y" style={{ borderColor: isDark ? "#374151" : "#F3F4F6" }}>
                                {replacements.map((rec, idx) => {
                                  const e = rec.employee;
                                  const avail = availabilityColors[rec.availabilityType] || availabilityColors["full"];
                                  return (
                                    <div key={e.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4" style={{ backgroundColor: idx === 0 ? (isDark ? "#1E3A5F1A" : "#EFF6FF") : "transparent" }}>
                                      <div className="flex items-center gap-4 flex-1">
                                        {/* Rank badge */}
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: idx === 0 ? "var(--acc-primary)" : isDark ? "#374151" : "#E5E7EB", fontSize: 11, fontWeight: 700, color: idx === 0 ? "#fff" : textSecondary }}>
                                          {idx + 1}
                                        </div>

                                        {/* Avatar */}
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--acc-primary)] to-[var(--acc-primary-soft)] flex items-center justify-center text-white shrink-0" style={{ fontSize: 11, fontWeight: 600 }}>
                                          {e.firstName[0]}{e.lastName[0]}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span style={{ fontSize: 14, fontWeight: 600, color: textPrimary }}>{e.firstName} {e.lastName}</span>
                                            {idx === 0 && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: "var(--acc-primary)", color: "#fff" }}>Top Pick</span>}
                                          </div>
                                          <div style={{ fontSize: 12, color: textSecondary }}>{e.position} · {e.department}</div>
                                          
                                          {/* Match Details Badges */}
                                          <div className="flex flex-wrap gap-1.5 mt-2">
                                            {rec.matchDetails.titleMatch && <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-semibold">Title Match</span>}
                                            {rec.matchDetails.departmentMatch && <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-[10px] font-semibold">Same Dept</span>}
                                            {rec.matchDetails.gradeMatch && <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-[10px] font-semibold">Peer</span>}
                                            {rec.matchDetails.skillOverlap > 0 && <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-semibold">{rec.matchDetails.skillOverlap}% Skills Overlap</span>}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex flex-col items-end gap-2 shrink-0">
                                        {/* Compatibility score */}
                                        <div className="flex items-center gap-2">
                                          <div className="w-24 h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${rec.score}%`, backgroundColor: rec.score >= 70 ? "#10B981" : rec.score >= 40 ? "#F59E0B" : "#9CA3AF" }} />
                                          </div>
                                          <span style={{ fontSize: 13, fontWeight: 700, color: textPrimary, minWidth: 32 }}>{rec.score}%</span>
                                        </div>

                                        {/* Availability & Actions */}
                                        <div className="flex items-center gap-2">
                                          <span className="px-2.5 py-1 rounded-md" style={{ fontSize: 11, fontWeight: 600, backgroundColor: avail.bg, color: avail.text }}>
                                            {avail.label} ({rec.availableDays}/{rec.totalRequestedDays} days)
                                          </span>
                                          {rec.availabilityType === "partial" && (
                                            <button 
                                              onClick={() => setProposalModal({ isOpen: true, reqId: r.id, proposedStart: rec.proposedStartDate || r.startDate, proposedEnd: rec.proposedEndDate || r.endDate })}
                                              className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50 rounded-md transition-colors" style={{ fontSize: 11, fontWeight: 600 }}
                                            >
                                              <Calendar className="w-3 h-3" /> Propose Dates
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Quick action footer */}
                            <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: isDark ? "#374151" : "#E5E7EB", backgroundColor: isDark ? "#111827" : "#F9FAFB" }}>
                              <span style={{ fontSize: 12, color: textMuted }}>Review the analysis above before approving</span>
                              <div className="flex gap-2">
                                <button onClick={() => handleReject(r.id)} className="px-4 py-1.5 rounded-lg hover:opacity-80 transition-colors" style={{ fontSize: 12, fontWeight: 500, backgroundColor: isDark ? "#7F1D1D" : "#FEE2E2", color: "#DC2626" }}>Reject</button>
                                <button onClick={() => handleApprove(r.id)} className="px-4 py-1.5 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors" style={{ fontSize: 12, fontWeight: 500 }}>Approve Leave</button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="rounded-2xl border shadow-2xl w-full max-w-sm p-6" style={{ backgroundColor: cardBg, borderColor }} onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: isDark ? "#7F1D1D" : "#FEE2E2" }}><Trash2 className="w-6 h-6 text-[#DC2626]" /></div>
            <h3 className="text-center mb-2" style={{ fontSize: 18, fontWeight: 600, color: textPrimary }}>Delete Leave Request?</h3>
            <p className="text-center mb-6" style={{ fontSize: 13, color: textSecondary }}>This request will be permanently removed.</p>
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2.5 rounded-lg" style={{ fontSize: 13, fontWeight: 500, backgroundColor: isDark ? "#374151" : "#F3F4F6", color: textPrimary }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="flex-1 px-4 py-2.5 rounded-lg bg-[#DC2626] text-white hover:bg-[#B91C1C] transition-colors" style={{ fontSize: 13, fontWeight: 600 }} onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
      
      {proposalModal && proposalModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setProposalModal(null)}>
          <div className="rounded-2xl border shadow-2xl w-full max-w-md p-6" style={{ backgroundColor: cardBg, borderColor }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-100 dark:bg-amber-900/30">
                <Send className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: textPrimary }}>Propose Adjusted Leave Dates</h3>
            </div>
            <p className="mb-4" style={{ fontSize: 13, color: textSecondary }}>
              Due to partial replacement coverage, you can propose modified leave dates to the employee. This will send an email notification.
            </p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Proposed Start Date</label>
                <input type="date" value={proposalModal.proposedStart} onChange={e => setProposalModal({...proposalModal, proposedStart: e.target.value})} className="w-full px-3 py-2.5 rounded-lg outline-none" style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} />
              </div>
              <div>
                <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Proposed End Date</label>
                <input type="date" value={proposalModal.proposedEnd} onChange={e => setProposalModal({...proposalModal, proposedEnd: e.target.value})} className="w-full px-3 py-2.5 rounded-lg outline-none" style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} />
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2.5 rounded-lg" style={{ fontSize: 13, fontWeight: 500, backgroundColor: subtleBg, color: textPrimary }} onClick={() => setProposalModal(null)}>Cancel</button>
              <button 
                className="flex-1 px-4 py-2.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors" 
                style={{ fontSize: 13, fontWeight: 600 }} 
                onClick={() => {
                  addLeaveAdjustmentProposal({
                    id: `PRO${String(Date.now()).slice(-6)}`,
                    leaveRequestId: proposalModal.reqId,
                    proposedStartDate: proposalModal.proposedStart,
                    proposedEndDate: proposalModal.proposedEnd,
                    reason: "Optimal replacement coverage allows for these dates.",
                    status: "pending",
                    createdAt: new Date().toISOString()
                  });
                  toast.success("Adjustment proposal sent to employee via email.");
                  setProposalModal(null);
                }}
              >
                Send Proposal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
