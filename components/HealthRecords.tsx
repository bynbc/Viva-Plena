import React, { useState, useMemo } from 'react';
import { 
  Stethoscope, Activity, Heart, Brain, Users, Plus, 
  Search, FileText, Lock, Calendar, ChevronDown 
} from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import { HealthRecord } from '../types';
import MobileModal from './common/MobileModal';
import EmptyState from './common/EmptyState';

const HealthRecords: React.FC = () => {
  const { brain, push, addToast, refreshData } = useBrain();
  
  // Estado
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'Psicologia' | 'Medicina' | 'Enfermagem' | 'Assistência Social'>('Enfermagem');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Formulário
  const [formData, setFormData] = useState({
    content: '',
    confidential_notes: ''
  });

  // 1. DADOS
  const activePatients = brain.patients.filter(p => p.status === 'active');
  const selectedPatient = activePatients.find(p => p.id === selectedPatientId);

  // Filtra prontuários pelo paciente E pela especialidade (aba) atual
  const filteredRecords = useMemo(() => {
    if (!selectedPatientId) return [];
    return brain.healthRecords
      .filter(r => r.patient_id === selectedPatientId && r.specialty === activeTab)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [brain.healthRecords, selectedPatientId, activeTab]);

  // 2. TABS CONFIG
  const tabs = [
    { id: 'Enfermagem', label: 'Enfermagem', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100' },
    { id: 'Medicina', label: 'Médico', icon: Stethoscope, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { id: 'Psicologia', label: 'Psicologia', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-100' },
    { id: 'Assistência Social', label: 'Social', icon: Users, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  // 3. AÇÕES
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    setLoading(true);
    try {
      const payload = {
        clinic_id: brain.session.clinicId,
        patient_id: selectedPatientId,
        professional_id: brain.session.user?.id,
        specialty: activeTab,
        content: formData.content,
        confidential_notes: formData.confidential_notes,
        created_at: new Date().toISOString()
      };

      await push('health_records', payload);
      
      addToast("Evolução registrada com sucesso!", "success");
      setIsModalOpen(false);
      setFormData({ content: '', confidential_notes: '' });
      refreshData();
    } catch (error) {
      addToast("Erro ao salvar evolução.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* CABEÇALHO */}
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Heart className="text-rose-500" size={32} fill="currentColor" fillOpacity={0.2} />
          Prontuário Saúde
        </h1>
        <p className="text-lg text-slate-500 font-medium">Evolução clínica multidisciplinar.</p>
      </header>

      {/* SELETOR DE ACOLHIDO */}
      <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">
          Acolhido em Atendimento
        </label>
        <div className="relative">
          <select 
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-lg font-bold rounded-2xl px-5 py-4 focus:border-indigo-500 outline-none transition-all cursor-pointer"
          >
            <option value="">-- Selecione o Paciente --</option>
            {activePatients.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {selectedPatientId ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
          
          {/* ABAS DE ESPECIALIDADE */}
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all
                    ${isActive 
                      ? `${tab.bg} ${tab.color} ring-2 ring-offset-2 ring-offset-slate-50 ring-indigo-100` 
                      : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}
                  `}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* LISTA DE EVOLUÇÕES (TIMELINE) */}
          <div className="bg-white rounded-[32px] border border-slate-100 p-6 min-h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                Histórico: <span className="text-indigo-600">{activeTab}</span>
              </h2>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase hover:bg-slate-800 flex items-center gap-2 shadow-lg"
              >
                <Plus size={16} /> Nova Evolução
              </button>
            </div>

            <div className="space-y-6 relative flex-1">
              {/* Linha do tempo vertical */}
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-100" />

              {filteredRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center">
                  <FileText size={48} className="mb-4 opacity-20" />
                  <p className="font-medium">Nenhuma evolução de {activeTab} registrada.</p>
                </div>
              ) : (
                filteredRecords.map((record, idx) => (
                  <div key={idx} className="relative pl-10 group">
                    {/* Bolinha da timeline */}
                    <div className={`absolute left-0 top-0 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10
                      ${activeTab === 'Medicina' ? 'bg-emerald-100 text-emerald-600' : 
                        activeTab === 'Psicologia' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}
                    `}>
                      <Activity size={14} />
                    </div>

                    {/* Card do Conteúdo */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-700">Dr(a). Profissional</span>
                          <span className="text-[10px] text-slate-400 font-bold">• {new Date(record.created_at).toLocaleDateString('pt-BR')} às {new Date(record.created_at).toLocaleTimeString('pt-BR').substring(0,5)}</span>
                        </div>
                        {record.confidential_notes && (
                          <div className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-md flex items-center gap-1 text-[10px] font-black uppercase" title="Anotação Sigilosa">
                            <Lock size={10} /> Sigilo
                          </div>
                        )}
                      </div>
                      
                      <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                        {record.content}
                      </p>

                      {/* Área Sigilosa (Visível só se tiver permissão - simulado aqui) */}
                      {record.confidential_notes && (
                        <div className="mt-3 pt-3 border-t border-slate-200/50">
                          <p className="text-xs font-medium text-rose-600 italic flex items-start gap-2">
                            <Lock size={12} className="mt-0.5 shrink-0" />
                            "{record.confidential_notes}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      ) : (
        <EmptyState 
          icon={Stethoscope} 
          title="Prontuário Clínico" 
          description="Selecione um acolhido acima para acessar o histórico médico e multidisciplinar." 
        />
      )}

      {/* MODAL NOVA EVOLUÇÃO */}
      {isModalOpen && (
        <MobileModal
          title={`Evolução - ${activeTab}`}
          subtitle={`Paciente: ${selectedPatient?.name}`}
          icon={FileText}
          iconColor="bg-slate-900"
          onClose={() => setIsModalOpen(false)}
          footer={
            <div className="flex gap-3 w-full">
               <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold text-xs uppercase">Cancelar</button>
               <button onClick={handleSave} disabled={loading} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase hover:bg-indigo-700 shadow-lg">
                 {loading ? 'Salvando...' : 'Assinar & Salvar'}
               </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-start gap-3">
              <Activity className="text-blue-600 mt-0.5" size={18} />
              <div>
                <p className="text-xs font-bold text-blue-800">Você está registrando como: {activeTab}</p>
                <p className="text-[10px] text-blue-600">Este registro ficará gravado permanentemente no histórico.</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Descrição da Evolução</label>
              <textarea 
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
                className="w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800 focus:border-indigo-500 outline-none min-h-[120px]"
                placeholder="Descreva o estado do paciente, intervenções realizadas e observações..."
              />
            </div>

            <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
              <label className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase mb-2">
                <Lock size={14} /> Anotações Privadas (Sigilo)
              </label>
              <textarea 
                value={formData.confidential_notes}
                onChange={e => setFormData({...formData, confidential_notes: e.target.value})}
                className="w-full p-3 bg-white rounded-xl border border-rose-200 font-medium text-slate-700 focus:border-rose-500 outline-none text-xs"
                placeholder="Informações sensíveis visíveis apenas para sua especialidade..."
              />
            </div>
          </div>
        </MobileModal>
      )}

    </div>
  );
};

export default HealthRecords;
