import React, { useState } from 'react';
import { Calendar, Loader2, Users, Clock, Save, X } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import MobileModal from './common/MobileModal';

const NewAgendaModal: React.FC = () => {
  const { brain, setQuickAction, push, addToast } = useBrain();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [patientId, setPatientId] = useState('');
  const [startAt, setStartAt] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [type, setType] = useState('Consulta');

  // Filtra apenas pacientes ativos para o select
  const activePatients = brain.patients?.filter(p => p.status === 'active') || [];

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title || !startAt) return addToast("Preencha título e horário.", "warning");

    setLoading(true);
    try {
      const patient = activePatients.find(p => p.id === patientId);

      // Monta o objeto do evento (CLEAN PAYLOAD)
      const payload = {
        clinic_id: brain.session.clinicId,
        title: title.trim(),
        patient_id: patientId || null,
        // patient_name: Resolvido automaticamente pelo BrainContext se omitido
        start_at: new Date(startAt).toISOString(),
        visitor_name: visitorName || null,
        description: type || 'Outro',
        created_at: new Date().toISOString(),
        created_by: brain.session.user?.username || 'Sistema'
      };

      await push('agenda', payload);

      addToast("Agendamento realizado com sucesso!", "success");
      setQuickAction(null);
    } catch (err: any) {
      console.error(err);
      // Feedback visual do erro
      const msg = err.message || "Erro desconhecido";
      addToast(`Erro ao agendar: ${msg}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex gap-3 w-full">
      <button type="button" onClick={() => setQuickAction(null)} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-xs uppercase text-slate-400 hover:bg-white/10 hover:text-white transition-colors">Cancelar</button>
      <button type="button" onClick={() => handleSave()} disabled={loading} className="flex-1 py-4 bg-amber-500 text-white rounded-2xl font-bold text-xs uppercase shadow-lg hover:bg-amber-600 transition-all flex items-center justify-center gap-2">
        {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Confirmar</>}
      </button>
    </div>
  );

  return (
    <MobileModal title="Novo Compromisso" subtitle="Agenda & Visitas" icon={Calendar} iconColor="bg-amber-500" onClose={() => setQuickAction(null)} footer={footer}>
      <form id="new-agenda-form" onSubmit={handleSave} className="space-y-6">

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">O que vai acontecer?</label>
          <input
            type="text"
            placeholder="Ex: Visita Familiar, Consulta Dr. Pedro..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-5 py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold text-sm outline-none focus:border-amber-500 transition-colors placeholder:text-slate-500"
            required
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Data e Hora</label>
          <div className="relative">
            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="datetime-local"
              value={startAt}
              onChange={e => setStartAt(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold text-sm outline-none focus:border-amber-500 transition-colors calendar-picker-indicator-white"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Tipo</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full px-5 py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold text-sm outline-none focus:border-amber-500 [&>option]:text-slate-900">
              <option value="Consulta">Consulta</option>
              <option value="Visita">Visita Familiar</option>
              <option value="Terapia">Terapia Grupo</option>
              <option value="Reunião">Reunião Equipe</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Acolhido</label>
            <select value={patientId} onChange={e => setPatientId(e.target.value)} className="w-full px-5 py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold text-sm outline-none focus:border-amber-500 [&>option]:text-slate-900">
              <option value="">(Geral / Todos)</option>
              {activePatients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        {type === 'Visita' && (
          <div className="space-y-2 animate-in slide-in-from-top-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Nome do Visitante</label>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Quem vem visitar?"
                value={visitorName}
                onChange={e => setVisitorName(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 text-white border border-amber-500/50 rounded-2xl font-bold text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:text-slate-500"
              />
            </div>
          </div>
        )}

      </form>
    </MobileModal>
  );
};

export default NewAgendaModal;
