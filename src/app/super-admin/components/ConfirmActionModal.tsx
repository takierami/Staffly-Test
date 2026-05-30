import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  requireKeyword?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning';
}

export function ConfirmActionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  requireKeyword,
  isLoading = false,
  variant = 'danger'
}: ConfirmActionModalProps) {
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    if (isOpen) {
      setKeyword("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isKeywordMatched = requireKeyword ? keyword === requireKeyword : true;
  const isButtonDisabled = !isKeywordMatched || isLoading;

  const headerColors = {
    danger: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    warning: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  };
  
  const buttonColors = {
    danger: "bg-rose-500 hover:bg-rose-600 focus:ring-rose-500",
    warning: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-500",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        {/* Header decoration */}
        <div className={`h-1.5 w-full ${variant === 'danger' ? 'bg-rose-500' : 'bg-amber-500'}`} />
        
        <div className="p-6">
          <div className="flex items-start">
            <div className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full border ${headerColors[variant]} mr-4`}>
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1 mt-1">
              <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-400 mb-6">{description}</p>
              
              {requireKeyword && (
                <div className="mb-6 bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    To verify, type <span className="font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded select-all">{requireKeyword}</span> below:
                  </label>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={requireKeyword}
                  />
                </div>
              )}
            </div>
            
            <button 
              onClick={onClose}
              className="ml-4 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex justify-end space-x-3 mt-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isButtonDisabled}
              className={`px-4 py-2 text-white rounded-lg transition-colors font-medium text-sm flex items-center justify-center min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${buttonColors[variant]}`}
            >
              {isLoading ? (
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" />
              ) : null}
              {isLoading ? "Processing..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
