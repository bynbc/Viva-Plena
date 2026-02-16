import React, { useState, useEffect } from 'react';
import { Brain, Target, Calendar, CheckCircle2, Search, Save, ChevronRight } from 'lucide-react';
import { useBrain } from '../context/BrainContext';

const PTI: React.FC = () => {
  const { brain, push, addToast } = useBrain();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados do Formulário PTI (Manual)
  const [goals, setGoals] = useState('');
  const [approach, setApproach] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);

  const activePatients = brain.patients.filter(p => p.status === 'active');
  const filteredPatients = activePatients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectedPatient = brain.patients.find(p => p.id === selectedPatientId);

  // Carrega o PTI existente somente quando o paciente MUDAR
  useEffect(() => {
    if (selectedPatientId) {
      // Procura o PTI mais recente desse paciente
      const existingPTI = brain.pti?.find(p => p.patient_id === selectedPatientId);
      if (existingPTI && existingPTI.goals) {
        setGoals(existingPTI.goals.short_term || '');
        setApproach(existingPTI.goals.psychological_approach || '');
        setDeadline(existingPTI.goals.deadline || '');
      } else {
        // Limpa se não tiver nada
        setGoals('');
        setApproach('');
        setDeadline('');
      }
    }
  }, [selectedPatientId]); // REMOVIDO brain.pti das dependências para evitar loop/overwrite enquanto digita

  const handleSavePTI = async () => {
    if (!selectedPatientId) return;
    if (!goals && !approach) return addToast("Preencha pelo menos uma meta ou abordagem.", "warning");

    setLoading(true);
    try {
      // Salva/Atualiza o PTI no banco
      // Como o banco não tem UPDATE fácil no push, vamos criar um novo registro que será o "vigente"
      // ou se você tiver um método update implementado, melhor.
      // Aqui vou assumir que criamos um novo histórico de plano ou atualizamos o atual.

      await push('pti_goals', {
        clinic_id: brain.session.clinicId,
        patient_id: selectedPatientId,
        goals: {
          short_term: goals,
          psychological_approach: approach,
          deadline: deadline,
          updated_at: new Date().toISOString(),
          updated_by: brain.session.user?.username
        },
        created_at: new Date().toISOString()
      });

      addToast("Plano Terapêutico atualizado com sucesso!", "success");
    } catch (err) {
      addToast("Erro ao salvar o plano.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:h-[calc(100vh-100px)] h-auto flex flex-col md:flex-row gap-6 animate-in fade-in">

      {/* SELEÇÃO DE PACIENTE */}
      <div className="w-full md:w-80 flex flex-col gap-4 md:h-full h-auto">
        <div className="glass-card p-4 rounded-[24px] md:h-full h-auto flex flex-col">
          <h2 className="text-lg font-black text-slate-800 mb-1">PTI - Singular</h2>
          <p className="text-xs text-slate-500 font-bold uppercase mb-4">Selecione o acolhido</p>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/50 rounded-xl text-sm font-bold outline-none border border-white/50 focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
            />
          </div>

          <div className="space-y-2 md:overflow-y-auto overflow-visible flex-1 custom-scrollbar max-h-[300px] md:max-h-none">
            {filteredPatients.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPatientId(p.id)}
                className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all ${selectedPatientId === p.id
                  ? 'bg-indigo-600 text-white shadow-indigo-200 shadow-lg'
                  : 'bg-white/40 hover:bg-white/80 text-slate-600 border border-white/50'
                  }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${selectedPatientId === p.id ? 'bg-white/20' : 'bg-slate-200'
                  }`}>
                  {p.name.substring(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-bold truncate">{p.name}</span>
                {selectedPatientId === p.id && <ChevronRight size={16} className="ml-auto" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ÁREA DE EDIÇÃO DO PLANO */}
      <div className="flex-1 glass-card rounded-[32px] p-4 md:p-8 md:overflow-y-auto overflow-visible relative min-h-[500px]">
        {!selectedPatient ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
            <Brain size={64} className="mb-4 text-slate-400" />
            <p className="text-xl font-black text-slate-400 text-center px-4">Selecione um paciente para editar o plano</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <header className="flex flex-col md:flex-row justify-between items-start border-b border-slate-200/50 pb-6 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-800">Plano Terapêutico Singular</h1>
                <p className="text-lg text-indigo-600 font-bold mt-1">{selectedPatient.name}</p>
              </div>
              <div className="flex flex-col items-start md:items-end w-full md:w-auto">
                <span className="text-[10px] font-black text-slate-400 uppercase mb-1">Vigência do Plano</span>
                <input
                  type="text"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  placeholder="Ex: 2025/2026"
                  className="bg-indigo-50/50 text-indigo-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide outline-none w-full md:w-32 text-left md:text-right focus:ring-2 focus:ring-indigo-200 border border-indigo-100/50"
                />
              </div>
            </header>

            <div className="grid grid-cols-1 gap-6">

              {/* METAS */}
              <div className="p-4 md:p-6 bg-white/40 rounded-3xl border border-white/60 shadow-inner">
                <div className="flex items-center gap-3 mb-4 text-slate-700">
                  <Target size={24} className="text-indigo-600" />
                  <h3 className="font-black text-lg">Metas de Curto/Médio Prazo</h3>
                </div>
                <p className="text-xs text-slate-400 font-bold uppercase mb-2">Descreva as metas acordadas com a equipe:</p>
                <textarea
                  value={goals}
                  onChange={e => setGoals(e.target.value)}
                  className="w-full p-4 bg-white/60 rounded-2xl border border-white/50 outline-none focus:border-indigo-500 focus:bg-white focus:shadow-md transition-all min-h-[300px] md:min-h-[200px] text-base md:text-sm text-slate-700 font-medium leading-relaxed backdrop-blur-sm"
                  placeholder="- Adaptação à rotina&#10;- Redução de ansiedade&#10;- Participação nas oficinas..."
                />
              </div>

              {/* ABORDAGEM */}
              <div className="p-4 md:p-6 bg-white/40 rounded-3xl border border-white/60 shadow-inner">
                <div className="flex items-center gap-3 mb-4 text-slate-700">
                  <Brain size={24} className="text-indigo-600" />
                  <h3 className="font-black text-lg">Abordagem Terapêutica & Estratégias</h3>
                </div>
                <p className="text-xs text-slate-400 font-bold uppercase mb-2">Metodologia e focos do tratamento:</p>
                <textarea
                  value={approach}
                  onChange={e => setApproach(e.target.value)}
                  className="w-full p-4 bg-white/60 rounded-2xl border border-white/50 outline-none focus:border-indigo-500 focus:bg-white focus:shadow-md transition-all min-h-[300px] md:min-h-[200px] text-base md:text-sm text-slate-700 font-medium leading-relaxed backdrop-blur-sm"
                  placeholder="Ex: Terapia Cognitivo-Comportamental com foco em prevenção de recaída..."
                />

              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={handleSavePTI}
                disabled={loading}
                className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase hover:bg-emerald-600 transition-all shadow-lg flex items-center gap-2"
              >
                {loading ? 'Salvando...' : <><Save size={18} /> Salvar Plano Terapêutico</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PTI;
