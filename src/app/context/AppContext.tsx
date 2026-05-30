import { createContext, useContext, useState, useEffect, useCallback, type ReactNode, useMemo } from "react";
import { type Lang, t as translate } from "../data/translations";
import { supabase } from "../lib/supabase/supabaseClient";
import {
  employeeService,
  leaveService,
  attendanceService,
  recruitmentService,
  performanceService,
  documentService,
  trainingService,
  notificationService,
  payrollService,
  departmentService,
  positionService,
  gradeService,
  employeeCategoryService,
  promotionService,
  auditService,
  systemSettingService,
} from "../lib/supabase/services";
import type {
  Employee,
  Department,
  Position,
  Grade,
  LeaveType,
  LeaveBalance,
  LeaveRequest,
  AttendanceRecord,
  PayrollRecord,
  PerformanceReview,
  PerformanceGoal,
  JobPosting,
  Candidate,
  TrainingProgram,
  TrainingEnrollment,
  Document,
  DocumentTemplate,
  Notification,
  AuditLog,
  SystemSetting,
  PromotionRule,
  PromotionRecord,
} from "../lib/supabase/db";

export interface CategoryItem {
  id: string;
  name: string;
  nameAr: string;
  department: string;
}

export interface GradeItem {
  id: string;
  name: string;
  nameAr?: string;
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

  categories: CategoryItem[];
  setCategories: React.Dispatch<React.SetStateAction<CategoryItem[]>>;
  customGrades: GradeItem[];
  setCustomGrades: React.Dispatch<React.SetStateAction<GradeItem[]>>;
  customDepartments: string[];
  setCustomDepartments: React.Dispatch<React.SetStateAction<string[]>>;

  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  addEmployee: (emp: Partial<Employee>) => Promise<Employee | null>;
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<boolean>;
  deleteEmployee: (id: string) => Promise<boolean>;
  refreshEmployees: () => Promise<void>;

  attendanceRecords: AttendanceRecord[];
  setAttendanceRecords: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  addAttendanceRecord: (rec: Partial<AttendanceRecord>) => Promise<AttendanceRecord | null>;
  updateAttendanceRecord: (id: string, data: Partial<AttendanceRecord>) => Promise<boolean>;
  deleteAttendanceRecord: (id: string) => Promise<boolean>;
  refreshAttendance: (filters?: { employee_id?: string; start_date?: string; end_date?: string }) => Promise<void>;

  leaveRequests: LeaveRequest[];
  setLeaveRequests: React.Dispatch<React.SetStateAction<LeaveRequest[]>>;
  addLeaveRequest: (req: Partial<LeaveRequest>) => Promise<LeaveRequest | null>;
  updateLeaveRequest: (id: string, data: Partial<LeaveRequest>) => Promise<boolean>;
  deleteLeaveRequest: (id: string) => Promise<boolean>;
  approveLeaveRequest: (id: string) => Promise<boolean>;
  rejectLeaveRequest: (id: string, reason: string) => Promise<boolean>;
  refreshLeaveRequests: (filters?: { employee_id?: string; status?: string }) => Promise<void>;

  payrollRecords: PayrollRecord[];
  setPayrollRecords: React.Dispatch<React.SetStateAction<PayrollRecord[]>>;
  addPayrollRecord: (rec: Partial<PayrollRecord>) => Promise<PayrollRecord | null>;
  updatePayrollRecord: (id: string, data: Partial<PayrollRecord>) => Promise<boolean>;
  deletePayrollRecord: (id: string) => Promise<boolean>;
  refreshPayroll: (filters?: { employee_id?: string; pay_period_month?: number; pay_period_year?: number }) => Promise<void>;

  performanceReviews: PerformanceReview[];
  setPerformanceReviews: React.Dispatch<React.SetStateAction<PerformanceReview[]>>;
  addPerformanceReview: (rev: Partial<PerformanceReview>) => Promise<PerformanceReview | null>;
  updatePerformanceReview: (id: string, data: Partial<PerformanceReview>) => Promise<boolean>;
  deletePerformanceReview: (id: string) => Promise<boolean>;
  refreshPerformanceReviews: (filters?: { employee_id?: string; status?: string }) => Promise<void>;

