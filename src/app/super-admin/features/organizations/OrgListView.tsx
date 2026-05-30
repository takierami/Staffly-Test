import { useState, useEffect } from "react";
import { DataTable } from "../../components/DataTable";
import { StatusBadge } from "../../components/StatusBadge";
import { supabase } from "../../../lib/supabase/supabaseClient";
import { useNavigate } from "react-router";
import { MoreVertical, ShieldAlert } from "lucide-react";
import { format } from "date-fns";

export function OrgListView() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    setLoading(true);
    // Fetch organizations including soft-deleted ones for super admins
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrganizations(data);
    }
    setLoading(false);
  };

  const columns = [
    {
      header: "Organization Name",
      accessorKey: "name",
      cell: (org: any) => (
        <div className="flex items-center">
          <div className="font-medium text-slate-200">{org.name}</div>
          {org.deleted_at && (
            <span className="ml-2 px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-wider">
              Deleted
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (org: any) => (
        <StatusBadge 
          status={org.deleted_at ? 'Deleted' : org.status || 'Active'} 
          variant={org.deleted_at ? 'danger' : undefined}
        />
      ),
    },
    {
      header: "Health",
      accessorKey: "health_score",
      cell: (org: any) => {
        const score = org.health_score || 100;
        let colorClass = "text-emerald-400";
        if (score < 50) colorClass = "text-rose-400";
        else if (score < 80) colorClass = "text-amber-400";
        
        return <div className={`font-semibold ${colorClass}`}>{score}/100</div>;
      },
    },
    {
      header: "Created",
      accessorKey: "created_at",
      cell: (org: any) => (
        <span className="text-slate-400">
          {format(new Date(org.created_at), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (org: any) => (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/super-admin/organizations/${org.id}`);
          }}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
        >
          <MoreVertical size={16} />
        </button>
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Organizations</h2>
          <p className="text-slate-400 text-sm mt-1">Manage all tenant workspaces across the platform.</p>
        </div>
        <button
          onClick={() => navigate('/super-admin/organizations/new')}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow shadow-blue-500/20 transition-all"
        >
          Create Organization & Invite Admin
        </button>
      </div>

      <DataTable 
        columns={columns as any}
        data={organizations}
        searchPlaceholder="Search organizations by name or status..."
        onRowClick={(org) => navigate(`/super-admin/organizations/${org.id}`)}
      />
    </div>
  );
}
