import React, { useState, useMemo } from 'react';
import { Calendar, Search, Loader2, Clock, AlignLeft } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import { useAuth } from '../context/AuthContext';
import MobileModal from './common/MobileModal';

const NewAgendaModal: React.FC = () => {
  const { brain, setQuickAction, push, navigate, addToast } = useBrain();
  const { hasPermission } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(brain.ui.selectedPatientId);
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');
  const [isPatientListOpen, setIsPatientListOpen] = useState(false);

  const canCreate = hasPermission('agenda');
  const activePatients = brain.patients.filter(p => p.status === 'active');
  const filteredPatients = useMemo(() => {
    if (!search) return activePatients;
    return activePatients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, activePatients]);

  const selectedPatient = useMemo(() => brain.patients.find(p => p.id === selectedPatientId), [selectedPatientId, brain.patients]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate || title.length < 3 || !startAt) return;

    if (endAt && new Date(endAt) < new Date(startAt)) {
      addToast("O término não pode ser antes do início.", "warning");
      return;
    }

    setLoading(true);
    try {
      await push('agenda', {
        title: title.trim(),
        start_at: startAt,
        end_at: endAt || null,
        patient_id: selectedPatientId || null,
        description: description.trim() || null
      });

      setQuickAction(null);
      navigate('calendar');
    } catch (err) {
      // Handled by push wrapper
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex flex-col sm:flex-row gap-3">
      <button type="button" disabled={loading} onClick={() => setQuickAction(null)} className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500">Cancelar</button>
      <button form="new-agenda-form" type="submit" disabled={loading || title.length < 3 || !startAt} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 ${loading || title.length < 3 || !startAt ? 'bg-slate-200 text-slate-400' : 'bg-amber-600 text-white'}`}>{loading ? <Loader2 className="animate-spin" size={20} /> : 'Agendar Evento'}</button>
    </div>
  );

  return (
    <MobileModal title="Agendar Evento" subtitle="Calendário Operacional" icon={Calendar} iconColor="bg-amber-500" onClose={() => !loading && setQuickAction(null)} footer={footer}>
      <form id="new-agenda-form" onSubmit={handleSave} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Título do Evento *</label>
          <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Consulta Médica" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:bg-white" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Início *</label>
            <input required type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Término</label>
            <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold" />
          </div>
        </div>

        <div className="space-y-2 relative">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Paciente (Opcional)</label>
          <input type="text" value={selectedPatient?.name || search} onFocus={() => setIsPatientListOpen(true)} onChange={(e) => { setSearch(e.target.value); setSelectedPatientId(null); setIsPatientListOpen(true); }} placeholder="Buscar paciente..." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:bg-white" />
          {isPatientListOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 max-h-40 overflow-y-auto">
              {filteredPatients.map(p => (
                <button key={p.id} type="button" onClick={() => { setSelectedPatientId(p.id); setSearch(p.name); setIsPatientListOpen(false); }} className="w-full flex items-center gap-3 p-4 hover:bg-amber-50 text-left border-b border-slate-50 last:border-0"><span className="text-sm font-bold text-slate-800">{p.name}</span></button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Descrição</label>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes adicionais..." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:bg-white resize-none" />
        </div>
      </form>
    </MobileModal>
  );
};

export default NewAgendaModal;