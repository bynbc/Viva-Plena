
import React, { useMemo, useState } from 'react';
import { AlertCircle, ArrowRight, User, Plus, ShieldAlert, Clock, Filter, Search, Shield } from 'lucide-react';
import { useOccurrences, useBrain } from '../context/BrainContext';
import EmptyState from './common/EmptyState';
import { LoadingIndicator } from './common/Loading';

const Occurrences: React.FC = () => {
  const { setQuickAction, loading } = useBrain();
  const { occurrences } = useOccurrences();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return [...occurrences]
      .filter(o => o.patient_name?.toLowerCase().includes(search.toLowerCase()) || o.title.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [occurrences, search]);

  if (loading) return <LoadingIndicator />;

  return (
    <div className="space-y-6 lg:space-y-12 animate-in fade-in duration-700 relative pb-20">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-5xl font-black text-slate-950 tracking-tighter">Ocorrências</h1>
          <p className="text-sm lg:text-xl text-slate-500 font-medium mt-1">Segurança e protocolos operacionais.</p>
        </div>
        <button 
          onClick={() => setQuickAction('new_occurrence')} 
          className="flex items-center justify-center gap-3 bg-rose-600 text-white px-8 py-4 rounded-2xl text-sm font-black transition-all shadow-xl shadow-rose-100"
        >
          <Plus size={20} className="stroke-[3.5px]" /> Nova Ocorrência
        </button>
      </header>

      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={20} />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar paciente ou tipo..." 
          className="w-full pl-14 pr-6 py-4 glass-card border-white/50 rounded-2xl text-sm focus:outline-none focus:bg-white font-bold" 
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState 
          icon={Shield}
          title="Sem incidentes"
          description={search ? "Nenhuma ocorrência encontrada para esta busca." : "A unidade está operando dentro da normalidade."}
          action={!search ? { label: "Abrir Ocorrência", onClick: () => setQuickAction('new_occurrence') } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:gap-5">
          {filtered.map((occ) => (
            <div key={occ.id} className="group glass-card p-6 lg:p-8 rounded-[32px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-white/40 shadow-sm">
              <div className="flex items-center gap-5 lg:gap-8 flex-1">
                <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl lg:rounded-[24px] flex items-center justify-center border shadow-lg shrink-0 ${
                  occ.severity === 'critical' ? 'bg-rose-600 text-white border-rose-500' :
                  occ.severity === 'high' ? 'bg-orange-500 text-white' :
                  'bg-amber-100 text-amber-700 border-amber-200'
                }`}>
                  {occ.severity === 'critical' ? <ShieldAlert size={28} className="animate-pulse" /> : <AlertCircle size={28} />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-black uppercase rounded-lg border border-slate-200">{occ.type}</span>
                    <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-lg border ${
                      occ.severity === 'critical' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-400'
                    }`}>{occ.severity}</span>
                  </div>
                  <h3 className="text-lg lg:text-2xl font-black text-slate-900 leading-tight truncate">{occ.title}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <User size={12} /> {occ.patient_name}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Clock size={12} /> {new Date(occ.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              </div>
              <button className="w-full sm:w-auto px-6 py-3 bg-white border border-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                Inspecionar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Occurrences;
