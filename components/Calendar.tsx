import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, ChevronRight, Plus, CheckCircle2 } from 'lucide-react';
import { useBrain } from '../context/BrainContext'; // Import corrigido
import MobileModal from './common/MobileModal';
import NewAgendaModal from './NewAgendaModal';

const Calendar: React.FC = () => {
  const { brain, setQuickAction } = useBrain(); // Acessando contexto global
  const { agenda, loading } = brain; // Destructuring do estado do brain
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Filtra eventos do dia selecionado
  const dailyEvents = agenda.filter(event => 
    event.start_at.startsWith(selectedDate)
  ).sort((a, b) => a.start_at.localeCompare(b.start_at));

  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Agenda</h1>
          <p className="text-lg text-slate-500 font-medium">Compromissos e visitas.</p>
        </div>
        <button 
           onClick={() => setQuickAction('new_agenda')}
           className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-amber-200 transition-all"
        >
          <Plus size={20} />
          Novo Agendamento
        </button>
      </header>

      {/* SELETOR DE DATA SIMPLES */}
      <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block pl-1">Data Selecionada</label>
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full text-lg font-black text-slate-800 bg-slate-50 p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-amber-200"
        />
      </div>

      {/* LISTA DE EVENTOS */}
      <div className="space-y-3">
        {loading ? (
           <p className="text-center text-slate-400 py-10">Carregando agenda...</p>
        ) : dailyEvents.length === 0 ? (
           <div className="text-center py-12 opacity-50">
              <CalendarIcon size={48} className="mx-auto mb-3 text-slate-300" />
              <p className="font-medium text-slate-400">Nenhum compromisso para este dia.</p>
           </div>
        ) : (
           dailyEvents.map(evt => (
             <div key={evt.id} className="bg-white p-5 rounded-[24px] border border-slate-100 flex items-center gap-4 hover:border-amber-200 transition-all group">
                <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl shrink-0 font-black text-xs flex flex-col items-center justify-center w-16 h-16">
                   <span>{evt.start_at.split('T')[1].substring(0, 5)}</span>
                </div>
                <div className="flex-1 min-w-0">
                   <h3 className="font-bold text-slate-800 truncate">{evt.title}</h3>
                   <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <User size={12} /> {evt.patient_name || 'Geral'}
                      {evt.visitor_name && <span className="text-amber-600 font-bold">• Visita: {evt.visitor_name}</span>}
                   </div>
                </div>
                <div className="text-slate-300 group-hover:text-amber-500 transition-colors">
                   <ChevronRight />
                </div>
             </div>
           ))
        )}
      </div>
      
      {/* O Modal é controlado globalmente pelo QuickAction no App.tsx ou aqui se fosse local */}
    </div>
  );
};

export default Calendar;