  jobPostings: JobPosting[];
  setJobPostings: React.Dispatch<React.SetStateAction<JobPosting[]>>;
  addJobPosting: (job: Partial<JobPosting>) => Promise<JobPosting | null>;
  updateJobPosting: (id: string, data: Partial<JobPosting>) => Promise<boolean>;
  deleteJobPosting: (id: string) => Promise<boolean>;
  refreshJobPostings: (filters?: { status?: string }) => Promise<void>;

  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  addCandidate: (can: Partial<Candidate>) => Promise<Candidate | null>;
  updateCandidate: (id: string, data: Partial<Candidate>) => Promise<boolean>;
  deleteCandidate: (id: string) => Promise<boolean>;
  refreshCandidates: (filters?: { job_id?: string; status?: string }) => Promise<void>;

  trainingPrograms: TrainingProgram[];
  setTrainingPrograms: React.Dispatch<React.SetStateAction<TrainingProgram[]>>;
  addTrainingProgram: (prog: Partial<TrainingProgram>) => Promise<TrainingProgram | null>;
  updateTrainingProgram: (id: string, data: Partial<TrainingProgram>) => Promise<boolean>;
  deleteTrainingProgram: (id: string) => Promise<boolean>;
  refreshTrainingPrograms: (filters?: { status?: string }) => Promise<void>;

  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  addDocument: (doc: Partial<Document>) => Promise<Document | null>;
  updateDocument: (id: string, data: Partial<Document>) => Promise<boolean>;
  deleteDocument: (id: string) => Promise<boolean>;
  refreshDocuments: (filters?: { employee_id?: string; status?: string }) => Promise<void>;

  documentTemplates: DocumentTemplate[];
  setDocumentTemplates: React.Dispatch<React.SetStateAction<DocumentTemplate[]>>;
  addDocumentTemplate: (tpl: Partial<DocumentTemplate>) => Promise<DocumentTemplate | null>;
  updateDocumentTemplate: (id: string, data: Partial<DocumentTemplate>) => Promise<boolean>;
  deleteDocumentTemplate: (id: string) => Promise<boolean>;
  refreshDocumentTemplates: () => Promise<void>;

  promotionRules: PromotionRule[];
  setPromotionRules: React.Dispatch<React.SetStateAction<PromotionRule[]>>;
  promotionHistory: PromotionRecord[];
  setPromotionHistory: React.Dispatch<React.SetStateAction<PromotionRecord[]>>;

  departments: Department[];
  positions: Position[];
  grades: Grade[];
  leaveTypes: LeaveType[];
  notifications: Notification[];

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

  loading: boolean;
  error: string | null;
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

