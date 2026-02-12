import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon; // <--- O PULO DO GATO: Agora o ícone não é mais obrigatório
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon: Icon }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 animate-in fade-in zoom-in-95 duration-300">
      {Icon && (
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-slate-300">
          <Icon size={32} />
        </div>
      )}
      <h3 className="text-lg font-black text-slate-400">{title}</h3>
      <p className="text-sm font-bold text-slate-300 max-w-xs mx-auto mt-1 leading-relaxed">{description}</p>
    </div>
  );
};

export default EmptyState;
