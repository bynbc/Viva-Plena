
import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingOverlay: React.FC = () => (
  <div className="fixed inset-0 z-[250] bg-white/60 backdrop-blur-md flex items-center justify-center animate-in fade-in">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
      <p className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Sincronizando...</p>
    </div>
  </div>
);

export const LoadingIndicator: React.FC = () => (
  <div className="flex items-center justify-center p-12">
    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin opacity-40" />
  </div>
);
