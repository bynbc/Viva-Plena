import React, { useState } from 'react';
import { Calendar, Loader2, Users, AlignLeft, Clock } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import MobileModal from './common/MobileModal';

const NewAgendaModal: React.FC = () => {
  const { brain, setQuickAction, push, addToast } = useBrain();
  const [loading, setLoading] = useState(false);
  
  // Campos corretos para uma AGENDA
  const [title, setTitle] = useState('');
  const [patientId, setPatientId] = useState('');
  const [startAt, setStartAt] = useState(''); // Data e Hora
  const [visitorName, setVisitorName] = useState(''); // Para visitas
  const [type, setType] = useState('Consulta'); // Tipo do evento

  const activePatients = brain.patients?.filter(p => p.status === 'active') || [];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startAt) {
      addToast("Preencha o título e o horário.", "warning");
      return;
    }

    setLoading(true);
    try {
      const patient = activePatients.find(p => p.id === patientId);
      
      await push('agenda', {
        id: crypto.randomUUID(),
        clinic_id: brain.session.clinicId,
        title: title,
        patient_id: patientId || null,
        patient_name: patient?.name || null,
        start_at: startAt,
        description: `Tipo: ${type} ${visitorName ? `| Visitante: ${visitorName}` : ''}`,
        created_at: new Date().toISOString(),
        created_by: brain.session.user?.username
      });

      addToast("Agendamento realizado!", "success");
      setQuickAction(null);
    } catch (err) {
      console.error(err);
      addToast("Erro ao agendar.", "error");
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex gap-3 w-full">
      <button type="button" onClick={() => setQuickAction(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-[10px] uppercase text-slate-500">Cancelar</button>
      <button form="new-agenda-form" type="submit" disabled={loading} className="flex-1 py-4 bg-amber-500 text-white rounded-2xl font-bold text-[10px] uppercase shadow-lg hover:bg-amber-600">
        {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Confirmar Agendamento'}
      </button>
    </div>
  );

  return (
    <MobileModal 
      title="Novo Compromisso" 
      subtitle="Agenda & Visitas" 
      icon={Calendar} 
      iconColor="bg-amber-500" 
      onClose={() => setQuickAction(null)} 
      footer={footer}
    >
      <form id="new-agenda-form" onSubmit={handleSave} className="space-y-6">
        
        {/* Título do Evento */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">O que vai acontecer?</label>
          <input 
            type="text" 
            placeholder="Ex: Visita Familiar, Consulta Psiquiatra..." 
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-amber-500"
            required
          />
        </div>

        {/* Data e Hora */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Data e Hora</label>
          <div className="relative">
             <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="datetime-local" 
               value={startAt}
               onChange={e => setStartAt(e.target.value)}
               className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-amber-500"
               required
             />
          </div>
        </div>

        {/* Tipo de Evento */}
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Tipo</label>
             <select value={type} onChange={e => setType(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-amber-500">
               <option value="Consulta">Consulta</option>
               <option value="Visita">Visita Familiar</option>
               <option value="Terapia">Terapia Grupo</option>
               <option value="Reunião">Reunião Equipe</option>
               <option value="Outro">Outro</option>
             </select>
           </div>
           
           {/* Paciente Vinculado (Opcional) */}
           <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Acolhido (Opcional)</label>
             <select value={patientId} onChange={e => setPatientId(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-amber-500">
               <option value="">Nenhum / Geral</option>
               {activePatients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
             </select>
           </div>
        </div>

        {/* Nome do Visitante (Só aparece se for visita) */}
        {type === 'Visita' && (
          <div className="space-y-2 animate-in slide-in-from-top-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Nome do Visitante / Familiar</label>
            <div className="relative">
               <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                 type="text" 
                 placeholder="Quem vem visitar?" 
                 value={visitorName}
                 onChange={e => setVisitorName(e.target.value)}
                 className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-amber-200 rounded-2xl font-bold text-sm outline-none focus:border-amber-500"
               />
            </div>
          </div>
        )}

      </form>
    </MobileModal>
  );
};

export default NewAgendaModal;
