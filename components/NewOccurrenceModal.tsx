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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'MEDIUM',
    patient_id: '' // Novo campo
  });
  const [loading, setLoading] = useState(false);

  // Filtra pacientes ativos
  const activePatients = brain.patients.filter(p => p.status === 'active');

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      return addToast('Preencha título e descrição.', 'warning');
    }

    setLoading(true);
    try {
      const selectedPatient = activePatients.find(p => p.id === formData.patient_id);

      const payload = {
        clinic_id: brain.session.clinicId,
        patient_id: formData.patient_id || null,
        patient_name: selectedPatient?.name || null,
        title: formData.title.trim(),
        description: formData.description.trim(),
        severity: formData.severity,
        status: 'open',
        created_at: new Date().toISOString(),
        created_by: brain.session.user?.username || 'Sistema'
      };

      console.log('Salando Ocorrência:', payload); // Debug

      await push('occurrences', payload);
      addToast('Ocorrência criada!', 'success');
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar ocorrência:', err);
      addToast(`Erro: ${err.message || 'Falha ao salvar'}`, 'error');
      setFormData({ title: '', description: '', severity: 'MEDIUM', patient_id: '' }); // Clear form
    } catch (err: any) {
      console.error('Erro ao salvar ocorrência:', err);
      // Ensure we don't leave it loading
      addToast(`Erro: ${err.message || 'Falha ao salvar'}`, 'error');
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
        {/* SELEÇÃO DE PACIENTE */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block">Envolvido (Opcional)</label>
          <select
            className="w-full p-3 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 outline-none font-bold"
            value={formData.patient_id}
            onChange={e => setFormData({ ...formData, patient_id: e.target.value })}
          >
            <option value="">-- Selecione o Acolhido --</option>
            {activePatients.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <input
          placeholder="Título (Ex: Briga, Fuga)"
          className="w-full p-3 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 outline-none"
          value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
        />
        <select
          className="w-full p-3 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 outline-none"
          value={formData.severity} onChange={e => setFormData({ ...formData, severity: e.target.value })}
        >
          <option value="LOW">Leve</option>
          <option value="MEDIUM">Média</option>
          <option value="HIGH">Grave</option>
          <option value="CRITICAL">Crítica</option>
        </select>
        <textarea
          placeholder="Descrição detalhada..."
          className="w-full p-3 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 h-32 outline-none"
          value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
    </MobileModal>
  );
};

export default NewOccurrenceModal;
