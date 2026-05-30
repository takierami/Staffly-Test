type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  className?: string;
}

export function StatusBadge({ status, variant, className = "" }: StatusBadgeProps) {
  // Auto-detect variant based on common status strings if not explicitly provided
  let activeVariant = variant;
  if (!activeVariant) {
    const lowerStatus = status.toLowerCase();
    if (['active', 'completed', 'success', 'paid', 'healthy'].includes(lowerStatus)) {
      activeVariant = 'success';
    } else if (['pending', 'processing', 'warning', 'at-risk', 'suspended'].includes(lowerStatus)) {
      activeVariant = 'warning';
    } else if (['failed', 'error', 'danger', 'deleted', 'disabled', 'cancelled'].includes(lowerStatus)) {
      activeVariant = 'danger';
    } else if (['info', 'new', 'trial'].includes(lowerStatus)) {
      activeVariant = 'info';
    } else {
      activeVariant = 'default';
    }
  }

  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide";
  
  const variantClasses = {
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    info: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    default: "bg-slate-800 text-slate-300 border border-slate-700",
  };

  return (
    <span className={`${baseClasses} ${variantClasses[activeVariant]} ${className}`}>
      {/* Optional dot indicator */}
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        activeVariant === 'success' ? 'bg-emerald-400' :
        activeVariant === 'warning' ? 'bg-amber-400' :
        activeVariant === 'danger' ? 'bg-rose-400' :
        activeVariant === 'info' ? 'bg-blue-400' : 'bg-slate-400'
      }`} />
      {status}
    </span>
  );
}
