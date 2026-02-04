import React, { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, User as UserIcon, Search, ChevronRight, Filter } from 'lucide-react';
import { useBrain, useAgenda } from '../context/BrainContext';
import { LoadingIndicator } from './common/Loading';
import EmptyState from './common/EmptyState';

const Calendar: React.FC = () => {
  const { setQuickAction, loading } = useBrain();
  const { agenda } = useAgenda();
  const [search, setSearch] = useState('');

  const sortedEvents = useMemo(() => {
    return [...agenda]
      .filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || e.patient_name?.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
  }, [agenda, search]);

  // Group by day
  const groupedEvents = useMemo(() => {
    const groups: Record<string, any[]> = {};
    sortedEvents.forEach(event => {
      const date = new Date(event.start_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
      if (!groups[date]) groups[date] = [];
      groups[date].push(event);
    });
    return Object.entries(groups);
  }, [sortedEvents]);

  if (loading) return <LoadingIndicator />;

  return (
    <div className="space-y-8 lg:space-y-12 animate-in fade-in duration-700 px-1 lg:px-0 pb-20 max-w-full overflow-hidden">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-5xl font-black text-slate-950 tracking-tighter text-glow">Agenda</h1>
          <p className="text-sm lg:text-xl text-slate-500 font-medium mt-1">Sincronização operacional e clínica.</p>
        </div>
        <button 
          onClick={() => setQuickAction('new_agenda')} 
          className="flex items-center justify-center gap-3 bg-amber-600 text-white px-8 py-4 rounded-[24px] text-sm font-black shadow-xl shadow-amber-900/10 w-full sm:w-auto transition-all hover:scale-[1.02]"
        >
          <Plus size={20} className="stroke-[3.5px]" />
          AGENDAR EVENTO
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group min-w-0">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-600 transition-colors" size={20} />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar evento ou paciente..." 
            className="w-full pl-14 pr-6 py-4 glass-card border-white/50 rounded-[24px] lg:rounded-[32px] text-sm font-bold focus:outline-none focus:bg-white shadow-sm" 
          />
        </div>
        <button className="h-14 px-6 glass border-white/60 rounded-[24px] flex items-center justify-center gap-3 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-white/60 transition-all shrink-0">
          <Filter size={18} /> Filtrar
        </button>
      </div>

      {groupedEvents.length === 0 ? (
        <EmptyState 
          icon={CalendarIcon}
          title="Agenda vazia"
          description={search ? "Nenhum compromisso encontrado para sua busca." : "Não há eventos programados para os próximos dias."}
          action={!search ? { label: "Agendar Agora", onClick: () => setQuickAction('new_agenda') } : undefined}
        />
      ) : (
        <div className="space-y-10 lg:space-y-14 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-1 before:bg-slate-200/50 before:rounded-full">
          {groupedEvents.map(([date, events]) => (
            <div key={date} className="relative pl-14">
              {/* Dot Indicativo de Dia */}
              <div className="absolute left-[18px] top-1.5 w-4 h-4 rounded-full bg-amber-600 border-4 border-white shadow-lg z-10"></div>
              
              <h3 className="text-[10px] lg:text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                {date}
                <div className="h-px bg-slate-200 flex-1"></div>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                {events.map((event) => (
                  <div key={event.id} className="glass-card bg-white/40 hover:bg-white/70 p-6 lg:p-8 rounded-[32px] lg:rounded-[40px] border-white/60 shadow-sm flex items-center justify-between gap-6 transition-all group cursor-pointer active:scale-[0.99] min-w-0">
                    <div className="flex items-center gap-5 lg:gap-8 min-w-0 flex-1">
                      <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-amber-500/10 text-amber-700 flex flex-col items-center justify-center border border-amber-500/20 shadow-inner shrink-0 group-hover:bg-amber-500/20 transition-colors">
                        <Clock size={20} className="mb-0.5" />
                        <span className="text-[9px] font-black">{new Date(event.start_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-lg lg:text-xl font-black text-slate-900 leading-tight truncate tracking-tight group-hover:text-amber-800 transition-colors">{event.title}</h4>
                        {event.patient_name && (
                          <div className="flex items-center gap-2 mt-2">
                             <div className="w-6 h-6 rounded-full bg-white/80 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                               <UserIcon size={12} />
                             </div>
                             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{event.patient_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={24} className="text-slate-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Calendar;