import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { type Lang, t as translate } from "../data/translations";
import {
  employeeCategories as defaultCategories,
  gradeSystem as defaultGrades,
  departments as defaultDepartments,
  employees as defaultEmployees,
  attendanceRecords as defaultAttendance,
  leaveRequests as defaultLeaves,
  payrollRecords as defaultPayroll,
  performanceReviews as defaultPerformance,
  jobPostings as defaultJobs,
  candidates as defaultCandidates,
  trainingPrograms as defaultTraining,
  documents as defaultDocuments,
  promotionRules as defaultPromotionRules,
  promotionHistory as defaultPromotionHistory,
  recentActivities as defaultActivities,
  leaveAdjustmentProposals as defaultLeaveProposals,
  type Employee,
  type AttendanceRecord,
  type LeaveRequest,
  type PayrollRecord,
  type PerformanceReview,
  type JobPosting,
  type Candidate,
  type TrainingProgram,
  type Document,
  type PromotionRule,
  type PromotionRecord,
  type LeaveAdjustmentProposal,
} from "../data/mock-data";

export interface CategoryItem {
  id: string;
  name: string;
  nameAr: string;
  department: string;
}

export interface GradeItem {
  id: string;
  name: string;
  nameAr: string;
}

export type AccentName = "blue" | "indigo" | "emerald" | "rose" | "amber" | "violet";
export type Density = "compact" | "comfortable" | "spacious";
export interface AppearanceSettings {
  accent: AccentName;
  density: Density;
  sidebar: "expanded" | "collapsed";
  reduceMotion: boolean;
}
export interface LocalizationSettings {
  dateFormat: "YYYY-MM-DD" | "DD/MM/YYYY" | "MM/DD/YYYY" | "DD MMM YYYY";
  timeFormat: "24h" | "12h";
  timezone: string;
  weekStart: "saturday" | "sunday" | "monday";
  numberFormat: string;
  currency: string;
}
export interface SecuritySettings {
  twoFactor: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  loginAlerts: boolean;
  requireStrongPassword: boolean;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description?: string;
  content: string;
  fields: string[];
  createdDate: string;
  updatedDate: string;
}

export interface ActivityItem {
  id: number;
  action: string;
  user: string;
  time: string;
  type: "leave" | "payroll" | "employee" | "performance" | "training" | "document" | "recruitment" | "attendance";
}

