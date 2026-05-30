import { useEffect, useState } from "react";
import { Link } from "react-router";
import { supabase } from "../../lib/supabase/supabaseClient";

export function SAOrganizations() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrgs() {
      const { data } = await supabase.from('organizations').select('*').order('created_at', { ascending: false });
      if (data) setOrganizations(data);
      setLoading(false);
    }
    loadOrgs();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Organizations</h2>
        <Link 
          to="/super-admin/organizations/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Create Organization
        </Link>
      </div>
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-6 text-slate-400">Loading organizations...</div>
        ) : (
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {organizations.map(org => (
                <tr key={org.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{org.name}</td>
                  <td className="px-6 py-4">{org.slug}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${org.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {org.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{new Date(org.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {organizations.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-slate-400">No organizations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
