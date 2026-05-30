import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/supabaseClient";

export function SASubscriptions() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubs() {
      const { data } = await supabase
        .from('subscriptions')
        .select(`
          *,
          organizations (name)
        `)
        .order('created_at', { ascending: false });
      
      if (data) setSubscriptions(data);
      setLoading(false);
    }
    loadSubs();
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-6">Subscriptions</h2>
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-6 text-slate-400">Loading subscriptions...</div>
        ) : (
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Organization</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Start Date</th>
                <th className="px-6 py-4">End Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {subscriptions.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{sub.organizations?.name || "Unknown"}</td>
                  <td className="px-6 py-4 capitalize">{sub.plan_name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{new Date(sub.start_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{sub.end_date ? new Date(sub.end_date).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
              {subscriptions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-slate-400">No subscriptions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
