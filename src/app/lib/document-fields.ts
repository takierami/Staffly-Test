import type { Employee } from "../data/mock-data";

export interface FieldDef {
  key: string;
  label: string;
  category: "personal" | "job" | "system";
}

export const AVAILABLE_FIELDS: FieldDef[] = [
  { key: "employee_id", label: "Employee ID", category: "personal" },
  { key: "employee_code", label: "Employee Code", category: "personal" },
  { key: "employee_full_name", label: "Full Name", category: "personal" },
  { key: "employee_first_name", label: "First Name", category: "personal" },
  { key: "employee_last_name", label: "Last Name", category: "personal" },
  { key: "employee_email", label: "Email", category: "personal" },
  { key: "employee_phone", label: "Phone Number", category: "personal" },
  { key: "employee_department", label: "Department", category: "job" },
  { key: "employee_position", label: "Position", category: "job" },
  { key: "employee_status", label: "Status", category: "job" },
  { key: "employee_hire_date", label: "Hire Date", category: "job" },
  { key: "employee_salary", label: "Salary", category: "job" },
  { key: "employee_employment_type", label: "Employment Type", category: "job" },
  { key: "employee_reports_to", label: "Manager Name", category: "job" },
  { key: "employee_category", label: "Category", category: "job" },
  { key: "employee_grade", label: "Grade", category: "job" },
  { key: "current_date", label: "Today's Date", category: "system" },
  { key: "company_name", label: "Company Name", category: "system" },
];

export function buildFieldValues(emp: Employee, companyName = "Company", formatSalary?: (n: number) => string, formatDateFn?: (d: string) => string): Record<string, string> {
  return {
    employee_id: emp.id,
    employee_code: emp.code,
    employee_full_name: `${emp.firstName} ${emp.lastName}`,
    employee_first_name: emp.firstName,
    employee_last_name: emp.lastName,
    employee_email: emp.email,
    employee_phone: emp.phone,
    employee_department: emp.department,
    employee_position: emp.position,
    employee_status: emp.status,
    employee_hire_date: formatDateFn ? formatDateFn(emp.hireDate) : emp.hireDate,
    employee_salary: formatSalary ? formatSalary(emp.salary) : `${emp.salary.toLocaleString()} DZD`,
    employee_employment_type: emp.employmentType,
    employee_reports_to: emp.reportsTo || "—",
    employee_category: emp.category || "—",
    employee_grade: emp.grade || "—",
    current_date: formatDateFn ? formatDateFn(new Date().toISOString().split("T")[0]) : new Date().toISOString().split("T")[0],
    company_name: companyName,
  };
}

export function renderTemplate(content: string, values: Record<string, string>): string {
  return content.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    return values[key] !== undefined ? values[key] : `{{${key}}}`;
  });
}

export function extractPlaceholders(content: string): string[] {
  const matches = content.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g);
  return Array.from(new Set(Array.from(matches, (m) => m[1])));
}
