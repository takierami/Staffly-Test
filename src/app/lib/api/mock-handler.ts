// ============================================================
// Mock API Handler for Staffly AI
// Simulates backend responses using in-memory data.
// Mirrors the exact API endpoints from the migration plan:
//   - POST /auth/login, /auth/logout, GET /auth/me
//   - GET/POST /employees, GET/PUT/DELETE /employees/:id
//   - GET/POST /leaves, POST /leaves/:id/approve
//   - POST /payroll/process
//   - POST /documents/generate
//   - GET/POST /attendance
//   - GET /recruitment/jobs, GET /recruitment/candidates
//   - GET /training, POST /training/:id/enroll
//   - GET /performance
// ============================================================

import {
  employees as rawEmployees,
  attendanceRecords,
  leaveRequests as rawLeaves,
  payrollRecords as rawPayroll,
  performanceReviews,
  jobPostings,
  candidates as rawCandidates,
  trainingPrograms as rawTraining,
  documents as rawDocs,
  recentActivities,
} from "../../data/mock-data";

// Deep-clone mock data so mutations don't affect imports
let employees = structuredClone(rawEmployees);
let leaves = structuredClone(rawLeaves);
let payroll = structuredClone(rawPayroll);
let attendance = structuredClone(attendanceRecords);
let candidates = structuredClone(rawCandidates);
let training = structuredClone(rawTraining);
let docs = structuredClone(rawDocs);

// Simulated session
let currentSession: { userId: string; employeeId: string; email: string; role: string; name: string } | null = {
  userId: "user_admin",
  employeeId: "EMP002",
  email: "admin@staffly.dz",
  role: "admin",
  name: "Admin User",
};

/** Simulate async latency */
const delay = (ms = 150) => new Promise((r) => setTimeout(r, ms));

// Route matcher
type RouteHandler = (params: Record<string, string>, body?: unknown) => Promise<unknown>;
interface Route {
  method: string;
  pattern: RegExp;
  keys: string[];
  handler: RouteHandler;
}

function route(method: string, path: string, handler: RouteHandler): Route {
  const keys: string[] = [];
  const pattern = new RegExp(
    "^" + path.replace(/:(\w+)/g, (_, key) => { keys.push(key); return "([^/]+)"; }) + "$"
  );
  return { method, pattern, keys, handler };
}

// ---- Routes ----

