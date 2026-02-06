import React, { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, User as UserIcon, Search, Trash2, Filter, X, Check } from 'lucide-react';
import { useBrain, useAgenda } from '../context/BrainContext';
import { LoadingIndicator } from './common/Loading';
import EmptyState from './common/EmptyState';

const Calendar: React.FC = () => {
  const { setQuickAction, loading, remove } = useBrain();
  const { agenda } = useAgenda();
  const [search, setSearch] = useState('');
  
  // ESTADOS DO FILTRO
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('todos'); // 'todos', 'consulta', 'terapia', 'reuniao'

  const sortedEvents = useMemo(() => {
    return (
    // REMOVIDO "overflow-hidden" DAQUI
    <div className="space-y-8 lg:space-y-12 animate-in fade-in duration-700 px-1 lg:px-0 pb-28 lg:pb-20" onClick={() => setIsFilterOpen(false)}>
        // 1. Filtro de Texto (Busca)
        const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || 
                              e.patient_name?.toLowerCase().includes(search.toLowerCase());
        
        // 2. Filtro de Categoria (Botão Filtrar)
        const matchesType = filterType === 'todos' ? true : 
                            e.title.toLowerCase().includes(filterType.toLowerCase()); // Filtra pelo título (ex: "Terapia de Grupo")

        return matchesSearch && matchesType;
      })
      .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
  }, [agenda, search, filterType]);

  const groupedEvents = useMemo(() => {
    const groups: Record<string, any[]> = {};
    sortedEvents.forEach(event => {
      const date = new Date(event.start_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
      if (!groups[date]) groups[date] = [];
      groups[date].push(event);
    });
    return Object.entries(groups);
  }, [sortedEvents]);

  const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    if (confirm(`Deseja cancelar o evento "${title}"?`)) {
      try { await remove('agenda', id); } catch (err) { console.error(err); }
    }
  };

  if (loading) return <LoadingIndicator />;

  return (
    <div className="space-y-8 lg:space-y-12 animate-in fade-in duration-700 px-1 lg:px-0 pb-20 max-w-full overflow-hidden" onClick={() => setIsFilterOpen(false)}>
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-5xl font-black text-slate-950 tracking-tighter text-glow">Agenda</h1>
          <p className="text-sm lg:text-xl text-slate-500 font-medium mt-1">Sincronização operacional e clínica.</p>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); setQuickAction('new_agenda'); }} 
          className="flex items-center justify-center gap-3 bg-amber-600 text-white px-8 py-4 rounded-[24px] text-sm font-black shadow-xl w-full sm:w-auto hover:scale-[1.02] transition-all"
        >
          <Plus size={20} className="stroke-[3.5px]" /> AGENDAR EVENTO
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-4 relative z-20">
        <div className="relative flex-1 group min-w-0">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-600 transition-colors" size={20} />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar evento ou paciente..." 
            className="w-full pl-14 pr-6 py-4 glass-card border-white/50 rounded-[24px] text-sm font-bold focus:outline-none focus:bg-white shadow-sm" 
          />
        </div>

        {/* BOTÃO DE FILTRO FUNCIONAL */}
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsFilterOpen(!isFilterOpen); }}
            className={`h-14 px-6 border rounded-[24px] flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all shrink-0 ${
              filterType !== 'todos' || isFilterOpen ? 'bg-amber-100 text-amber-700 border-amber-200' : 'glass border-white/60 text-slate-500 hover:bg-white/60'
            }`}
          >
            <Filter size={18} /> {filterType === 'todos' ? 'Filtrar' : filterType}
          </button>

          {/* MENU DROPDOWN */}
          {isFilterOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-2 space-y-1">
                {['todos', 'consulta', 'terapia', 'reunião', 'visita'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase flex justify-between items-center ${
                      filterType === type ? 'bg-amber-50 text-amber-700' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {type}
                    {filterType === type && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {groupedEvents.length === 0 ? (
        <EmptyState 
          icon={CalendarIcon}
          title="Agenda vazia"
          description={search || filterType !== 'todos' ? "Nenhum evento encontrado com esses filtros." : "Não há eventos programados."}
          action={!search && filterType === 'todos' ? { label: "Agendar Agora", onClick: () => setQuickAction('new_agenda') } : undefined}
        />
      ) : (
        <div className="space-y-10 lg:space-y-14 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-1 before:bg-slate-200/50 before:rounded-full">
          {groupedEvents.map(([date, events]) => (
            <div key={date} className="relative pl-14">
              <div className="absolute left-[18px] top-1.5 w-4 h-4 rounded-full bg-amber-600 border-4 border-white shadow-lg z-10"></div>
              <h3 className="text-[10px] lg:text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">{date}<div className="h-px bg-slate-200 flex-1"></div></h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                {events.map((event) => (
                  <div key={event.id} className="glass-card bg-white/40 hover:bg-white/70 p-6 lg:p-8 rounded-[32px] border-white/60 shadow-sm flex items-center justify-between gap-6 transition-all group min-w-0">
                    <div className="flex items-center gap-5 lg:gap-8 min-w-0 flex-1">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-700 flex flex-col items-center justify-center border border-amber-500/20 shadow-inner shrink-0">
                        <Clock size={20} className="mb-0.5" />
                        <span className="text-[9px] font-black">{new Date(event.start_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-lg lg:text-xl font-black text-slate-900 truncate tracking-tight">{event.title}</h4>
                        {event.patient_name && (
                          <div className="flex items-center gap-2 mt-2">
                             <div className="w-6 h-6 rounded-full bg-white/80 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0"><UserIcon size={12} /></div>
                             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{event.patient_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button onClick={(e) => handleDelete(e, event.id, event.title)} className="p-4 bg-white border border-slate-100 text-slate-300 hover:text-rose-600 rounded-2xl transition-all shadow-sm active:scale-95"><Trash2 size={20} /></button>
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
