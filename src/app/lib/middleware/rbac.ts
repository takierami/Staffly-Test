// ============================================================
// Role-Based Access Control (RBAC) for Staffly AI
// Mirrors src/lib/server/middleware/rbac.js from the plan
// Used on the frontend for UI gating; backend enforces server-side
// ============================================================

import type { AuthUser } from "../types/database";

export type Permission =
  | "employees:read" | "employees:write" | "employees:delete"
  | "attendance:read" | "attendance:write"
  | "leaves:read" | "leaves:write" | "leaves:approve"
  | "payroll:read" | "payroll:process"
  | "performance:read" | "performance:write"
  | "recruitment:read" | "recruitment:write"
  | "training:read" | "training:write"
  | "documents:read" | "documents:generate"
  | "settings:read" | "settings:write"
  | "users:manage";

/**
 * Role → Permission mapping
 */
const rolePermissions: Record<AuthUser["role"], Permission[]> = {
  admin: [
    "employees:read", "employees:write", "employees:delete",
    "attendance:read", "attendance:write",
    "leaves:read", "leaves:write", "leaves:approve",
    "payroll:read", "payroll:process",
    "performance:read", "performance:write",
    "recruitment:read", "recruitment:write",
    "training:read", "training:write",
    "documents:read", "documents:generate",
    "settings:read", "settings:write",
    "users:manage",
  ],
  hr_manager: [
    "employees:read", "employees:write",
    "attendance:read", "attendance:write",
    "leaves:read", "leaves:write", "leaves:approve",
    "payroll:read",
    "performance:read", "performance:write",
    "recruitment:read", "recruitment:write",
    "training:read", "training:write",
    "documents:read", "documents:generate",
    "settings:read",
  ],
  payroll_officer: [
    "employees:read",
    "attendance:read",
    "leaves:read",
    "payroll:read", "payroll:process",
    "documents:read", "documents:generate",
  ],
  hr_officer: [
    "employees:read", "employees:write",
    "attendance:read", "attendance:write",
    "leaves:read", "leaves:write",
    "recruitment:read", "recruitment:write",
    "training:read",
    "documents:read", "documents:generate",
  ],
  manager: [
    "employees:read",
    "attendance:read",
    "leaves:read", "leaves:approve",
    "performance:read", "performance:write",
    "training:read",
    "documents:read",
  ],
  employee: [
    "attendance:read",
    "leaves:read", "leaves:write",
    "performance:read",
    "training:read",
    "documents:read",
  ],
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: AuthUser | null, permission: Permission): boolean {
  if (!user) return false;
  return rolePermissions[user.role]?.includes(permission) ?? false;
}

/**
 * Check if a user has ALL of the specified permissions
 */
export function hasAllPermissions(user: AuthUser | null, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(user, p));
}

/**
 * Check if a user has ANY of the specified permissions
 */
export function hasAnyPermission(user: AuthUser | null, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(user, p));
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: AuthUser["role"]): Permission[] {
  return rolePermissions[role] || [];
}
