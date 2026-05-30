import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { authService } from "../lib/supabase/authService";
import { profileService } from "../lib/supabase/profileService";
import { supabaseAdmin } from "../lib/supabase/supabaseAdmin";

export type UserRole = "super_admin" | "admin" | "hr_manager" | "employee";

export type AccountStatus = "active" | "frozen" | "suspended" | "disabled";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  nameAr: string;
  role: UserRole;
  status: AccountStatus;
  organizationId?: string;
  avatar?: string;
  employeeId?: string;
  department?: string;
  position?: string;
  lastLogin?: string;
  createdAt: string;
  createdBy: string;
  passwordResetRequired?: boolean;
}

export interface ManagedAccount extends AuthUser {
  password?: string;
  loginCount: number;
  failedAttempts: number;
}

// Permission definitions
export const PERMISSIONS = {
  // Modules
  dashboard: ["admin", "hr_manager"],
  employees: ["admin", "hr_manager"],
  attendance: ["admin", "hr_manager"],
  leaves: ["admin", "hr_manager"],
  payroll: ["admin", "hr_manager"],
  performance: ["admin", "hr_manager"],
  promotions: ["admin", "hr_manager"],
  recruitment: ["admin", "hr_manager"],
  training: ["admin", "hr_manager"],
  documents: ["admin", "hr_manager"],
  customization: ["admin"],
  settings: ["admin", "hr_manager"],
  admin_privilege: ["admin"],
  // Employee portal modules
  portal: ["employee"],
  portal_leave: ["employee"],
  portal_documents: ["employee"],
  portal_training: ["employee"],
  portal_profile: ["employee"],
  // Actions
  create_admin: ["admin"],
  create_hr_manager: ["admin"],
  create_employee: ["admin", "hr_manager"],
  manage_accounts: ["admin"],
  reset_passwords: ["admin"],
  freeze_accounts: ["admin"],
  view_all_employees: ["admin", "hr_manager"],
  view_own_profile: ["admin", "hr_manager", "employee"],
} as const;

export function hasPermission(role: UserRole, permission: keyof typeof PERMISSIONS): boolean {
  if (role === "super_admin") return true;
  return (PERMISSIONS[permission as keyof typeof PERMISSIONS] as readonly string[]).includes(role);
}

