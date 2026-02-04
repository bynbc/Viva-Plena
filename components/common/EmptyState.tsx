
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in duration-700">
      <div className="w-20 h-20 bg-slate-100 rounded-[32px] flex items-center justify-center text-slate-300 mb-6">
        <Icon size={40} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
      <p className="text-slate-500 font-medium mt-2 max-w-xs text-sm leading-relaxed">
        {description}
      </p>
      {action && (
        <button 
          onClick={action.onClick}
          className="mt-8 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
