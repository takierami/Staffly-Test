import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  );
}

export function RequireAuth() {
  const { isAuthenticated, currentUser, isLoading } = useAuth();
  if (isLoading) return <FullScreenLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (currentUser?.role === "employee") return <Navigate to="/portal" replace />;
  return <Outlet />;
}

export function RequireEmployee() {
  const { isAuthenticated, currentUser, isLoading } = useAuth();
  if (isLoading) return <FullScreenLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (currentUser?.role !== "employee") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export function GuestOnly() {
  const { isAuthenticated, currentUser, isLoading } = useAuth();
  if (isLoading) return <FullScreenLoader />;
  if (isAuthenticated) {
    if (currentUser?.role === 'super_admin') return <Navigate to="/super-admin" replace />;
    return <Navigate to={currentUser?.role === "employee" ? "/portal" : "/dashboard"} replace />;
  }
  return <Outlet />;
}

export function RequireAdmin() {
  const { currentUser, isLoading } = useAuth();
  if (isLoading) return <FullScreenLoader />;
  if (currentUser?.role !== "admin") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export function RequireSuperAdmin() {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <FullScreenLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (currentUser?.role !== 'super_admin') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
