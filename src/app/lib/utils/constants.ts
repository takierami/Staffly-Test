// ============================================================
// Constants for Staffly AI
// Mirrors src/lib/server/utils/constants.js
// ============================================================

export const EMPLOYEE_STATUSES = ["active", "on-leave", "probation", "terminated", "inactive"] as const;

export const EMPLOYMENT_TYPES = ["full-time", "part-time", "contract"] as const;

export const LEAVE_TYPES = [
  { id: "annual", name: "Annual Leave", nameAr: "إجازة سنوية", defaultDays: 30 },
  { id: "sick", name: "Sick Leave", nameAr: "إجازة مرضية", defaultDays: 15 },
  { id: "unpaid", name: "Unpaid Leave", nameAr: "إجازة بدون راتب", defaultDays: 10 },
  { id: "maternity", name: "Maternity Leave", nameAr: "إجازة أمومة", defaultDays: 98 },
  { id: "paternity", name: "Paternity Leave", nameAr: "إجازة أبوة", defaultDays: 3 },
  { id: "bereavement", name: "Bereavement Leave", nameAr: "إجازة وفاة", defaultDays: 3 },
  { id: "marriage", name: "Marriage Leave", nameAr: "إجازة زواج", defaultDays: 3 },
] as const;

export const DEPARTMENTS = [
  { id: "dept_engineering", name: "Engineering" },
  { id: "dept_hr", name: "HR" },
  { id: "dept_marketing", name: "Marketing" },
  { id: "dept_finance", name: "Finance" },
  { id: "dept_operations", name: "Operations" },
  { id: "dept_design", name: "Design" },
  { id: "dept_sales", name: "Sales" },
  { id: "dept_product", name: "Product" },
] as const;

export const DOCUMENT_TYPES = [
  { id: "work_certificate", name: "Attestation de travail", nameAr: "شهادة عمل" },
  { id: "salary_certificate", name: "Certificat de salaire", nameAr: "شهادة راتب" },
  { id: "annual_salary", name: "Relevé des salaires annuels", nameAr: "كشف الرواتب السنوي" },
  { id: "income_certificate", name: "Attestation de revenus", nameAr: "شهادة دخل" },
] as const;

export const USER_ROLES = [
  { id: "admin", name: "Super Admin", nameAr: "مدير النظام" },
  { id: "hr_manager", name: "HR Manager", nameAr: "مدير الموارد البشرية" },
  { id: "hr_officer", name: "HR Officer", nameAr: "مسؤول الموارد البشرية" },
  { id: "payroll_officer", name: "Payroll Officer", nameAr: "مسؤول الرواتب" },
  { id: "manager", name: "Department Manager", nameAr: "مدير القسم" },
  { id: "employee", name: "Employee", nameAr: "موظف" },
] as const;

export const CANDIDATE_STAGES = ["applied", "screening", "interview", "offer", "hired", "rejected"] as const;

export const PAYROLL_STATUSES = ["draft", "processed", "paid"] as const;

export const TRAINING_CATEGORIES = ["Technical", "Management", "Compliance", "Soft Skills"] as const;

/** Algerian social security rates */
export const ALGERIAN_RATES = {
  CNAS_EMPLOYEE: 0.09,   // 9%
  CNAS_EMPLOYER: 0.26,   // 26%
  IRG_BASE: 0.10,        // 10% base (simplified)
  RETIREMENT: 0.065,     // 6.5%
  WORK_ACCIDENT: 0.0125, // 1.25%
} as const;
