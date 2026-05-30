import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { supabase } from "../../../lib/supabase/supabaseClient";
import { StatusBadge } from "../../components/StatusBadge";
import { ConfirmActionModal } from "../../components/ConfirmActionModal";
import { ArrowLeft, Users, AlertTriangle, Play, Pause, Trash2, RotateCcw } from "lucide-react";
import { format } from "date-fns";

export function OrgDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) fetchOrgDetails();
  }, [id]);

  const fetchOrgDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      setOrg(data);
    }
    setLoading(false);
  };

  const handleAction = async (action: 'suspend' | 'restore' | 'soft_delete') => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('sa-tenant-lifecycle', {
        body: { organization_id: id, action, reason: `Action performed by Super Admin via Dashboard` }
      });

      if (error) throw error;
      
      // Refresh
      await fetchOrgDetails();
    } catch (error) {
      console.error("Action failed:", error);
      alert("Failed to perform action");
    } finally {
      setActionLoading(false);
      setIsSuspendModalOpen(false);
      setIsDeleteModalOpen(false);
      setIsRestoreModalOpen(false);
    }
  };

  if (loading) {
    return <div className="text-slate-400">Loading organization details...</div>;
  }

  if (!org) {
    return <div className="text-slate-400">Organization not found.</div>;
  }

  const isDeleted = !!org.deleted_at;
  const isSuspended = org.status === 'suspended';

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate('/super-admin/organizations')}
        className="flex items-center text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} className="mr-1" /> Back to Organizations
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              {org.name}
              {isDeleted && <span className="ml-3 px-2 py-1 bg-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider rounded">Soft Deleted</span>}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <span className="flex items-center"><Users size={16} className="mr-1" /> ID: {org.id}</span>
              <span>Created: {format(new Date(org.created_at), "MMM d, yyyy")}</span>
              <StatusBadge status={isDeleted ? 'Deleted' : org.status || 'Active'} variant={isDeleted ? 'danger' : undefined} />
            </div>
          </div>
          
          <div className="flex space-x-2">
            {!isDeleted && !isSuspended && (
              <button 
                onClick={() => setIsSuspendModalOpen(true)}
                className="px-3 py-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg text-sm font-medium transition-colors flex items-center"
              >
                <Pause size={16} className="mr-2" /> Suspend
              </button>
            )}
            
            {(isDeleted || isSuspended) && (
              <button 
                onClick={() => setIsRestoreModalOpen(true)}
                className="px-3 py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-sm font-medium transition-colors flex items-center"
              >
                <RotateCcw size={16} className="mr-2" /> Restore
              </button>
            )}
            
            {!isDeleted && (
              <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-3 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg text-sm font-medium transition-colors flex items-center"
              >
                <Trash2 size={16} className="mr-2" /> Delete
              </button>
            )}
          </div>
        </div>

        {org.suspension_reason && (
          <div className="mt-6 bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg flex items-start">
            <AlertTriangle size={20} className="text-amber-500 mr-3 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-amber-500 font-medium text-sm">Suspended on {format(new Date(org.suspended_at), "MMM d, yyyy")}</h4>
              <p className="text-amber-500/80 text-sm mt-1">{org.suspension_reason}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Organization Settings</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 border-b border-slate-800 pb-3">
              <span className="text-slate-500 text-sm">Health Score</span>
              <span className="col-span-2 text-slate-200 font-medium">{org.health_score || 100}/100</span>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-800 pb-3">
              <span className="text-slate-500 text-sm">Max Users</span>
              <span className="col-span-2 text-slate-200 font-medium">{org.max_users || 10}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Modals */}
      <ConfirmActionModal
        isOpen={isSuspendModalOpen}
        onClose={() => setIsSuspendModalOpen(false)}
        onConfirm={() => handleAction('suspend')}
        title="Suspend Organization"
        description="Suspending this organization will immediately lock out all its users. They will not be able to log in until the organization is restored."
        confirmText="Suspend Tenant"
        variant="warning"
        isLoading={actionLoading}
      />
      
      <ConfirmActionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => handleAction('soft_delete')}
        title="Delete Organization"
        description="This will soft-delete the organization. Data will be retained, but the tenant will be completely inaccessible to regular users."
        confirmText="Delete Tenant"
        requireKeyword={org.name}
        variant="danger"
        isLoading={actionLoading}
      />

      <ConfirmActionModal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        onConfirm={() => handleAction('restore')}
        title="Restore Organization"
        description="This will reactivate the organization and allow its members to log in again."
        confirmText="Restore Tenant"
        variant="warning"
        isLoading={actionLoading}
      />
    </div>
  );
}
