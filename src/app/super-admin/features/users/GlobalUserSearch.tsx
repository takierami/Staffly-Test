import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase/supabaseClient";
import { DataTable } from "../../components/DataTable";
import { UserDetailDrawer } from "./UserDetailDrawer";

export function GlobalUserSearch() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    // Note: To fetch auth users globally, Super Admin should ideally use an edge function
    // For this prototype, we'll fetch from the profiles table which is synced with auth.users
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        organizations(name)
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  const columns = [
    {
      header: "User",
      accessorKey: "full_name",
      cell: (user: any) => (
        <div>
          <div className="font-medium text-slate-200">{user.full_name || "Unnamed User"}</div>
          <div className="text-xs text-slate-500">{user.id}</div>
        </div>
      ),
    },
    {
      header: "Role",
      accessorKey: "role",
      cell: (user: any) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          user.role === 'super_admin' ? 'bg-purple-500/20 text-purple-400' :
          user.role === 'org_admin' ? 'bg-blue-500/20 text-blue-400' :
          'bg-slate-800 text-slate-400'
        }`}>
          {user.role}
        </span>
      )
    },
    {
      header: "Organization",
      cell: (user: any) => (
        <span className="text-slate-300">
          {user.organizations?.name || <span className="text-slate-500 italic">None</span>}
        </span>
      ),
    }
  ];

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-10 bg-slate-800 rounded w-1/4"></div>
      <div className="h-64 bg-slate-800 rounded w-full"></div>
    </div>;
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Global User Search</h2>
          <p className="text-slate-400 text-sm mt-1">Find and manage any user across all tenants.</p>
        </div>
      </div>

      <DataTable 
        columns={columns as any}
        data={users}
        searchPlaceholder="Search users by name or ID..."
        onRowClick={(user) => setSelectedUser(user)}
      />

      <UserDetailDrawer 
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        userId={selectedUser?.id}
      />
    </div>
  );
}
