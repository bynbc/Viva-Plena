import React, { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, User, Plus, Trash2, Pencil, Save, X } from 'lucide-react';
import { useBrain } from '../context/BrainContext';

const Calendar: React.FC = () => {
  const { brain, setQuickAction, remove, update, addToast } = useBrain();
  const { agenda, loading } = brain;

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDateTime, setEditDateTime] = useState('');

  const dailyEvents = useMemo(() => agenda.filter((event) => {
    const eventDate = new Date(event.start_at);
    const localDate = new Date(eventDate.getTime() - eventDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    return localDate === selectedDate;
  }).sort((a, b) => a.start_at.localeCompare(b.start_at)), [agenda, selectedDate]);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que quer cancelar esse compromisso?')) return;
    try {
      await remove('agenda', id);
      addToast('Compromisso excluído.', 'success');
    } catch (err: any) {
      addToast(`Erro ao excluir compromisso: ${err.message || 'Falha desconhecida'}`, 'error');
    }
  };

  const startEdit = (evt: any) => {
    setEditingId(evt.id);
    setEditTitle(evt.title || '');
    const dt = new Date(evt.start_at);
    const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setEditDateTime(local);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    if (!editTitle.trim() || !editDateTime) return addToast('Título e data/hora são obrigatórios.', 'warning');

    try {
      await update('agenda', editingId, {
        title: editTitle,
        start_at: new Date(editDateTime).toISOString(),
      });
      addToast('Compromisso atualizado.', 'success');
      setEditingId(null);
    } catch (err: any) {
      addToast(`Erro ao atualizar compromisso: ${err.message || 'Falha desconhecida'}`, 'error');
    }
  };

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

      <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block pl-1">Data Selecionada</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full text-lg font-black text-slate-800 bg-slate-50 p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-amber-200"
        />
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-slate-400 py-10">Carregando agenda...</p>
        ) : dailyEvents.length === 0 ? (
          <div className="text-center py-12 opacity-50">
            <CalendarIcon size={48} className="mx-auto mb-3 text-slate-300" />
            <p className="font-medium text-slate-400">Nenhum compromisso para este dia.</p>
          </div>
        ) : (
          dailyEvents.map((evt) => (
            <div key={evt.id} className="bg-white p-5 rounded-[24px] border border-slate-100 flex items-center gap-4 hover:border-amber-200 transition-all group">
              <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl shrink-0 font-black text-xs flex flex-col items-center justify-center w-16 h-16">
                <span>{evt.start_at.split('T')[1].substring(0, 5)}</span>
              </div>

              <div className="flex-1 min-w-0">
                {editingId === evt.id ? (
                  <div className="space-y-2">
                    <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-bold" />
                    <input type="datetime-local" value={editDateTime} onChange={(e) => setEditDateTime(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-slate-700 font-bold" />
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold text-slate-800 truncate">{evt.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <User size={12} /> {evt.patient_name || 'Geral'}
                      {evt.visitor_name && <span className="text-amber-600 font-bold">• Visita: {evt.visitor_name}</span>}
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                {editingId === evt.id ? (
                  <>
                    <button onClick={() => setEditingId(null)} className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"><X size={18} /></button>
                    <button onClick={handleSaveEdit} className="p-3 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-all"><Save size={18} /></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(evt)} className="p-3 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all" title="Editar Agendamento">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => handleDelete(evt.id)} className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all" title="Excluir Agendamento">
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Calendar;
