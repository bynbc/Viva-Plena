
import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useBrain } from '../../context/BrainContext';
import { ToastType } from '../../types';

const Toast: React.FC = () => {
  const { brain, removeToast } = useBrain();
  const toasts = brain.ui.toasts;

  if (toasts.length === 0) return null;

  const icons: Record<ToastType, any> = {
    success: <CheckCircle className="text-emerald-500" size={20} />,
    error: <XCircle className="text-rose-500" size={20} />,
    warning: <AlertCircle className="text-amber-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />
  };

  const bgColors: Record<ToastType, string> = {
    success: 'bg-emerald-50 border-emerald-100',
    error: 'bg-rose-50 border-rose-100',
    warning: 'bg-amber-50 border-amber-100',
    info: 'bg-blue-50 border-blue-100'
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-3 w-[90%] max-w-md pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl border shadow-xl backdrop-blur-xl animate-spring ${bgColors[toast.type]}`}
        >
          <div className="flex items-center gap-3">
            {icons[toast.type]}
            <p className="text-sm font-bold text-slate-800">{toast.message}</p>
          </div>
          <button 
            onClick={() => removeToast(toast.id)}
            className="p-1 hover:bg-black/5 rounded-full transition-colors"
          >
            <X size={16} className="text-slate-400" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
