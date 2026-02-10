import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import MobileModal from './common/MobileModal';

// Adicione a interface de Props
interface NewOccurrenceModalProps {
  onClose: () => void;
}

const NewOccurrenceModal: React.FC<NewOccurrenceModalProps> = ({ onClose }) => {
  const { push, addToast, brain } = useBrain();
  const [formData, setFormData] = useState({ title: '', description: '', severity: 'MEDIUM' });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await push('occurrences', {
        clinic_id: brain.session.clinicId,
        title: formData.title,
        description: formData.description,
        severity: formData.severity,
        status: 'open',
        created_at: new Date().toISOString(),
        created_by: brain.session.user?.username
      });
      addToast('Ocorrência criada!', 'success');
      onClose();
    } catch (err) {
      addToast('Erro ao criar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileModal
      title="Nova Ocorrência"
      subtitle="Registro Disciplinar"
      icon={AlertTriangle}
      iconColor="bg-rose-600"
      onClose={onClose}
      footer={<button onClick={handleSave} className="w-full py-3 bg-rose-600 text-white rounded-xl font-bold uppercase">{loading ? 'Salvando...' : 'Registrar'}</button>}
    >
      <div className="space-y-4">
        <input 
           placeholder="Título (Ex: Briga, Fuga)" 
           className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none"
           value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
        />
        <select 
           className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none"
           value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})}
        >
           <option value="LOW">Leve</option>
           <option value="MEDIUM">Média</option>
           <option value="HIGH">Grave</option>
           <option value="CRITICAL">Crítica</option>
        </select>
        <textarea 
           placeholder="Descrição detalhada..." 
           className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 h-32 outline-none"
           value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
        />
      </div>
    </MobileModal>
  );
};

export default NewOccurrenceModal;