interface AuthContextType {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  can: (permission: keyof typeof PERMISSIONS) => boolean;
  // Account management (admin only)
  accounts: ManagedAccount[];
  createAccount: (data: Omit<ManagedAccount, "id" | "createdAt" | "loginCount" | "failedAttempts">) => ManagedAccount;
  updateAccount: (id: string, data: Partial<ManagedAccount>) => void;
  deleteAccount: (id: string) => void;
  resetPassword: (id: string, newPassword: string) => void;
  setAccountStatus: (id: string, status: AccountStatus) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState<ManagedAccount[]>([]);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        const session = await authService.getSession();
        if (session && session.user) {
          const profile = await profileService.getProfile(session.user.id);
          if (mounted && profile) {
            setCurrentUser({
              id: session.user.id,
              email: session.user.email!,
              name: profile.full_name,
              nameAr: profile.full_name_ar || "",
              role: profile.role as UserRole,
              status: profile.status as AccountStatus,
              organizationId: profile.organization_id,
              avatar: profile.avatar_url,
              employeeId: profile.employee_id,
              department: profile.department,
              position: profile.position,
              createdAt: profile.created_at,
              createdBy: "system",
            });
          }
        }
      } catch (error) {
        console.error("Failed to load session", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadSession();

    const { data: authListener } = authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        try {
          const profile = await profileService.getProfile(session.user.id);
          if (profile) {
            setCurrentUser({
              id: session.user.id,
              email: session.user.email!,
              name: profile.full_name,
              nameAr: profile.full_name_ar || "",
              role: profile.role as UserRole,
              status: profile.status as AccountStatus,
              organizationId: profile.organization_id,
              avatar: profile.avatar_url,
              employeeId: profile.employee_id,
              department: profile.department,
              position: profile.position,
              createdAt: profile.created_at,
              createdBy: "system",
            });
            // Store the profile ID and role to help debug
            console.log('Auth: User signed in', { id: session.user.id, role: profile.role });
          } else {
            console.error('Auth: Profile not found for user', session.user.id);
          }
        } catch (error) {
          console.error("Failed to fetch profile:", error);
        } finally {
          setIsLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadAccounts() {
      if (currentUser && (currentUser.role === "admin" || currentUser.role === "super_admin")) {
        try {
          const profiles = await profileService.getProfiles(currentUser.organizationId);
          if (mounted) {
            setAccounts(profiles.map(p => ({
              id: p.id,
              email: p.email,
              name: p.full_name,
              nameAr: p.full_name_ar || "",
              role: p.role as UserRole,
              status: p.status as AccountStatus,
              organizationId: p.organization_id,
              avatar: p.avatar_url,
              employeeId: p.employee_id,
              department: p.department,
              position: p.position,
              createdAt: p.created_at,
              createdBy: "system",
              loginCount: 0,
              failedAttempts: 0,
            })));
          }
        } catch (error) {
          console.error("Failed to load accounts", error);
        }
      }
    }
    loadAccounts();
    return () => { mounted = false; };
  }, [currentUser]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      await authService.signIn(email, password);
      return { success: true, message: "Login successful." };
    } catch (error: any) {
      setIsLoading(false);
      return { success: false, message: error.message || "Login failed. Please check your credentials." };
    }
  }, []);

  const logout = useCallback(() => {
    authService.signOut().catch(err => console.error("Logout failed", err));
  }, []);

  const can = useCallback((permission: keyof typeof PERMISSIONS): boolean => {
    if (!currentUser) return false;
    return hasPermission(currentUser.role, permission);
  }, [currentUser]);

  const createAccount = useCallback((data: Omit<ManagedAccount, "id" | "createdAt" | "loginCount" | "failedAttempts">): ManagedAccount => {
    const account: ManagedAccount = {
      ...data,
      id: `ACC_${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
      loginCount: 0,
      failedAttempts: 0,
    };
    setAccounts((prev) => [account, ...prev]);

    if (currentUser?.organizationId) {
      supabaseAdmin.inviteUser(data.email, data.role, currentUser.organizationId).catch(err => {
        console.error("Failed to invite user", err);
      });
    }

    return account;
  }, [currentUser]);

  const updateAccount = useCallback((id: string, data: Partial<ManagedAccount>) => {
    setAccounts((prev) => prev.map((a) => a.id === id ? { ...a, ...data } : a));
    
    const updates: any = {};
    if (data.name) updates.full_name = data.name;
    if (data.nameAr !== undefined) updates.full_name_ar = data.nameAr;
    if (data.role) updates.role = data.role;
    if (data.status) updates.status = data.status;
    if (data.department !== undefined) updates.department = data.department;
    if (data.position !== undefined) updates.position = data.position;
    if (data.employeeId !== undefined) updates.employee_id = data.employeeId;
    
    profileService.updateProfile(id, updates).catch(err => {
      console.error("Failed to update account", err);
    });
  }, []);

  const deleteAccount = useCallback((id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const resetPassword = useCallback((id: string, newPassword: string) => {
    const account = accounts.find(a => a.id === id);
    if (account) {
      authService.resetPassword(account.email).catch(err => {
        console.error("Failed to reset password", err);
      });
    }
  }, [accounts]);

  const setAccountStatus = useCallback((id: string, status: AccountStatus) => {
    setAccounts((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
    profileService.setProfileStatus(id, status).catch(err => {
      console.error("Failed to set account status", err);
    });
  }, []);

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: !!currentUser,
      isLoading,
      login,
      logout,
      can,
      accounts,
      createAccount,
      updateAccount,
      deleteAccount,
      resetPassword,
      setAccountStatus,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