const routes: Route[] = [
  // Auth
  route("POST", "/auth/login", async (_p, body: any) => {
    await delay(300);
    if (body?.email && body?.password) {
      currentSession = { userId: "user_admin", employeeId: "EMP002", email: body.email, role: "admin", name: "Admin User" };
      return { success: true, user: currentSession };
    }
    return { success: false, message: "Invalid credentials" };
  }),

  route("POST", "/auth/logout", async () => {
    await delay();
    currentSession = null;
    return { success: true, message: "Logged out successfully" };
  }),

  route("GET", "/auth/me", async () => {
    await delay();
    if (!currentSession) return { success: false, message: "Not authenticated" };
    return { success: true, user: currentSession };
  }),

  // Employees - List
  route("GET", "/employees", async () => {
    await delay();
    return { success: true, data: employees, pagination: { page: 1, limit: 50, total: employees.length } };
  }),

  // Employees - Create
  route("POST", "/employees", async (_p, body: any) => {
    await delay(200);
    const code = `EMP${String(employees.length + 1).padStart(3, "0")}`;
    const newEmp = {
      id: code,
      code,
      firstName: body?.personalInfo?.firstName || body?.firstName || "",
      lastName: body?.personalInfo?.lastName || body?.lastName || "",
      email: body?.contactInfo?.email || body?.email || "",
      phone: body?.contactInfo?.phone || body?.phone || "",
      department: body?.employment?.department?.name || body?.department || "",
      position: body?.employment?.position?.title || body?.position || "",
      status: "active" as const,
      hireDate: body?.employment?.hireDate || new Date().toISOString().split("T")[0],
      salary: body?.compensation?.basicSalary || body?.salary || 0,
      employmentType: body?.employment?.employmentType || body?.employmentType || "full-time",
    };
    employees.push(newEmp);
    return { success: true, data: newEmp };
  }),

  // Employees - Get by ID
  route("GET", "/employees/:id", async (p) => {
    await delay();
    const emp = employees.find((e) => e.id === p.id);
    if (!emp) return { success: false, error: "Employee not found" };
    return { success: true, data: emp };
  }),

  // Employees - Update
  route("PUT", "/employees/:id", async (p, body: any) => {
    await delay(200);
    const idx = employees.findIndex((e) => e.id === p.id);
    if (idx === -1) return { success: false, error: "Employee not found" };
    employees[idx] = { ...employees[idx], ...body };
    return { success: true, data: employees[idx] };
  }),

  // Employees - Delete (soft)
  route("DELETE", "/employees/:id", async (p) => {
    await delay(200);
    const idx = employees.findIndex((e) => e.id === p.id);
    if (idx === -1) return { success: false, error: "Employee not found" };
    employees[idx].status = "terminated";
    return { success: true, message: "Employee deactivated successfully" };
  }),

  // Attendance
  route("GET", "/attendance", async () => {
    await delay();
    return { success: true, data: attendance };
  }),

  route("POST", "/attendance", async (_p, body: any) => {
    await delay();
    const record = { id: `ATT${String(attendance.length + 1).padStart(3, "0")}`, ...body };
    attendance.push(record);
    return { success: true, data: record };
  }),

  // Leaves - List
  route("GET", "/leaves", async () => {
    await delay();
    return { success: true, data: leaves };
  }),

  // Leaves - Create
  route("POST", "/leaves", async (_p, body: any) => {
    await delay(200);
    const req = {
      id: `LR${String(leaves.length + 1).padStart(3, "0")}`,
      employeeId: body?.employeeId || "EMP001",
      employeeName: body?.employeeName || "Admin User",
      type: body?.leaveType || body?.type || "annual",
      startDate: body?.startDate || "",
      endDate: body?.endDate || "",
      days: body?.numberOfDays || body?.days || 1,
      reason: body?.reason || "",
      status: "pending" as const,
      requestDate: new Date().toISOString(),
    };
    leaves.unshift(req);
    return { success: true, data: req };
  }),

  // Leaves - Approve
  route("POST", "/leaves/:id/approve", async (p, body: any) => {
    await delay(200);
    const idx = leaves.findIndex((l) => l.id === p.id);
    if (idx === -1) return { success: false, error: "Leave request not found" };
    leaves[idx].status = body?.action === "reject" ? "rejected" : "approved";
    return { success: true, message: `Leave request ${leaves[idx].status} successfully` };
  }),

  // Payroll - Process
  route("POST", "/payroll/process", async (_p, body: any) => {
    await delay(500);
    payroll = payroll.map((r) => (r.status === "draft" ? { ...r, status: "processed" as const } : r));
    return { success: true, message: `Payroll processed for ${payroll.length} employees`, data: payroll };
  }),

  // Payroll - List
  route("GET", "/payroll", async () => {
    await delay();
    return { success: true, data: payroll };
  }),

  // Documents - Generate
  route("POST", "/documents/generate", async (_p, body: any) => {
    await delay(1500);
    const emp = employees.find((e) => e.id === body?.employeeId);
    if (!emp) return { success: false, error: "Employee not found" };
    const docId = `DOC${String(docs.length + 1).padStart(3, "0")}`;
    const newDoc = {
      id: docId,
      name: `${body?.documentType || "Document"} - ${emp.firstName} ${emp.lastName}`,
      type: body?.documentType || "work_certificate",
      employeeName: `${emp.firstName} ${emp.lastName}`,
      generatedDate: new Date().toISOString().split("T")[0],
      status: "generated" as const,
    };
    docs.unshift(newDoc);
    return { success: true, documentId: docId, filename: `${docId}.pdf`, data: newDoc };
  }),

  // Documents - List
  route("GET", "/documents", async () => {
    await delay();
    return { success: true, data: docs };
  }),

  // Recruitment
  route("GET", "/recruitment/jobs", async () => {
    await delay();
    return { success: true, data: jobPostings };
  }),

  route("GET", "/recruitment/candidates", async () => {
    await delay();
    return { success: true, data: candidates };
  }),

  route("PUT", "/recruitment/candidates/:id", async (p, body: any) => {
    await delay();
    const idx = candidates.findIndex((c) => c.id === p.id);
    if (idx === -1) return { success: false, error: "Candidate not found" };
    candidates[idx] = { ...candidates[idx], ...body };
    return { success: true, data: candidates[idx] };
  }),

  // Training
  route("GET", "/training", async () => {
    await delay();
    return { success: true, data: training };
  }),

  route("POST", "/training/:id/enroll", async (p) => {
    await delay();
    const idx = training.findIndex((t) => t.id === p.id);
    if (idx === -1) return { success: false, error: "Training program not found" };
    if (training[idx].enrolled >= training[idx].capacity) return { success: false, error: "Program is full" };
    training[idx].enrolled += 1;
    return { success: true, data: training[idx] };
  }),

  // Performance
  route("GET", "/performance", async () => {
    await delay();
    return { success: true, data: performanceReviews };
  }),

  // Dashboard / Activity
  route("GET", "/dashboard/activity", async () => {
    await delay();
    return { success: true, data: recentActivities };
  }),
];

// ---- Dispatcher ----

export async function handleMockRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  for (const r of routes) {
    if (r.method !== method) continue;
    const match = path.match(r.pattern);
    if (!match) continue;

    const params: Record<string, string> = {};
    r.keys.forEach((key, i) => { params[key] = match[i + 1]; });

    const result = await r.handler(params, body);
    return result as T;
  }

  console.warn(`[MockAPI] No handler for ${method} ${path}`);
  return { success: false, error: `No handler for ${method} ${path}` } as T;
}
