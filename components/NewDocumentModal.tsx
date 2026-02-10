import React, { useState } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import MobileModal from './common/MobileModal';

const NewDocumentModal: React.FC = () => {
  const { setQuickAction, push, addToast, brain } = useBrain(); // setUI -> setQuickAction
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Laudo',
    patient_id: ''
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        await push('documents', {
            clinic_id: brain.session.clinicId,
            name: formData.name,
            type: formData.type,
            patient_id: formData.patient_id || null,
            created_at: new Date().toISOString(),
            created_by: brain.session.user?.username
        });
        addToast('Documento salvo!', 'success');
        setQuickAction(null);
    } catch (err) {
        addToast('Erro ao salvar.', 'error');
    } finally {
        setLoading(false);
    }
  };

  return (
    <MobileModal
      title="Novo Documento"
      subtitle="Upload e Arquivos"
      icon={FileText}
      iconColor="bg-slate-900"
      onClose={() => setQuickAction(null)}
      footer={<button onClick={handleSave} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold uppercase">{loading ? 'Salvando...' : 'Salvar'}</button>}
    >
      <div className="space-y-4">
         <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Nome do Arquivo</label>
            <input 
               value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
               className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none font-bold"
               placeholder="Ex: Laudo Psiquiátrico"
            />
         </div>
         <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Tipo</label>
            <select 
               value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
               className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none font-bold"
            >
               <option>Laudo</option>
               <option>Exame</option>
               <option>Contrato</option>
               <option>Documento Pessoal</option>
            </select>
         </div>
      </div>
    </MobileModal>
  );
};

export default NewDocumentModal;
