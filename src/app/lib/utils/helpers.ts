// ============================================================
// Helper Utilities for Staffly AI
// Mirrors src/lib/server/utils/helpers.js
// ============================================================

/** Format currency in DZD */
export function formatCurrency(amount: number, currency = "DZD"): string {
  return `${amount.toLocaleString()} ${currency}`;
}

/** Generate employee code: EMP001, EMP002, etc. */
export function generateEmployeeCode(lastCode?: string): string {
  if (!lastCode) return "EMP001";
  const num = parseInt(lastCode.replace("EMP", "")) + 1;
  return `EMP${num.toString().padStart(3, "0")}`;
}

/** Calculate working days between two dates (excluding weekends) */
export function calcWorkingDays(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  let count = 0;
  const current = new Date(s);
  while (current <= e) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

/** Calculate Algerian payroll deductions */
export function calcAlgerianDeductions(basicSalary: number) {
  const socialSecurity = basicSalary * 0.09;  // 9% CNAS employee
  const incomeTax = basicSalary * 0.10;        // IRG simplified
  const totalDeductions = socialSecurity + incomeTax;
  return {
    socialSecurity: Math.round(socialSecurity),
    incomeTax: Math.round(incomeTax),
    totalDeductions: Math.round(totalDeductions),
    netSalary: Math.round(basicSalary - totalDeductions),
  };
}

/** Format date for display */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/** Get initials from name */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
}

/** Truncate text */
export function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}
