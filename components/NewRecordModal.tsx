import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import MobileModal from './common/MobileModal';

// Adicione a interface de Props
interface NewRecordModalProps {
  onClose: () => void;
}

const NewRecordModal: React.FC<NewRecordModalProps> = ({ onClose }) => {
  const { push, addToast, brain } = useBrain();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!content) return;
    setLoading(true);
    try {
      await push('records', {
        clinic_id: brain.session.clinicId,
        content: content,
        patient_id: brain.patients[0]?.id || null, // Fallback simples
        created_at: new Date().toISOString(),
        created_by: brain.session.user?.username
      });
      addToast('Registro salvo!', 'success');
      onClose(); // Usa a prop onClose
    } catch (err) {
      addToast('Erro ao salvar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileModal
      title="Novo Registro"
      subtitle="Diário de Plantão"
      icon={FileText}
      iconColor="bg-indigo-600"
      onClose={onClose}
      footer={<button onClick={handleSave} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase">{loading ? 'Salvando...' : 'Registrar'}</button>}
    >
      <textarea
        className="w-full p-4 bg-slate-50 text-slate-900 rounded-2xl border border-slate-200 h-40 outline-none focus:border-indigo-500"
        placeholder="Descreva a ocorrência..."
        value={content}
        onChange={e => setContent(e.target.value)}
      />
    </MobileModal>
  );
};

export default NewRecordModal;
