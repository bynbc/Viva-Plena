import React, { useState } from 'react';
import { AlertTriangle, Plus, Search, Calendar, User, CheckCircle2 } from 'lucide-react';
import { useBrain } from '../context/BrainContext'; // Correção
import MobileModal from './common/MobileModal';
import NewOccurrenceModal from './NewOccurrenceModal';

const Occurrences: React.FC = () => {
  const { brain, setQuickAction } = useBrain(); // Correção
  const { occurrences, loading } = brain; // Correção
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredOccurrences = occurrences.filter(occ => 
    occ.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    occ.patient_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ocorrências</h1>
          <p className="text-lg text-slate-500 font-medium">Gestão de eventos adversos e disciplinares.</p>
        </div>
        <button 
          onClick={() => setQuickAction('new_occurrence')}
          className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-rose-200 transition-all"
        >
          <Plus size={20} />
          Nova Ocorrência
        </button>
      </header>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar ocorrência..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl font-medium focus:border-indigo-500 outline-none"
        />
      </div>

      {/* LISTA */}
      <div className="space-y-4">
        {loading ? (
           <p className="text-center text-slate-400">Carregando...</p>
        ) : filteredOccurrences.map(occ => (
          <div key={occ.id} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden">
             <div className={`absolute left-0 top-0 bottom-0 w-2 
                ${occ.severity === 'CRITICAL' || occ.severity === 'Crítica' ? 'bg-rose-500' : 'bg-amber-400'}
             `} />
             
             <div className="pl-4">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="font-bold text-slate-800 text-lg">{occ.title}</h3>
                   <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest
                      ${occ.status === 'resolved' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}
                   `}>
                      {occ.status === 'resolved' ? 'Resolvido' : 'Em Aberto'}
                   </span>
                </div>
                
                <p className="text-slate-600 mb-4">{occ.description}</p>
                
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                   <div className="flex items-center gap-1"><User size={14}/> {occ.patient_name}</div>
                   <div className="flex items-center gap-1"><Calendar size={14}/> {new Date(occ.created_at).toLocaleDateString()}</div>
                </div>
             </div>
          </div>
        ))}
      </div>

      {isModalOpen && <NewOccurrenceModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default Occurrences;
