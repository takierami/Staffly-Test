import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase/supabaseClient";
import { X, ShieldAlert, Key, UserX, Activity } from "lucide-react";
import { ConfirmActionModal } from "../../components/ConfirmActionModal";
import { format } from "date-fns";

interface UserDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export function UserDetailDrawer({ isOpen, onClose, userId }: UserDetailDrawerProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [impersonateLoading, setImpersonateLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Modals
  const [isImpersonateModalOpen, setIsImpersonateModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails();
    }
  }, [isOpen, userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        organizations(name)
      `)
      .eq("id", userId)
      .single();

    if (!error && data) {
      setUser(data);
    }
    setLoading(false);
  };

  const handleImpersonate = async () => {
    setImpersonateLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('sa-impersonate', {
        body: { target_user_id: user.id, target_email: 'mock@example.com', reason: 'Support request' } // Note: real email needed from auth.users ideally
      });
      if (error) throw error;
      
      if (data.link) {
        // In a real scenario, you'd open this link in a new incognito window or current tab
        alert(`Impersonation link generated: ${data.link}`);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate impersonation link");
    } finally {
      setImpersonateLoading(false);
      setIsImpersonateModalOpen(false);
    }
  };

  const handleForceReset = async () => {
    setResetLoading(true);
    try {
      const newPassword = Math.random().toString(36).slice(-8) + "Aa1!";
      const { error } = await supabase.functions.invoke('sa-force-reset', {
        body: { target_user_id: user.id, new_password: newPassword }
      });
      if (error) throw error;
      
      alert(`Password has been reset successfully. Sessions invalidated.`);
    } catch (error) {
      console.error(error);
      alert("Failed to force password reset");
    } finally {
      setResetLoading(false);
      setIsResetModalOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out translate-x-0 flex flex-col`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-semibold text-white">User Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-20 bg-slate-800 rounded-lg w-full"></div>
              <div className="h-40 bg-slate-800 rounded-lg w-full"></div>
            </div>
          ) : user ? (
            <div className="space-y-8">
              {/* Profile Header */}
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <span className="text-2xl font-bold text-blue-400">
                    {user.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{user.full_name || 'Unnamed User'}</h3>
                  <p className="text-sm text-slate-400">{user.id}</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Role</span>
                  <span className="text-slate-300 text-sm font-medium">{user.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Organization</span>
                  <span className="text-slate-300 text-sm font-medium">{user.organizations?.name || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Created</span>
                  <span className="text-slate-300 text-sm font-medium">
                    {format(new Date(user.created_at), "MMM d, yyyy h:mm a")}
                  </span>
                </div>
              </div>

              {/* Privileged Actions */}
              <div>
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                  <ShieldAlert size={14} className="mr-2 text-amber-500" />
                  Privileged Actions
                </h4>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => setIsImpersonateModalOpen(true)}
                    className="w-full flex items-center justify-between p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg mr-3 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <Activity size={18} />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-slate-200">Impersonate User</div>
                        <div className="text-xs text-slate-500">Log in as this user for support</div>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={() => setIsResetModalOpen(true)}
                    className="w-full flex items-center justify-between p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg mr-3 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                        <Key size={18} />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-slate-200">Force Password Reset</div>
                        <div className="text-xs text-slate-500">Invalidate active sessions</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-center mt-10">User not found</div>
          )}
        </div>
      </div>

      <ConfirmActionModal 
        isOpen={isImpersonateModalOpen}
        onClose={() => setIsImpersonateModalOpen(false)}
        onConfirm={handleImpersonate}
        title="Impersonate User"
        description="You are about to generate a secure magic link to log in as this user. This action is heavily audited."
        confirmText="Generate Link"
        variant="warning"
        isLoading={impersonateLoading}
      />

      <ConfirmActionModal 
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleForceReset}
        title="Force Password Reset"
        description="This will immediately invalidate all active sessions for this user and randomly reset their password."
        confirmText="Force Reset"
        variant="danger"
        isLoading={resetLoading}
      />
    </>
  );
}
