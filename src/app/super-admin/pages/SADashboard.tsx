import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/supabaseClient";

export function SADashboard() {
  const [stats, setStats] = useState({
    orgs: 0,
    users: 0,
    subs: 0
  });

  useEffect(() => {
    async function loadStats() {
      const [
        { count: orgCount },
        { count: userCount },
        { count: subCount }
      ] = await Promise.all([
        supabase.from('organizations').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active')
      ]);

      setStats({
        orgs: orgCount || 0,
        users: userCount || 0,
        subs: subCount || 0
      });
    }
    loadStats();
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-6">Platform Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-slate-400 font-medium mb-2">Total Organizations</h3>
          <p className="text-4xl font-bold">{stats.orgs}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-slate-400 font-medium mb-2">Total Users</h3>
          <p className="text-4xl font-bold">{stats.users}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-slate-400 font-medium mb-2">Active Subscriptions</h3>
          <p className="text-4xl font-bold">{stats.subs}</p>
        </div>
      </div>
    </div>
  );
}
