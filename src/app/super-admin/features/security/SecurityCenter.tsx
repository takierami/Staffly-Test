import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase/supabaseClient";
import { DataTable } from "../../components/DataTable";
import { ShieldAlert, Shield, AlertTriangle, Fingerprint } from "lucide-react";
import { format } from "date-fns";

export function SecurityCenter() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("security_events")
      .select(`
        *,
        auth_users:actor_id(email)
      `)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setEvents(data);
    }
    setLoading(false);
  };

  const columns = [
    {
      header: "Severity",
      accessorKey: "severity",
      cell: (event: any) => {
        const severityConfig: Record<string, { color: string, icon: any }> = {
          critical: { color: "text-rose-400 bg-rose-500/10 border-rose-500/20", icon: AlertTriangle },
          high: { color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: ShieldAlert },
          medium: { color: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: Shield },
          low: { color: "text-slate-400 bg-slate-500/10 border-slate-500/20", icon: Fingerprint }
        };
        const conf = severityConfig[event.severity] || severityConfig.low;
        const Icon = conf.icon;
        
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border uppercase tracking-wider ${conf.color}`}>
            <Icon size={12} className="mr-1" />
            {event.severity}
          </span>
        );
      },
    },
    {
      header: "Event",
      accessorKey: "event_type",
      cell: (event: any) => (
        <span className="font-mono text-sm text-slate-300">{event.event_type}</span>
      )
    },
    {
      header: "Actor",
      cell: (event: any) => (
        <span className="text-slate-400">{event.auth_users?.email || event.actor_id || 'System'}</span>
      )
    },
    {
      header: "Timestamp",
      accessorKey: "created_at",
      cell: (event: any) => (
        <span className="text-slate-400">
          {format(new Date(event.created_at), "MMM d, HH:mm:ss")}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Security Center</h2>
          <p className="text-slate-400 text-sm mt-1">Audit log of privileged operations and security events.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-5 flex items-center">
          <div className="p-3 bg-rose-500/20 rounded-lg text-rose-500 mr-4">
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="text-rose-400 text-sm font-medium">Critical Events (24h)</div>
            <div className="text-2xl font-bold text-rose-500">
              {events.filter(e => e.severity === 'critical').length}
            </div>
          </div>
        </div>
        
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 flex items-center">
          <div className="p-3 bg-amber-500/20 rounded-lg text-amber-500 mr-4">
            <ShieldAlert size={24} />
          </div>
          <div>
            <div className="text-amber-400 text-sm font-medium">High Severity (24h)</div>
            <div className="text-2xl font-bold text-amber-500">
              {events.filter(e => e.severity === 'high').length}
            </div>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 flex items-center">
          <div className="p-3 bg-blue-500/20 rounded-lg text-blue-500 mr-4">
            <Fingerprint size={24} />
          </div>
          <div>
            <div className="text-blue-400 text-sm font-medium">Active Impersonations</div>
            <div className="text-2xl font-bold text-blue-500">
              0
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse h-96 bg-slate-800 rounded-xl w-full"></div>
      ) : (
        <DataTable 
          columns={columns}
          data={events}
          searchPlaceholder="Search events..."
        />
      )}
    </div>
  );
}
