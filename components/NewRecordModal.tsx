import React, { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import MobileModal from './common/MobileModal';

const NewRecordModal: React.FC = () => {
  const { brain, setQuickAction, push, addToast } = useBrain();
  const [loading, setLoading] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [content, setContent] = useState('');
  
  // AQUI ESTÁ A MUDANÇA: 'Enfermagem' virou 'Metas'
  const [type, setType] = useState('Geral / Rotina');

  const activePatients = brain.patients?.filter(p => p.status === 'active') || [];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      addToast("Selecione um paciente.", "warning");
      return;
    }
    if (!content.trim()) {
      addToast("O conteúdo não pode estar vazio.", "warning");
      return;
    }

    setLoading(true);
    try {
      const patient = activePatients.find(p => p.id === patientId);
      
      await push('records', {
        id: crypto.randomUUID(),
        patient_id: patientId,
        patient_name: patient?.name,
        type: type, // Salva com o tipo selecionado (agora pode ser 'Metas')
        content: content,
        date: new Date().toISOString().split('T')[0],
        tags: [type] // Usa o tipo como etiqueta
      });

      addToast("Evolução registrada com sucesso!", "success");
      setQuickAction(null);
    } catch (err) {
      console.error(err);
      addToast("Erro ao salvar evolução.", "error");
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex gap-3 w-full">
      <button type="button" onClick={() => setQuickAction(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-[10px] uppercase text-slate-500">Cancelar</button>
      <button form="new-record-form" type="submit" disabled={loading} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-[10px] uppercase shadow-lg">
        {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Assinar Evolução'}
      </button>
    </div>
  );

  return (
    <MobileModal 
      title="Nova Evolução" 
      subtitle="Registro Clínico" 
      icon={FileText} 
      iconColor="bg-indigo-600" 
      onClose={() => setQuickAction(null)} 
      footer={footer}
    >
      <form id="new-record-form" onSubmit={handleSave} className="space-y-6">
        
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Paciente</label>
          <select required value={patientId} onChange={e => setPatientId(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold text-sm outline-none focus:border-indigo-500 transition-colors">
            <option value="">Selecione...</option>
            {activePatients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Tipo de Registro</label>
          <select value={type} onChange={e => setType(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold text-sm outline-none focus:border-indigo-500 transition-colors">
            <option value="Geral / Rotina">Geral / Rotina</option>
            <option value="Metas">Metas</option> {/* NOVO ITEM */}
            <option value="Psicologia">Psicologia</option>
            <option value="Psiquiatria">Psiquiatria</option>
            <option value="Terapia Ocupacional">Terapia Ocupacional</option>
            <option value="Serviço Social">Serviço Social</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Descrição</label>
          <textarea 
            required
            rows={6}
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:border-indigo-500 resize-none"
            placeholder="Descreva a evolução do paciente..."
          />
        </div>

      </form>
    </MobileModal>
  );
};

export default NewRecordModal;
