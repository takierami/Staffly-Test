import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number; // Percentage change
    isPositive: boolean;
  };
  subtitle?: string;
}

export function StatCard({ title, value, icon, trend, subtitle }: StatCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col relative overflow-hidden group">
      {/* Subtle hover gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none" />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="text-slate-400 font-medium text-sm">{title}</h3>
        {icon && (
          <div className="p-2 bg-slate-800/50 rounded-lg text-blue-400">
            {icon}
          </div>
        )}
      </div>
      
      <div className="relative z-10">
        <div className="text-3xl font-bold text-slate-100 tracking-tight">{value}</div>
        
        {(trend || subtitle) && (
          <div className="mt-2 flex items-center text-sm">
            {trend && (
              <span className={`flex items-center font-medium ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {trend.isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                {Math.abs(trend.value)}%
              </span>
            )}
            {subtitle && (
              <span className={`text-slate-500 ${trend ? 'ml-2' : ''}`}>
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
