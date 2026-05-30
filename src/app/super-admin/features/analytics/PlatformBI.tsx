import { useState, useEffect } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area
} from "recharts";
import { StatCard } from "../../components/StatCard";
import { Building2, Users, Activity, CreditCard } from "lucide-react";

export function PlatformBI() {
  const [loading, setLoading] = useState(true);

  // Mock data for Platform BI
  const growthData = [
    { name: 'Jan', organizations: 120, users: 400 },
    { name: 'Feb', organizations: 132, users: 450 },
    { name: 'Mar', organizations: 145, users: 510 },
    { name: 'Apr', organizations: 160, users: 620 },
    { name: 'May', organizations: 175, users: 710 },
    { name: 'Jun', organizations: 195, users: 840 },
  ];

  const mrrData = [
    { name: 'Jan', mrr: 12000 },
    { name: 'Feb', mrr: 13500 },
    { name: 'Mar', mrr: 15100 },
    { name: 'Apr', mrr: 16800 },
    { name: 'May', mrr: 18400 },
    { name: 'Jun', mrr: 21500 },
  ];

  useEffect(() => {
    // Simulate fetching BI data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-800 rounded-xl"></div>)}
      </div>
      <div className="h-96 bg-slate-800 rounded-xl w-full"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Platform Analytics</h2>
          <p className="text-slate-400 text-sm mt-1">High-level Business Intelligence and growth metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Organizations" 
          value="195" 
          icon={<Building2 size={24} />} 
          trend={{ value: 12.5, isPositive: true }} 
          subtitle="vs last month"
        />
        <StatCard 
          title="Active Users (MAU)" 
          value="840" 
          icon={<Users size={24} />} 
          trend={{ value: 18.2, isPositive: true }} 
          subtitle="vs last month"
        />
        <StatCard 
          title="Estimated MRR" 
          value="$21,500" 
          icon={<CreditCard size={24} />} 
          trend={{ value: 16.8, isPositive: true }} 
          subtitle="vs last month"
        />
        <StatCard 
          title="Platform Churn" 
          value="1.2%" 
          icon={<Activity size={24} />} 
          trend={{ value: -0.4, isPositive: true }} 
          subtitle="vs last month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6">Growth Trajectory</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '0.5rem' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6">MRR Growth</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mrrData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '0.5rem' }}
                  cursor={{fill: '#1e293b', opacity: 0.4}}
                  formatter={(value: number) => [`$${value}`, 'MRR']}
                />
                <Bar dataKey="mrr" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
