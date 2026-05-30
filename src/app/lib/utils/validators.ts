// ============================================================
// Validation Schemas for Staffly AI
// Mirrors src/lib/server/utils/validators.js from the plan
// Used for client-side form validation before API submission
// ============================================================

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

function validate(rules: Record<string, (value: any) => string | null>, data: Record<string, any>): ValidationResult {
  const errors: Record<string, string> = {};
  for (const [field, check] of Object.entries(rules)) {
    const error = check(data[field]);
    if (error) errors[field] = error;
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

const required = (label: string) => (v: any) => (!v || (typeof v === "string" && !v.trim())) ? `${label} is required` : null;
const email = (v: string) => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Invalid email address" : null;
const phone = (v: string) => v && !/^\+?\d{9,15}$/.test(v.replace(/\s/g, "")) ? "Invalid phone number" : null;
const minLength = (label: string, min: number) => (v: string) => v && v.length < min ? `${label} must be at least ${min} characters` : null;
const positive = (label: string) => (v: number) => v != null && v <= 0 ? `${label} must be positive` : null;

/** Validate employee creation form */
export function validateEmployee(data: Record<string, any>): ValidationResult {
  return validate({
    firstName: required("First name"),
    lastName: required("Last name"),
    email: (v) => required("Email")(v) || email(v),
    phone: (v) => required("Phone")(v) || phone(v),
    department: required("Department"),
    position: required("Position"),
    salary: (v) => required("Salary")(v) || positive("Salary")(v),
    hireDate: required("Hire date"),
  }, data);
}

/** Validate leave request form */
export function validateLeaveRequest(data: Record<string, any>): ValidationResult {
  return validate({
    type: required("Leave type"),
    startDate: required("Start date"),
    endDate: (v) => {
      if (!v) return "End date is required";
      if (data.startDate && v < data.startDate) return "End date must be after start date";
      return null;
    },
    reason: (v) => required("Reason")(v) || minLength("Reason", 5)(v),
  }, data);
}

/** Validate login form */
export function validateLogin(data: Record<string, any>): ValidationResult {
  return validate({
    email: (v) => required("Email")(v) || email(v),
    password: (v) => required("Password")(v) || minLength("Password", 6)(v),
  }, data);
}

/** Validate payroll processing */
export function validatePayrollProcess(data: Record<string, any>): ValidationResult {
  return validate({
    payPeriod: (v) => {
      if (!v) return "Pay period is required";
      if (!/^\d{4}-\d{2}$/.test(v)) return "Pay period must be YYYY-MM format";
      return null;
    },
  }, data);
}

/** Validate document generation */
export function validateDocumentGeneration(data: Record<string, any>): ValidationResult {
  return validate({
    employeeId: required("Employee"),
    documentType: required("Document type"),
  }, data);
}
