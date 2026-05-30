import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/supabaseClient";

export function SAActivityLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      const { data } = await supabase
        .from('activity_logs')
        .select(`
          *,
          organizations (name),
          profiles (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (data) setLogs(data);
      setLoading(false);
    }
    loadLogs();
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-6">Platform Activity Log</h2>
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-6 text-slate-400">Loading activity logs...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900 text-slate-400 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Module</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Organization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4 font-medium text-white">{log.action}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-700 rounded text-xs">{log.module}</span></td>
                    <td className="px-6 py-4">{log.profiles?.full_name || "System"}</td>
                    <td className="px-6 py-4 text-blue-400">{log.organizations?.name || "Platform"}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-slate-400">No activity logs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