interface AppContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  t: (key: string) => string;
  isRTL: boolean;
  // Customizable data
  categories: CategoryItem[];
  setCategories: React.Dispatch<React.SetStateAction<CategoryItem[]>>;
  grades: GradeItem[];
  setGrades: React.Dispatch<React.SetStateAction<GradeItem[]>>;
  customDepartments: string[];
  setCustomDepartments: React.Dispatch<React.SetStateAction<string[]>>;
  // CRUD data entities
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  addEmployee: (emp: Employee) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  attendanceRecords: AttendanceRecord[];
  setAttendanceRecords: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  addAttendanceRecord: (rec: AttendanceRecord) => void;
  updateAttendanceRecord: (id: string, data: Partial<AttendanceRecord>) => void;
  deleteAttendanceRecord: (id: string) => void;

  leaveRequests: LeaveRequest[];
  setLeaveRequests: React.Dispatch<React.SetStateAction<LeaveRequest[]>>;
  addLeaveRequest: (req: LeaveRequest) => void;
  updateLeaveRequest: (id: string, data: Partial<LeaveRequest>) => void;
  deleteLeaveRequest: (id: string) => void;

  leaveAdjustmentProposals: LeaveAdjustmentProposal[];
  setLeaveAdjustmentProposals: React.Dispatch<React.SetStateAction<LeaveAdjustmentProposal[]>>;
  addLeaveAdjustmentProposal: (proposal: LeaveAdjustmentProposal) => void;
  updateLeaveAdjustmentProposal: (id: string, data: Partial<LeaveAdjustmentProposal>) => void;
  deleteLeaveAdjustmentProposal: (id: string) => void;

  payrollRecords: PayrollRecord[];
  setPayrollRecords: React.Dispatch<React.SetStateAction<PayrollRecord[]>>;
  addPayrollRecord: (rec: PayrollRecord) => void;
  updatePayrollRecord: (id: string, data: Partial<PayrollRecord>) => void;
  deletePayrollRecord: (id: string) => void;

  performanceReviews: PerformanceReview[];
  setPerformanceReviews: React.Dispatch<React.SetStateAction<PerformanceReview[]>>;
  addPerformanceReview: (rev: PerformanceReview) => void;
  updatePerformanceReview: (id: string, data: Partial<PerformanceReview>) => void;
  deletePerformanceReview: (id: string) => void;

  jobPostings: JobPosting[];
  setJobPostings: React.Dispatch<React.SetStateAction<JobPosting[]>>;
  addJobPosting: (job: JobPosting) => void;
  updateJobPosting: (id: string, data: Partial<JobPosting>) => void;
  deleteJobPosting: (id: string) => void;

  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  addCandidate: (can: Candidate) => void;
  updateCandidate: (id: string, data: Partial<Candidate>) => void;
  deleteCandidate: (id: string) => void;

  trainingPrograms: TrainingProgram[];
  setTrainingPrograms: React.Dispatch<React.SetStateAction<TrainingProgram[]>>;
  addTrainingProgram: (prog: TrainingProgram) => void;
  updateTrainingProgram: (id: string, data: Partial<TrainingProgram>) => void;
  deleteTrainingProgram: (id: string) => void;

  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  addDocument: (doc: Document) => void;
  updateDocument: (id: string, data: Partial<Document>) => void;
  deleteDocument: (id: string) => void;

  documentTemplates: DocumentTemplate[];
  setDocumentTemplates: React.Dispatch<React.SetStateAction<DocumentTemplate[]>>;
  addDocumentTemplate: (tpl: DocumentTemplate) => void;
  updateDocumentTemplate: (id: string, data: Partial<DocumentTemplate>) => void;
  deleteDocumentTemplate: (id: string) => void;

  promotionRules: PromotionRule[];
  setPromotionRules: React.Dispatch<React.SetStateAction<PromotionRule[]>>;
  promotionHistory: PromotionRecord[];
  setPromotionHistory: React.Dispatch<React.SetStateAction<PromotionRecord[]>>;

  recentActivities: ActivityItem[];
  addActivity: (action: string, user: string, type: ActivityItem["type"]) => void;

  appearance: AppearanceSettings;
  setAppearance: React.Dispatch<React.SetStateAction<AppearanceSettings>>;
  localization: LocalizationSettings;
  setLocalization: React.Dispatch<React.SetStateAction<LocalizationSettings>>;
  security: SecuritySettings;
  setSecurity: React.Dispatch<React.SetStateAction<SecuritySettings>>;

  formatCurrency: (amount: number) => string;
  formatNumber: (n: number) => string;
  formatDate: (d: string | Date) => string;
  formatTime: (d: string | Date) => string;
}

