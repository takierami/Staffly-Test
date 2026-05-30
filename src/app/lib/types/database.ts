// ============================================================
// Database Document Schemas for Staffly AI HRMS
// Generic schema definitions for Supabase migration
// ============================================================

/** Base document fields */
export interface DatabaseDocument {
  id: string;
  created_at?: string;
  updated_at?: string;
}

/** Metadata attached to all documents */
export interface DocumentMetadata {
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// ----- Employee -----

export interface DepartmentRef {
  id: string;
  name: string;
}

export interface PositionRef {
  id: string;
  title: string;
}

export interface DBEmployee extends DatabaseDocument {
  employeeCode: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: "male" | "female";
    nationalId?: string;
    maritalStatus?: string;
    nationality?: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    address?: string;
    city?: string;
    wilaya?: string;
  };
  employment: {
    department: DepartmentRef;
    position: PositionRef;
    employmentType: "full-time" | "part-time" | "contract";
    hireDate: string;
    status: "active" | "on-leave" | "probation" | "inactive" | "terminated";
    terminationDate?: string;
    reportsTo?: string;
  };
  compensation: {
    basicSalary: number;
    currency: string;
    allowances?: { type: string; amount: number }[];
    deductions?: { type: string; amount: number }[];
  };
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    rib?: string;
  };
  emergencyContacts?: {
    name: string;
    relationship: string;
    phone: string;
  }[];
  metadata: DocumentMetadata;
}

// ----- Attendance -----

export interface DBAttendance extends DatabaseDocument {
  employeeId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  hoursWorked: number;
  status: "present" | "absent" | "late" | "half-day";
  location?: string;
  notes?: string;
}

// ----- Leave -----

export interface DBLeaveRequest extends DatabaseDocument {
  employeeId: string;
  leaveType: { id: string; name: string };
  startDate: string;
  endDate: string;
  numberOfDays: number;
  dayType: "full" | "half-morning" | "half-afternoon";
  reason: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  approverId: string | null;
  approverName: string | null;
  requestDate: string;
  approvalDate: string | null;
  approverComments: string | null;
  attachment: string | null;
}

export interface DBLeaveBalance extends DatabaseDocument {
  employeeId: string;
  leaveTypeId: string;
  leaveTypeName: string;
  year: number;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  carryOver: number;
  lastUpdated: string;
}

// ----- Payroll -----

export interface DBPayroll extends DatabaseDocument {
  employeeId: string;
  payrollPeriod: string; // YYYY-MM
  basicSalary: number;
  earnings: { type: string; amount: number }[];
  deductions: { type: string; amount: number }[];
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
  currency: string;
  status: "draft" | "processed" | "paid";
  processedBy: string;
  processedAt: string;
}

// ----- Performance -----

export interface DBPerformanceReview extends DatabaseDocument {
  employeeId: string;
  reviewerId: string;
  reviewPeriod: string;
  rating: number;
  status: "pending" | "in-progress" | "completed";
  goals: {
    title: string;
    description?: string;
    progress: number;
    status: "not-started" | "in-progress" | "completed";
  }[];
  strengths?: string[];
  improvements?: string[];
  comments?: string;
}

// ----- Recruitment -----

export interface DBJobPosting extends DatabaseDocument {
  title: string;
  department: DepartmentRef;
  location: string;
  employmentType: "full-time" | "part-time" | "contract";
  description: string;
  requirements: string[];
  salaryRange?: { min: number; max: number; currency: string };
  status: "draft" | "open" | "closed";
  applicants: number;
  postedDate: string;
  closingDate?: string;
}

export interface DBCandidate extends DatabaseDocument {
  name: string;
  email: string;
  phone?: string;
  jobId: string;
  jobTitle: string;
  stage: "applied" | "screening" | "interview" | "offer" | "hired" | "rejected";
  rating: number;
  resume?: string;
  notes?: string;
  appliedDate: string;
}

// ----- Training -----

export interface DBTrainingProgram extends DatabaseDocument {
  title: string;
  category: string;
  description?: string;
  instructor: string;
  startDate: string;
  endDate: string;
  enrolled: number;
  capacity: number;
  status: "upcoming" | "in-progress" | "completed";
}

// ----- Documents -----

export interface DBDocument extends DatabaseDocument {
  employeeId: string;
  documentType: string;
  filename: string;
  generatedBy: string;
  generatedAt: string;
  status: "generated" | "pending" | "signed";
}

// ----- Users / Auth -----

export interface DBUser extends DatabaseDocument {
  employeeId: string;
  email: string;
  passwordHash: string;
  role: "admin" | "hr_manager" | "hr_officer" | "manager" | "employee" | "payroll_officer";
  isActive: boolean;
  lastLogin: string | null;
}

export interface AuthPayload {
  userId: string;
  employeeId: string;
  email: string;
  role: DBUser["role"];
}

export interface AuthUser {
  id: string;
  employeeId: string;
  email: string;
  role: DBUser["role"];
  name: string;
  department: DepartmentRef;
  position: PositionRef;
}

// ----- System -----

export interface DBAuditLog extends DatabaseDocument {
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  userName: string;
  details: Record<string, unknown>;
  timestamp: string;
}
