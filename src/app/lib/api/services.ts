// ============================================================
// API Service Layer for Staffly AI
// High-level functions that mirror backend endpoints.
// Components call these instead of raw HTTP — when the real
// backend is deployed, only client.ts changes.
// ============================================================

import { api } from "./client";
import type {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  PayrollRecord,
  PerformanceReview,
  JobPosting,
  Candidate,
  TrainingProgram,
  Document,
} from "../../data/mock-data";

// --- Generic Response Types ---

interface ListResponse<T> {
  success: boolean;
  data: T[];
  pagination?: { page: number; limit: number; total: number };
}

interface SingleResponse<T> {
  success: boolean;
  data: T;
}

interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// --- Auth ---

export const authService = {
  login: (email: string, password: string) =>
    api.post<{ success: boolean; user: any; message?: string }>("/auth/login", { email, password }),

  logout: () => api.post<ActionResponse>("/auth/logout", {}),

  me: () => api.get<{ success: boolean; user: any }>("/auth/me"),
};

// --- Employees ---

export const employeeService = {
  list: (params?: { department?: string; status?: string; search?: string; page?: number; limit?: number }) => {
    const query = params ? "?" + new URLSearchParams(Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)])).toString() : "";
    return api.get<ListResponse<Employee>>(`/employees${query}`);
  },

  get: (id: string) => api.get<SingleResponse<Employee>>(`/employees/${id}`),

  create: (data: Partial<Employee>) =>
    api.post<SingleResponse<Employee>>("/employees", data),

  update: (id: string, data: Partial<Employee>) =>
    api.put<SingleResponse<Employee>>(`/employees/${id}`, data),

  delete: (id: string) => api.delete<ActionResponse>(`/employees/${id}`),
};

// --- Attendance ---

export const attendanceService = {
  list: () => api.get<ListResponse<AttendanceRecord>>("/attendance"),

  checkIn: (employeeId: string) =>
    api.post<SingleResponse<AttendanceRecord>>("/attendance", {
      employeeId,
      date: new Date().toISOString().split("T")[0],
      checkIn: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      status: "present",
    }),
};

// --- Leaves ---

export const leaveService = {
  list: (params?: { status?: string; employeeId?: string }) => {
    const query = params ? "?" + new URLSearchParams(Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)])).toString() : "";
    return api.get<ListResponse<LeaveRequest>>(`/leaves${query}`);
  },

  create: (data: { type: string; startDate: string; endDate: string; days: number; reason: string }) =>
    api.post<SingleResponse<LeaveRequest>>("/leaves", data),

  approve: (id: string, comments?: string) =>
    api.post<ActionResponse>(`/leaves/${id}/approve`, { action: "approve", comments }),

  reject: (id: string, comments?: string) =>
    api.post<ActionResponse>(`/leaves/${id}/approve`, { action: "reject", comments }),
};

// --- Payroll ---

export const payrollService = {
  list: () => api.get<ListResponse<PayrollRecord>>("/payroll"),

  process: (payPeriod: string, employeeIds?: string[]) =>
    api.post<ActionResponse & { data: PayrollRecord[] }>("/payroll/process", { payPeriod, employeeIds }),
};

// --- Performance ---

export const performanceService = {
  list: () => api.get<ListResponse<PerformanceReview>>("/performance"),
};

// --- Recruitment ---

export const recruitmentService = {
  listJobs: () => api.get<ListResponse<JobPosting>>("/recruitment/jobs"),

  listCandidates: () => api.get<ListResponse<Candidate>>("/recruitment/candidates"),

  moveCandidate: (id: string, stage: string) =>
    api.put<SingleResponse<Candidate>>(`/recruitment/candidates/${id}`, { stage }),
};

// --- Training ---

export const trainingService = {
  list: () => api.get<ListResponse<TrainingProgram>>("/training"),

  enroll: (programId: string) =>
    api.post<SingleResponse<TrainingProgram>>(`/training/${programId}/enroll`, {}),
};

// --- Documents ---

export const documentService = {
  list: () => api.get<ListResponse<Document>>("/documents"),

  generate: (employeeId: string, documentType: string) =>
    api.post<SingleResponse<Document> & { documentId: string; filename: string }>("/documents/generate", { employeeId, documentType }),
};

// --- Dashboard ---

export const dashboardService = {
  getActivity: () => api.get<ListResponse<any>>("/dashboard/activity"),
};
