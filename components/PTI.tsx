import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, Plus, CheckCircle2, Circle, Clock, 
  Target, Calendar, User, ChevronDown, Save, FileText 
} from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import { PTIGoal } from '../types';
import MobileModal from './common/MobileModal';
import EmptyState from './common/EmptyState';

const PTI: React.FC = () => {
  const { brain, push, addToast, refreshData } = useBrain();
  
  // Estado
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Formulário
  const [formData, setFormData] = useState({
    goals: '',
    therapies: '',
    frequency: 'Diário',
    evolution_notes: '',
    deadline: ''
  });

  // 1. DADOS FILTRADOS
  const activePatients = brain.patients.filter(p => p.status === 'active');
  
  const patientGoals = useMemo(() => {
    if (!selectedPatientId) return [];
    return brain.pti.filter(p => p.patient_id === selectedPatientId);
  }, [brain.pti, selectedPatientId]);

  const selectedPatient = activePatients.find(p => p.id === selectedPatientId);

  // 2. AÇÕES
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      addToast("Selecione um acolhido primeiro.", "warning");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        clinic_id: brain.session.clinicId,
        patient_id: selectedPatientId,
        goals: formData.goals,
        therapies: formData.therapies,
        frequency: formData.frequency,
        evolution_notes: formData.evolution_notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await push('pti', payload);
      
      addToast("Meta terapêutica registrada!", "success");
      setIsModalOpen(false);
      setFormData({ goals: '', therapies: '', frequency: 'Diário', evolution_notes: '', deadline: '' });
      refreshData();
    } catch (error) {
      console.error(error);
      addToast("Erro ao salvar PTI.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* CABEÇALHO */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ClipboardList className="text-indigo-600" size={32} />
            Plano Terapêutico
          </h1>
          <p className="text-lg text-slate-500 font-medium">Metas e evolução individual (PTI).</p>
        </div>
      </header>

      {/* SELETOR DE ACOLHIDO (Obrigatório) */}
      <div className="bg-white p-6 rounded-[24px] border border-indigo-100 shadow-sm">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">
          Selecione o Acolhido
        </label>
        <div className="relative">
          <select 
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-lg font-bold rounded-2xl px-5 py-4 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer"
          >
            <option value="">-- Selecione para ver o plano --</option>
            {activePatients.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* CONTEÚDO DO PTI */}
      {selectedPatientId ? (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">Metas Ativas</h2>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wide flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all"
            >
              <Plus size={16} /> Nova Meta
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {patientGoals.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[24px] p-10 text-center">
                <Target className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-500 font-medium">Nenhuma meta definida para {selectedPatient?.name.split(' ')[0]}.</p>
                <button onClick={() => setIsModalOpen(true)} className="text-indigo-600 font-bold text-sm mt-2 hover:underline">
                  Criar o primeiro PTI
                </button>
              </div>
            ) : (
              patientGoals.map((goal, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:border-indigo-200 transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-black text-lg">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-black text-slate-800 mb-1">{goal.goals}</h3>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          Em Andamento
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-slate-50 p-3 rounded-xl">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Estratégia / Terapias</span>
                          <p className="text-sm font-medium text-slate-700">{goal.therapies}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Evolução Observada</span>
                           <p className="text-sm font-medium text-slate-700">{goal.evolution_notes || 'Sem observações.'}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-4 text-xs font-bold text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {goal.frequency}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          Criado em {new Date(goal.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      ) : (
        <EmptyState 
          icon={User} 
          title="Selecione um Acolhido" 
          description="O Plano Terapêutico é individual. Escolha um acolhido acima para gerenciar suas metas." 
        />
      )}

      {/* MODAL NOVA META */}
      {isModalOpen && (
        <MobileModal
          title="Definir Meta (PTI)"
          subtitle={`Para: ${selectedPatient?.name}`}
          icon={Target}
          iconColor="bg-indigo-600"
          onClose={() => setIsModalOpen(false)}
          footer={
            <div className="flex gap-3 w-full">
               <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold text-xs uppercase">Cancelar</button>
               <button onClick={handleSave} disabled={loading} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase hover:bg-indigo-700 shadow-lg">
                 {loading ? 'Salvando...' : 'Registrar Meta'}
               </button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Meta Principal */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Objetivo / Meta</label>
              <textarea 
                value={formData.goals}
                onChange={e => setFormData({...formData, goals: e.target.value})}
                className="w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 focus:border-indigo-500 outline-none min-h-[80px]"
                placeholder="Ex: Aceitação da dependência, Melhoria do convívio social..."
              />
            </div>

            {/* Estratégia */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Terapias & Estratégias</label>
              <textarea 
                value={formData.therapies}
                onChange={e => setFormData({...formData, therapies: e.target.value})}
                className="w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-700 focus:border-indigo-500 outline-none min-h-[80px]"
                placeholder="Ex: Laborterapia (Jardinagem), Grupo de Sentimentos (2x sem)..."
              />
            </div>

            {/* Frequência */}
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Frequência</label>
                  <select 
                    value={formData.frequency}
                    onChange={e => setFormData({...formData, frequency: e.target.value})}
                    className="w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none"
                  >
                    <option>Diário</option>
                    <option>Semanal</option>
                    <option>Mensal</option>
                    <option>Sob Demanda</option>
                  </select>
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Prazo (Opcional)</label>
                  <input 
                    type="date"
                    value={formData.deadline}
                    onChange={e => setFormData({...formData, deadline: e.target.value})}
                    className="w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none"
                  />
               </div>
            </div>

            {/* Evolução Inicial */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Observações Iniciais</label>
              <input 
                value={formData.evolution_notes}
                onChange={e => setFormData({...formData, evolution_notes: e.target.value})}
                className="w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-700 focus:border-indigo-500 outline-none"
                placeholder="Estado atual do acolhido em relação a esta meta..."
              />
            </div>
          </div>
        </MobileModal>
      )}

    </div>
  );
};

export default PTI;
