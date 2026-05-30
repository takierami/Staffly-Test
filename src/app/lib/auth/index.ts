// ============================================================
// Auth Utilities for Staffly AI
// Frontend auth layer — mirrors src/lib/server/auth from the plan
// In production, JWT ops happen server-side; this provides the
// client-side session store + API call wrappers.
// ============================================================

import type { AuthUser } from "../types/database";
import { api } from "../api/client";

const SESSION_KEY = "staffly-session";

/**
 * Login — calls POST /api/auth/login
 */
export async function login(email: string, password: string): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
  const res = await api.post<{ success: boolean; user: AuthUser; message?: string }>("/auth/login", { email, password });
  if (res.success && res.user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(res.user));
  }
  return res;
}

/**
 * Logout — calls POST /api/auth/logout
 */
export async function logout(): Promise<void> {
  await api.post("/auth/logout", {});
  sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Get current user from session (cached)
 */
export function getCurrentUser(): AuthUser | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Fetch fresh user from server — GET /api/auth/me
 */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const res = await api.get<{ success: boolean; user: AuthUser }>("/auth/me");
    if (res.success && res.user) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(res.user));
      return res.user;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if user has one of the required roles
 */
export function hasRole(user: AuthUser | null, roles: AuthUser["role"][]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

/**
 * Role hierarchy check
 */
const roleHierarchy: Record<string, number> = {
  admin: 100,
  hr_manager: 80,
  payroll_officer: 60,
  hr_officer: 50,
  manager: 40,
  employee: 10,
};

export function hasMinRole(user: AuthUser | null, minRole: AuthUser["role"]): boolean {
  if (!user) return false;
  return (roleHierarchy[user.role] || 0) >= (roleHierarchy[minRole] || 0);
}
