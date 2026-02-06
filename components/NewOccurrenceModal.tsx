import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import MobileModal from './common/MobileModal';

const NewOccurrenceModal: React.FC = () => {
  const { brain, setQuickAction, push, addToast } = useBrain();
  const [loading, setLoading] = useState(false);
  
  // ESTADOS
  const [patientId, setPatientId] = useState('');
  const [severity, setSeverity] = useState('Média'); // Traduzido
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Comportamental');

  const activePatients = brain.patients?.filter(p => p.status === 'active') || [];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return addToast("Selecione o paciente.", "warning");
    if (!description) return addToast("Descreva o ocorrido.", "warning");

    setLoading(true);
    try {
      const patient = activePatients.find(p => p.id === patientId);
      
      await push('occurrences', {
        id: crypto.randomUUID(),
        patient_id: patientId,
        patient_name: patient?.name,
        type,
        severity,
        description,
        status: 'open',
        date: new Date().toISOString().split('T')[0]
      });

      addToast("Ocorrência registrada!", "success");
      setQuickAction(null);
    } catch (err) {
      console.error(err);
      addToast("Erro ao salvar.", "error");
    } finally {
      setLoading(false);
    }
  };

  // OPÇÕES TRADUZIDAS
  const severities = [
    { label: 'Leve', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Média', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { label: 'Grave', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { label: 'Crítica', color: 'bg-rose-50 text-rose-700 border-rose-200' }
  ];

  const footer = (
    <div className="flex gap-3 w-full">
      <button type="button" onClick={() => setQuickAction(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-[10px] uppercase text-slate-500">Cancelar</button>
      <button form="new-occ-form" type="submit" disabled={loading} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold text-[10px] uppercase shadow-lg hover:bg-rose-700 transition-all">
        {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Registrar'}
      </button>
    </div>
  );

  return (
    <MobileModal 
      title="Nova Ocorrência" 
      subtitle="Registro Disciplinar" 
      icon={AlertTriangle} 
      iconColor="bg-rose-600" 
      onClose={() => setQuickAction(null)} 
      footer={footer}
    >
      <form id="new-occ-form" onSubmit={handleSave} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Paciente Envolvido *</label>
          <select required value={patientId} onChange={e => setPatientId(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-rose-500 transition-colors">
            <option value="">Selecione...</option>
            {activePatients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Gravidade *</label>
          <div className="grid grid-cols-4 gap-2">
            {severities.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setSeverity(item.label)}
                className={`py-3 rounded-xl border text-[10px] font-black uppercase transition-all ${
                  severity === item.label 
                    ? `${item.color} shadow-sm scale-[1.02]` 
                    : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Tipo de Incidente</label>
          <select value={type} onChange={e => setType(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-rose-500">
            <option value="Comportamental">Comportamental</option>
            <option value="Agressão Verbal">Agressão Verbal</option>
            <option value="Agressão Física">Agressão Física</option>
            <option value="Posse de Ilícitos">Posse de Ilícitos</option>
            <option value="Outros">Outros</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Relato do Ocorrido *</label>
          <textarea 
            required
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:border-rose-500 resize-none"
            placeholder="Descreva detalhadamente..."
          />
        </div>
      </form>
    </MobileModal>
  );
};

export default NewOccurrenceModal;