const AppContext = createContext<AppContextType | null>(null);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function usePersisted<T>(key: string, fallback: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => loadFromStorage(key, fallback));
  useEffect(() => { localStorage.setItem(key, JSON.stringify(state)); }, [key, state]);
  return [state, setState];
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem("staffly-lang") as Lang) || "en");
  const [theme, setTheme] = useState<"light" | "dark">(() => (localStorage.getItem("staffly-theme") as "light" | "dark") || "light");

  const [categories, setCategories] = usePersisted<CategoryItem[]>("staffly-categories", [...defaultCategories] as CategoryItem[]);
  const [grades, setGrades] = usePersisted<GradeItem[]>("staffly-grades", [...defaultGrades] as GradeItem[]);
  const [customDepartments, setCustomDepartments] = usePersisted<string[]>("staffly-departments", [...defaultDepartments]);

  // Data entities with CRUD
  const [employees, setEmployees] = usePersisted<Employee[]>("staffly-employees", [...defaultEmployees]);
  const [attendanceRecords, setAttendanceRecords] = usePersisted<AttendanceRecord[]>("staffly-attendance", [...defaultAttendance]);
  const [leaveRequests, setLeaveRequests] = usePersisted<LeaveRequest[]>("staffly-leaves", [...defaultLeaves]);
  const [leaveAdjustmentProposals, setLeaveAdjustmentProposals] = usePersisted<LeaveAdjustmentProposal[]>("staffly-leave-proposals", [...defaultLeaveProposals]);
  const [payrollRecords, setPayrollRecords] = usePersisted<PayrollRecord[]>("staffly-payroll", [...defaultPayroll]);
  const [performanceReviews, setPerformanceReviews] = usePersisted<PerformanceReview[]>("staffly-performance", [...defaultPerformance]);
  const [jobPostings, setJobPostings] = usePersisted<JobPosting[]>("staffly-jobs", [...defaultJobs]);
  const [candidates, setCandidates] = usePersisted<Candidate[]>("staffly-candidates", [...defaultCandidates]);
  const [trainingPrograms, setTrainingPrograms] = usePersisted<TrainingProgram[]>("staffly-training", [...defaultTraining]);
  const [documents, setDocuments] = usePersisted<Document[]>("staffly-documents", [...defaultDocuments]);
  const [documentTemplates, setDocumentTemplates] = usePersisted<DocumentTemplate[]>("staffly-document-templates", [
    {
      id: "TPL_WORK_CERT",
      name: "Work Certificate",
      description: "Standard work attestation certificate",
      content: `WORK CERTIFICATE\n\nWe, the undersigned, certify that {{employee_full_name}}, holder of National ID {{employee_id}}, has been working in our company as {{employee_position}} in the {{employee_department}} department since {{employee_hire_date}}.\n\nThis certificate is issued at the request of the concerned party for any lawful purpose.\n\nDate: {{current_date}}\n\nHR Department`,
      fields: ["employee_full_name", "employee_id", "employee_position", "employee_department", "employee_hire_date", "current_date"],
      createdDate: new Date().toISOString().split("T")[0],
      updatedDate: new Date().toISOString().split("T")[0],
    },
    {
      id: "TPL_SALARY_CERT",
      name: "Salary Certificate",
      description: "Confirms employee's monthly salary",
      content: `SALARY CERTIFICATE\n\nThis is to certify that {{employee_full_name}} is currently employed in our company as {{employee_position}} in the {{employee_department}} department since {{employee_hire_date}}.\n\nThe employee's gross monthly salary is {{employee_salary}}.\n\nThis certificate is issued for {{employee_full_name}}'s personal use.\n\nDate: {{current_date}}\n\nHR Department`,
      fields: ["employee_full_name", "employee_position", "employee_department", "employee_hire_date", "employee_salary", "current_date"],
      createdDate: new Date().toISOString().split("T")[0],
      updatedDate: new Date().toISOString().split("T")[0],
    },
  ]);
  const [promotionRules, setPromotionRules] = usePersisted<PromotionRule[]>("staffly-promotion-rules", [...defaultPromotionRules]);
  const [promotionHistory, setPromotionHistory] = usePersisted<PromotionRecord[]>("staffly-promotion-history", [...defaultPromotionHistory]);
  const [recentActivities, setRecentActivities] = usePersisted<ActivityItem[]>("staffly-activities", [...defaultActivities] as ActivityItem[]);

  const [appearance, setAppearance] = usePersisted<AppearanceSettings>("staffly-appearance", {
    accent: "blue", density: "comfortable", sidebar: "expanded", reduceMotion: false,
  });
  const [localization, setLocalization] = usePersisted<LocalizationSettings>("staffly-localization", {
    dateFormat: "YYYY-MM-DD", timeFormat: "24h", timezone: "Africa/Algiers",
    weekStart: "monday", numberFormat: "fr-DZ", currency: "DZD",
  });
  const [security, setSecurity] = usePersisted<SecuritySettings>("staffly-security", {
    twoFactor: false, sessionTimeout: 30, passwordExpiry: 90, loginAlerts: true, requireStrongPassword: true,
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-accent", appearance.accent);
    root.setAttribute("data-density", appearance.density);
    root.setAttribute("data-reduce-motion", String(appearance.reduceMotion));
  }, [appearance]);

  const isRTL = lang === "ar";

  useEffect(() => {
    localStorage.setItem("staffly-lang", lang);
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang, isRTL]);

  useEffect(() => {
    localStorage.setItem("staffly-theme", theme);
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));
  const tFn = (key: string) => translate(key, lang);

  // Activity helper
  const addActivity = useCallback((action: string, user: string, type: ActivityItem["type"]) => {
    setRecentActivities((prev) => [{
      id: Date.now(),
      action,
      user,
      time: "Just now",
      type,
    }, ...prev.slice(0, 49)]);
  }, []);

  // CRUD helpers
  const addEmployee = useCallback((emp: Employee) => { setEmployees((p) => [emp, ...p]); addActivity(`New employee: ${emp.firstName} ${emp.lastName}`, "Admin", "employee"); }, [addActivity]);
  const updateEmployee = useCallback((id: string, data: Partial<Employee>) => { setEmployees((p) => p.map((e) => e.id === id ? { ...e, ...data } : e)); }, []);
  const deleteEmployee = useCallback((id: string) => { setEmployees((p) => p.filter((e) => e.id !== id)); addActivity("Employee removed", "Admin", "employee"); }, [addActivity]);

  const addAttendanceRecord = useCallback((rec: AttendanceRecord) => { setAttendanceRecords((p) => [rec, ...p]); }, []);
  const updateAttendanceRecord = useCallback((id: string, data: Partial<AttendanceRecord>) => { setAttendanceRecords((p) => p.map((r) => r.id === id ? { ...r, ...data } : r)); }, []);
  const deleteAttendanceRecord = useCallback((id: string) => { setAttendanceRecords((p) => p.filter((r) => r.id !== id)); }, []);

  const addLeaveRequest = useCallback((req: LeaveRequest) => { setLeaveRequests((p) => [req, ...p]); addActivity(`Leave request: ${req.employeeName}`, req.employeeName, "leave"); }, [addActivity]);
  const updateLeaveRequest = useCallback((id: string, data: Partial<LeaveRequest>) => { setLeaveRequests((p) => p.map((r) => r.id === id ? { ...r, ...data } : r)); }, []);
  const deleteLeaveRequest = useCallback((id: string) => { setLeaveRequests((p) => p.filter((r) => r.id !== id)); }, []);

  const addLeaveAdjustmentProposal = useCallback((proposal: LeaveAdjustmentProposal) => { setLeaveAdjustmentProposals((p) => [proposal, ...p]); addActivity(`Leave adjustment proposed`, "HR Admin", "leave"); }, [addActivity]);
  const updateLeaveAdjustmentProposal = useCallback((id: string, data: Partial<LeaveAdjustmentProposal>) => { setLeaveAdjustmentProposals((p) => p.map((r) => r.id === id ? { ...r, ...data } : r)); }, []);
  const deleteLeaveAdjustmentProposal = useCallback((id: string) => { setLeaveAdjustmentProposals((p) => p.filter((r) => r.id !== id)); }, []);

  const addPayrollRecord = useCallback((rec: PayrollRecord) => { setPayrollRecords((p) => [rec, ...p]); }, []);
  const updatePayrollRecord = useCallback((id: string, data: Partial<PayrollRecord>) => { setPayrollRecords((p) => p.map((r) => r.id === id ? { ...r, ...data } : r)); }, []);
  const deletePayrollRecord = useCallback((id: string) => { setPayrollRecords((p) => p.filter((r) => r.id !== id)); }, []);

  const addPerformanceReview = useCallback((rev: PerformanceReview) => { setPerformanceReviews((p) => [rev, ...p]); addActivity(`Performance review: ${rev.employeeName}`, rev.reviewer, "performance"); }, [addActivity]);
  const updatePerformanceReview = useCallback((id: string, data: Partial<PerformanceReview>) => { setPerformanceReviews((p) => p.map((r) => r.id === id ? { ...r, ...data } : r)); }, []);
  const deletePerformanceReview = useCallback((id: string) => { setPerformanceReviews((p) => p.filter((r) => r.id !== id)); }, []);

  const addJobPosting = useCallback((job: JobPosting) => { setJobPostings((p) => [job, ...p]); addActivity(`Job posted: ${job.title}`, "Admin", "recruitment"); }, [addActivity]);
  const updateJobPosting = useCallback((id: string, data: Partial<JobPosting>) => { setJobPostings((p) => p.map((j) => j.id === id ? { ...j, ...data } : j)); }, []);
  const deleteJobPosting = useCallback((id: string) => { setJobPostings((p) => p.filter((j) => j.id !== id)); }, []);

  const addCandidate = useCallback((can: Candidate) => { setCandidates((p) => [can, ...p]); }, []);
  const updateCandidate = useCallback((id: string, data: Partial<Candidate>) => { setCandidates((p) => p.map((c) => c.id === id ? { ...c, ...data } : c)); }, []);
  const deleteCandidate = useCallback((id: string) => { setCandidates((p) => p.filter((c) => c.id !== id)); }, []);

  const addTrainingProgram = useCallback((prog: TrainingProgram) => { setTrainingPrograms((p) => [prog, ...p]); addActivity(`Training: ${prog.title}`, "Admin", "training"); }, [addActivity]);
  const updateTrainingProgram = useCallback((id: string, data: Partial<TrainingProgram>) => { setTrainingPrograms((p) => p.map((pr) => pr.id === id ? { ...pr, ...data } : pr)); }, []);
  const deleteTrainingProgram = useCallback((id: string) => { setTrainingPrograms((p) => p.filter((pr) => pr.id !== id)); }, []);

  const addDocument = useCallback((doc: Document) => { setDocuments((p) => [doc, ...p]); addActivity(`Document: ${doc.name}`, "Admin", "document"); }, [addActivity]);
  const updateDocument = useCallback((id: string, data: Partial<Document>) => { setDocuments((p) => p.map((d) => d.id === id ? { ...d, ...data } : d)); }, []);
  const deleteDocument = useCallback((id: string) => { setDocuments((p) => p.filter((d) => d.id !== id)); }, []);

  const addDocumentTemplate = useCallback((tpl: DocumentTemplate) => { setDocumentTemplates((p) => [tpl, ...p]); addActivity(`Template created: ${tpl.name}`, "Admin", "document"); }, [addActivity]);
  const updateDocumentTemplate = useCallback((id: string, data: Partial<DocumentTemplate>) => { setDocumentTemplates((p) => p.map((t) => t.id === id ? { ...t, ...data, updatedDate: new Date().toISOString().split("T")[0] } : t)); }, []);
  const deleteDocumentTemplate = useCallback((id: string) => { setDocumentTemplates((p) => p.filter((t) => t.id !== id)); }, []);

  const numberLocale = lang === "ar" ? "ar-DZ" : localization.numberFormat;
  const formatNumber = useCallback((n: number) => {
    try { return new Intl.NumberFormat(numberLocale).format(n); } catch { return n.toLocaleString(); }
  }, [numberLocale]);
  const formatCurrency = useCallback((amount: number) => `${formatNumber(amount)} ${localization.currency}`, [formatNumber, localization.currency]);
  const formatDate = useCallback((d: string | Date) => {
    const date = typeof d === "string" ? new Date(d) : d;
    if (isNaN(date.getTime())) return String(d);
    const pad = (n: number) => String(n).padStart(2, "0");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const Y = String(date.getFullYear());
    const M = pad(date.getMonth() + 1);
    const D = pad(date.getDate());
    const Mmm = months[date.getMonth()];
    switch (localization.dateFormat) {
      case "DD/MM/YYYY": return `${D}/${M}/${Y}`;
      case "MM/DD/YYYY": return `${M}/${D}/${Y}`;
      case "DD MMM YYYY": return `${D} ${Mmm} ${Y}`;
      default: return `${Y}-${M}-${D}`;
    }
  }, [localization.dateFormat]);
  const formatTime = useCallback((d: string | Date) => {
    const date = typeof d === "string" ? new Date(d) : d;
    if (isNaN(date.getTime())) return String(d);
    const pad = (n: number) => String(n).padStart(2, "0");
    if (localization.timeFormat === "12h") {
      const h12 = ((date.getHours() + 11) % 12) + 1;
      return `${h12}:${pad(date.getMinutes())} ${date.getHours() >= 12 ? "PM" : "AM"}`;
    }
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }, [localization.timeFormat]);

  return (
    <AppContext.Provider value={{
      lang, setLang, theme, setTheme, toggleTheme, t: tFn, isRTL,
      categories, setCategories, grades, setGrades, customDepartments, setCustomDepartments,
      employees, setEmployees, addEmployee, updateEmployee, deleteEmployee,
      attendanceRecords, setAttendanceRecords, addAttendanceRecord, updateAttendanceRecord, deleteAttendanceRecord,
      leaveRequests, setLeaveRequests, addLeaveRequest, updateLeaveRequest, deleteLeaveRequest,
      leaveAdjustmentProposals, setLeaveAdjustmentProposals, addLeaveAdjustmentProposal, updateLeaveAdjustmentProposal, deleteLeaveAdjustmentProposal,
      payrollRecords, setPayrollRecords, addPayrollRecord, updatePayrollRecord, deletePayrollRecord,
      performanceReviews, setPerformanceReviews, addPerformanceReview, updatePerformanceReview, deletePerformanceReview,
      jobPostings, setJobPostings, addJobPosting, updateJobPosting, deleteJobPosting,
      candidates, setCandidates, addCandidate, updateCandidate, deleteCandidate,
      trainingPrograms, setTrainingPrograms, addTrainingProgram, updateTrainingProgram, deleteTrainingProgram,
      documents, setDocuments, addDocument, updateDocument, deleteDocument,
      documentTemplates, setDocumentTemplates, addDocumentTemplate, updateDocumentTemplate, deleteDocumentTemplate,
      promotionRules, setPromotionRules, promotionHistory, setPromotionHistory,
      recentActivities, addActivity,
      appearance, setAppearance, localization, setLocalization, security, setSecurity,
      formatCurrency, formatNumber, formatDate, formatTime,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
