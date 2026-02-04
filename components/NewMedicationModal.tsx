import React, { useState } from 'react';
import { Pill, Loader2, Clock } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
// Se o seu projeto não usa MobileModal, troque por uma div ou outro componente de modal que você já tenha
// Mas como os outros modais usam, vou manter o padrão provável:
import MobileModal from './common/MobileModal'; 

const NewMedicationModal: React.FC = () => {
  const { brain, setQuickAction, push, addToast } = useBrain();
  const [loading, setLoading] = useState(false);
  
  const [patientId, setPatientId] = useState('');
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('08:00');

  const activePatients = brain.patients?.filter(p => p.status === 'active') || [];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !medName) return;

    setLoading(true);
    try {
      const patient = activePatients.find(p => p.id === patientId);
      
      await push('medications', {
        id: crypto.randomUUID(),
        patient_id: patientId,
        patient_name: patient?.name,
        name: medName,
        dosage,
        scheduled_time: time,
        status: 'pending'
      });

      setQuickAction(null);
    } catch (err) {
      console.error(err);
      addToast("Erro ao criar prescrição", "error");
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex gap-3 w-full">
      <button type="button" onClick={() => setQuickAction(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-[10px] uppercase text-slate-500">Cancelar</button>
      <button form="new-med-form" type="submit" disabled={loading} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-[10px] uppercase shadow-lg">
        {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Agendar'}
      </button>
    </div>
  );

  return (
    <MobileModal 
      title="Nova Prescrição" 
      subtitle="Agendar Medicação" 
      icon={Pill} 
      iconColor="bg-indigo-600" 
      onClose={() => setQuickAction(null)} 
      footer={footer}
    >
      <form id="new-med-form" onSubmit={handleSave} className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Paciente</label>
          <select required value={patientId} onChange={e => setPatientId(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold text-sm outline-none focus:border-indigo-500 transition-colors">
            <option value="">Selecione...</option>
            {activePatients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Medicamento</label>
          <input required placeholder="Ex: Dipirona, Rivotril..." value={medName} onChange={e => setMedName(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold text-sm outline-none focus:border-indigo-500 transition-colors" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Dose</label>
            <input required placeholder="Ex: 500mg" value={dosage} onChange={e => setDosage(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold text-sm outline-none focus:border-indigo-500 transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Horário</label>
            <div className="relative">
                <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input type="time" required value={time} onChange={e => setTime(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl font-bold text-sm outline-none focus:border-indigo-500 transition-colors" />
            </div>
          </div>
        </div>
      </form>
    </MobileModal>
  );
};

export default NewMedicationModal;