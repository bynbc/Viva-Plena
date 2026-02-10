import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400">
      <Loader2 className="animate-spin mb-4 text-indigo-600" size={48} />
      <p className="font-bold text-sm tracking-widest uppercase">Carregando Sistema...</p>
    </div>
  );
};

export default Loading;
