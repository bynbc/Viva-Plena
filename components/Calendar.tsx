import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, ChevronRight, Plus, Trash2 } from 'lucide-react'; // Adicionei Trash2
import { useBrain } from '../context/BrainContext';
import MobileModal from './common/MobileModal';
import NewAgendaModal from './NewAgendaModal';

const Calendar: React.FC = () => {
  const { brain, setQuickAction, remove } = useBrain(); // Puxando a função remove
  const { agenda, loading } = brain;

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Filtra eventos do dia selecionado
  const dailyEvents = agenda.filter(event =>
    event.start_at.startsWith(selectedDate)
  ).sort((a, b) => a.start_at.localeCompare(b.start_at));

  // Função para deletar
  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que quer cancelar esse compromisso?')) {
      await remove('agenda', id); // Chama o remove do contexto
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Agenda</h1>
          <p className="text-lg text-indigo-200 font-medium">Compromissos e visitas.</p> { /* Changed to match Dashboard */}
        </div>
        <button
          onClick={() => setQuickAction('new_agenda')}
          className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all backdrop-blur-sm"
        >
          <Plus size={20} />
          Novo Agendamento
        </button>
      </header>

      {/* SELETOR DE DATA SIMPLES */}
      <div className="glass p-4 rounded-[24px] border border-white/10 shadow-sm bg-white/5">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block pl-1">Data Selecionada</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full text-lg font-black text-white bg-white/5 p-3 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
        />
      </div>

      {/* LISTA DE EVENTOS */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-slate-400 py-10">Carregando agenda...</p>
        ) : dailyEvents.length === 0 ? (
          <div className="text-center py-12 opacity-50">
            <CalendarIcon size={48} className="mx-auto mb-3 text-slate-500" />
            <p className="font-medium text-slate-400">Nenhum compromisso para este dia.</p>
          </div>
        ) : (
          dailyEvents.map(evt => (
            <div key={evt.id} className="glass p-5 rounded-[24px] border border-white/10 flex items-center gap-4 hover:border-amber-500/50 transition-all group bg-white/5">
              <div className="bg-amber-500/10 text-amber-500 p-3 rounded-2xl shrink-0 font-black text-xs flex flex-col items-center justify-center w-16 h-16 border border-amber-500/20">
                <span>{new Date(evt.start_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white truncate text-lg">{evt.title}</h3>
                <div className="flex items-center gap-2 text-xs text-indigo-200 mt-1">
                  <User size={12} /> {evt.patient_name || 'Geral'}
                  {evt.visitor_name && <span className="text-amber-400 font-bold">• Visita: {evt.visitor_name}</span>}
                </div>
              </div>

              {/* AQUI ESTAVA FALTANDO A AÇÃO DELETAR */}
              <button
                onClick={() => handleDelete(evt.id)}
                className="p-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                title="Excluir Agendamento"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* O Modal é controlado globalmente */}
    </div>
  );
};

export default Calendar;