  const [categories, setCategories] = usePersisted<CategoryItem[]>("staffly-categories", []);
  const [customGrades, setCustomGrades] = usePersisted<GradeItem[]>("staffly-grades", []);
  const [customDepartments, setCustomDepartments] = usePersisted<string[]>("staffly-departments", []);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgram[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentTemplates, setDocumentTemplates] = useState<DocumentTemplate[]>([]);
  const [promotionRules, setPromotionRules] = useState<PromotionRule[]>([]);
  const [promotionHistory, setPromotionHistory] = useState<PromotionRecord[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [gradeLevels, setGradeLevels] = useState<Grade[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const addActivity = useCallback((action: string, user: string, type: ActivityItem["type"]) => {
    setRecentActivities((prev) => [{
      id: Date.now(),
      action,
      user,
      time: "Just now",
      type,
    }, ...prev.slice(0, 49)]);
  }, []);

  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        await Promise.all([
          refreshEmployees(),
          refreshAttendance(),
          refreshLeaveRequests(),
          refreshPayroll(),
          refreshPerformanceReviews(),
          refreshJobPostings(),
          refreshCandidates(),
          refreshTrainingPrograms(),
          refreshDocuments(),
          refreshDocumentTemplates(),
          refreshDepartments(),
          refreshPositions(),
          refreshGrades(),
          refreshLeaveTypes(),
          refreshNotifications(),
          refreshPromotionRules(),
          refreshPromotionHistory(),
        ]);
      } catch (err) {
        console.error("Error loading initial data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Refresh functions
  const refreshEmployees = useCallback(async (filters?: { department_id?: string; status?: string; search?: string }) => {
    const data = await employeeService.getAll(filters);
    setEmployees(data);
  }, []);

  const refreshAttendance = useCallback(async (filters?: { employee_id?: string; start_date?: string; end_date?: string }) => {
    const data = await attendanceService.getAll(filters);
    setAttendanceRecords(data);
  }, []);

  const refreshLeaveRequests = useCallback(async (filters?: { employee_id?: string; status?: string }) => {
    const data = await leaveService.getRequests(filters);
    setLeaveRequests(data as LeaveRequest[]);
  }, []);

  const refreshPayroll = useCallback(async (filters?: { employee_id?: string; pay_period_month?: number; pay_period_year?: number }) => {
    const data = await payrollService.getAll(filters);
    setPayrollRecords(data as PayrollRecord[]);
  }, []);

  const refreshPerformanceReviews = useCallback(async (filters?: { employee_id?: string; status?: string }) => {
    const data = await performanceService.getReviews(filters);
    setPerformanceReviews(data as PerformanceReview[]);
  }, []);

  const refreshJobPostings = useCallback(async (filters?: { status?: string }) => {
    const data = await recruitmentService.getJobs(filters);
    setJobPostings(data as JobPosting[]);
  }, []);

  const refreshCandidates = useCallback(async (filters?: { job_id?: string; status?: string }) => {
    const data = await recruitmentService.getCandidates(filters);
    setCandidates(data as Candidate[]);
  }, []);

  const refreshTrainingPrograms = useCallback(async (filters?: { status?: string }) => {
    const data = await trainingService.getPrograms(filters);
    setTrainingPrograms(data as TrainingProgram[]);
  }, []);

  const refreshDocuments = useCallback(async (filters?: { employee_id?: string; status?: string }) => {
    const data = await documentService.getDocuments(filters);
    setDocuments(data as Document[]);
  }, []);

  const refreshDocumentTemplates = useCallback(async () => {
    const data = await documentService.getTemplates();
    setDocumentTemplates(data as DocumentTemplate[]);
  }, []);

  const refreshDepartments = useCallback(async () => {
    const data = await departmentService.getAll();
    setDepartments(data);
  }, []);

  const refreshPositions = useCallback(async () => {
    const data = await positionService.getAll();
    setPositions(data);
  }, []);

  const refreshGrades = useCallback(async () => {
    const data = await gradeService.getAll();
    setGradeLevels(data);
  }, []);

  const refreshLeaveTypes = useCallback(async () => {
    const data = await leaveService.getLeaveTypes();
    setLeaveTypes(data);
  }, []);

  const refreshNotifications = useCallback(async () => {
    const data = await notificationService.getUserNotifications({ limit: 50 });
    setNotifications(data);
  }, []);

  const refreshPromotionRules = useCallback(async () => {
    const data = await promotionService.getRules();
    setPromotionRules(data);
  }, []);

  const refreshPromotionHistory = useCallback(async () => {
    const data = await promotionService.getRecords();
    setPromotionHistory(data as PromotionRecord[]);
  }, []);

  // Employee CRUD
  const addEmployee = useCallback(async (emp: Partial<Employee>): Promise<Employee | null> => {
    const data = await employeeService.create(emp as any);
    if (data) {
      await refreshEmployees();
      addActivity(`New employee: ${data.first_name} ${data.last_name}`, "Admin", "employee");
    }
    return data;
  }, [refreshEmployees, addActivity]);

  const updateEmployee = useCallback(async (id: string, data: Partial<Employee>): Promise<boolean> => {
    const result = await employeeService.update(id, data);
    if (result) {
      await refreshEmployees();
      return true;
    }
    return false;
  }, [refreshEmployees]);

  const deleteEmployee = useCallback(async (id: string): Promise<boolean> => {
    const result = await employeeService.softDelete(id);
    if (result) {
      await refreshEmployees();
      addActivity("Employee removed", "Admin", "employee");
      return true;
    }
    return false;
  }, [refreshEmployees, addActivity]);

  // Attendance CRUD
  const addAttendanceRecord = useCallback(async (rec: Partial<AttendanceRecord>): Promise<AttendanceRecord | null> => {
    const data = await attendanceService.createRecord(rec as any);
    if (data) {
      await refreshAttendance();
    }
    return data;
  }, [refreshAttendance]);

  const updateAttendanceRecord = useCallback(async (id: string, data: Partial<AttendanceRecord>): Promise<boolean> => {
    const result = await attendanceService.updateRecord(id, data);
    if (result) {
      await refreshAttendance();
      return true;
    }
    return false;
  }, [refreshAttendance]);

  const deleteAttendanceRecord = useCallback(async (id: string): Promise<boolean> => {
    const result = await attendanceService.deleteRecord(id);
    if (result) {
      await refreshAttendance();
      return true;
    }
    return false;
  }, [refreshAttendance]);

  // Leave Request CRUD
  const addLeaveRequest = useCallback(async (req: Partial<LeaveRequest>): Promise<LeaveRequest | null> => {
    const data = await leaveService.createRequest(req as any);
    if (data) {
      await refreshLeaveRequests();
    }
    return data;
  }, [refreshLeaveRequests]);

  const updateLeaveRequest = useCallback(async (id: string, data: Partial<LeaveRequest>): Promise<boolean> => {
    const result = await leaveService.updateRequest(id, data);
    if (result) {
      await refreshLeaveRequests();
      return true;
    }
    return false;
  }, [refreshLeaveRequests]);

  const deleteLeaveRequest = useCallback(async (id: string): Promise<boolean> => {
    const result = await leaveService.cancelRequest(id);
    if (result) {
      await refreshLeaveRequests();
      return true;
    }
    return false;
  }, [refreshLeaveRequests]);

  const approveLeaveRequest = useCallback(async (id: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const result = await leaveService.approveRequest(id, user.id);
    if (result) {
      await refreshLeaveRequests();
      return true;
    }
    return false;
  }, [refreshLeaveRequests]);

  const rejectLeaveRequest = useCallback(async (id: string, reason: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const result = await leaveService.rejectRequest(id, user.id, reason);
    if (result) {
      await refreshLeaveRequests();
      return true;
    }
    return false;
  }, [refreshLeaveRequests]);

  // Payroll CRUD
  const addPayrollRecord = useCallback(async (rec: Partial<PayrollRecord>): Promise<PayrollRecord | null> => {
    const data = await payrollService.create(rec as any);
    if (data) {
      await refreshPayroll();
    }
    return data;
  }, [refreshPayroll]);

  const updatePayrollRecord = useCallback(async (id: string, data: Partial<PayrollRecord>): Promise<boolean> => {
    const result = await payrollService.update(id, data);
    if (result) {
      await refreshPayroll();
      return true;
    }
    return false;
  }, [refreshPayroll]);

  const deletePayrollRecord = useCallback(async (id: string): Promise<boolean> => {
    const result = await payrollService.delete(id);
    if (result) {
      await refreshPayroll();
      return true;
    }
    return false;
  }, [refreshPayroll]);

  // Performance Review CRUD
  const addPerformanceReview = useCallback(async (rev: Partial<PerformanceReview>): Promise<PerformanceReview | null> => {
    const data = await performanceService.createReview(rev as any);
    if (data) {
      await refreshPerformanceReviews();
      addActivity(`Performance review created`, "Admin", "performance");
    }
    return data;
  }, [refreshPerformanceReviews, addActivity]);

  const updatePerformanceReview = useCallback(async (id: string, data: Partial<PerformanceReview>): Promise<boolean> => {
    const result = await performanceService.updateReview(id, data);
    if (result) {
      await refreshPerformanceReviews();
      return true;
    }
    return false;
  }, [refreshPerformanceReviews]);

  const deletePerformanceReview = useCallback(async (id: string): Promise<boolean> => {
    const result = await performanceService.deleteReview(id);
    if (result) {
      await refreshPerformanceReviews();
      return true;
    }
    return false;
  }, [refreshPerformanceReviews]);

  // Job Posting CRUD
  const addJobPosting = useCallback(async (job: Partial<JobPosting>): Promise<JobPosting | null> => {
    const data = await recruitmentService.createJob(job as any);
    if (data) {
      await refreshJobPostings();
      addActivity(`Job posted: ${data.title}`, "Admin", "recruitment");
    }
    return data;
  }, [refreshJobPostings, addActivity]);

  const updateJobPosting = useCallback(async (id: string, data: Partial<JobPosting>): Promise<boolean> => {
    const result = await recruitmentService.updateJob(id, data);
    if (result) {
      await refreshJobPostings();
      return true;
    }
    return false;
  }, [refreshJobPostings]);

  const deleteJobPosting = useCallback(async (id: string): Promise<boolean> => {
    const result = await recruitmentService.deleteJob(id);
    if (result) {
      await refreshJobPostings();
      return true;
    }
    return false;
  }, [refreshJobPostings]);

  // Candidate CRUD
  const addCandidate = useCallback(async (can: Partial<Candidate>): Promise<Candidate | null> => {
    const data = await recruitmentService.createCandidate(can as any);
    if (data) {
      await refreshCandidates();
    }
    return data;
  }, [refreshCandidates]);

  const updateCandidate = useCallback(async (id: string, data: Partial<Candidate>): Promise<boolean> => {
    const result = await recruitmentService.updateCandidate(id, data);
    if (result) {
      await refreshCandidates();
      return true;
    }
    return false;
  }, [refreshCandidates]);

  const deleteCandidate = useCallback(async (id: string): Promise<boolean> => {
    const result = await recruitmentService.updateCandidate(id, { status: 'rejected' });
    if (result) {
      await refreshCandidates();
      return true;
    }
    return false;
  }, [refreshCandidates]);

  // Training Program CRUD
  const addTrainingProgram = useCallback(async (prog: Partial<TrainingProgram>): Promise<TrainingProgram | null> => {
    const data = await trainingService.createProgram(prog as any);
    if (data) {
      await refreshTrainingPrograms();
      addActivity(`Training: ${data.title}`, "Admin", "training");
    }
    return data;
  }, [refreshTrainingPrograms, addActivity]);

  const updateTrainingProgram = useCallback(async (id: string, data: Partial<TrainingProgram>): Promise<boolean> => {
    const result = await trainingService.updateProgram(id, data);
    if (result) {
      await refreshTrainingPrograms();
      return true;
    }
    return false;
  }, [refreshTrainingPrograms]);

  const deleteTrainingProgram = useCallback(async (id: string): Promise<boolean> => {
    const result = await trainingService.deleteProgram(id);
    if (result) {
      await refreshTrainingPrograms();
      return true;
    }
    return false;
  }, [refreshTrainingPrograms]);

  // Document CRUD
  const addDocument = useCallback(async (doc: Partial<Document>): Promise<Document | null> => {
    const data = await documentService.createDocument(doc as any);
    if (data) {
      await refreshDocuments();
      addActivity(`Document: ${data.title}`, "Admin", "document");
    }
    return data;
  }, [refreshDocuments, addActivity]);

  const updateDocument = useCallback(async (id: string, data: Partial<Document>): Promise<boolean> => {
    const result = await documentService.updateDocument(id, data);
    if (result) {
      await refreshDocuments();
      return true;
    }
    return false;
  }, [refreshDocuments]);

  const deleteDocument = useCallback(async (id: string): Promise<boolean> => {
    const result = await documentService.deleteDocument(id);
    if (result) {
      await refreshDocuments();
      return true;
    }
    return false;
  }, [refreshDocuments]);

  // Document Template CRUD
  const addDocumentTemplate = useCallback(async (tpl: Partial<DocumentTemplate>): Promise<DocumentTemplate | null> => {
    const data = await documentService.createTemplate(tpl as any);
    if (data) {
      await refreshDocumentTemplates();
      addActivity(`Template created: ${data.name}`, "Admin", "document");
    }
    return data;
  }, [refreshDocumentTemplates, addActivity]);

  const updateDocumentTemplate = useCallback(async (id: string, data: Partial<DocumentTemplate>): Promise<boolean> => {
    const result = await documentService.updateTemplate(id, data);
    if (result) {
      await refreshDocumentTemplates();
      return true;
    }
    return false;
  }, [refreshDocumentTemplates]);

  const deleteDocumentTemplate = useCallback(async (id: string): Promise<boolean> => {
    const result = await documentService.deleteTemplate(id);
    if (result) {
      await refreshDocumentTemplates();
      return true;
    }
    return false;
  }, [refreshDocumentTemplates]);

  // Formatting functions
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

  const contextValue = useMemo(() => ({
    lang, setLang, theme, setTheme, toggleTheme, t: tFn, isRTL,
    categories, setCategories, customGrades, setCustomGrades, customDepartments, setCustomDepartments,
    employees, setEmployees, addEmployee, updateEmployee, deleteEmployee, refreshEmployees,
    attendanceRecords, setAttendanceRecords, addAttendanceRecord, updateAttendanceRecord, deleteAttendanceRecord, refreshAttendance,
    leaveRequests, setLeaveRequests, addLeaveRequest, updateLeaveRequest, deleteLeaveRequest, approveLeaveRequest, rejectLeaveRequest, refreshLeaveRequests,
    payrollRecords, setPayrollRecords, addPayrollRecord, updatePayrollRecord, deletePayrollRecord, refreshPayroll,
    performanceReviews, setPerformanceReviews, addPerformanceReview, updatePerformanceReview, deletePerformanceReview, refreshPerformanceReviews,
    jobPostings, setJobPostings, addJobPosting, updateJobPosting, deleteJobPosting, refreshJobPostings,
    candidates, setCandidates, addCandidate, updateCandidate, deleteCandidate, refreshCandidates,
    trainingPrograms, setTrainingPrograms, addTrainingProgram, updateTrainingProgram, deleteTrainingProgram, refreshTrainingPrograms,
    documents, setDocuments, addDocument, updateDocument, deleteDocument, refreshDocuments,
    documentTemplates, setDocumentTemplates, addDocumentTemplate, updateDocumentTemplate, deleteDocumentTemplate, refreshDocumentTemplates,
    promotionRules, setPromotionRules, promotionHistory, setPromotionHistory,
    departments, positions, grades: gradeLevels, leaveTypes, notifications,
    recentActivities, addActivity,
    appearance, setAppearance, localization, setLocalization, security, setSecurity,
    formatCurrency, formatNumber, formatDate, formatTime,
    loading, error,
  }), [
    lang, theme, isRTL, categories, customGrades, customDepartments, employees, attendanceRecords,
    leaveRequests, payrollRecords, performanceReviews, jobPostings, candidates, trainingPrograms,
    documents, documentTemplates, promotionRules, promotionHistory, departments, positions,
    gradeLevels, leaveTypes, notifications, recentActivities, appearance, localization, security,
    loading, error, formatCurrency, formatNumber, formatDate, formatTime,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
