import React, { useMemo, useState } from 'react';
import { Brain, Search, Save, ChevronRight, Pencil, Trash2, X } from 'lucide-react';
import { useBrain } from '../context/BrainContext';

const PTI: React.FC = () => {
  const { brain, push, update, remove, addToast } = useBrain();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [goals, setGoals] = useState('');
  const [approach, setApproach] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const activePatients = brain.patients.filter((p) => p.status === 'active');
  const filteredPatients = activePatients.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectedPatient = brain.patients.find((p) => p.id === selectedPatientId);

  const patientPlans = useMemo(() => (
    (brain.pti || [])
      .filter((p) => p.patient_id === selectedPatientId)
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
  ), [brain.pti, selectedPatientId]);

  const resetForm = () => {
    setGoals('');
    setApproach('');
    setDeadline('');
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!selectedPatientId) return;
    if (!goals.trim() && !approach.trim()) return addToast('Preencha pelo menos uma meta ou abordagem.', 'warning');

    setLoading(true);
    try {
      const payload = {
        patient_id: selectedPatientId,
        patient_name: selectedPatient?.name || null,
        goals: {
          short_term: goals,
          psychological_approach: approach,
          deadline,
          updated_at: new Date().toISOString(),
          updated_by: brain.session.user?.username,
        },
        created_at: new Date().toISOString(),
      };

      if (editingId) {
        await update('pti_goals', editingId, payload);
        addToast('Plano terapêutico atualizado!', 'success');
      } else {
        await push('pti_goals', payload);
        addToast('Plano terapêutico salvo!', 'success');
      }

      resetForm();
    } catch (err: any) {
      addToast(`Erro ao salvar plano: ${err.message || 'Falha desconhecida'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: any) => {
    setEditingId(plan.id);
    setGoals(plan.goals?.short_term || '');
    setApproach(plan.goals?.psychological_approach || '');
    setDeadline(plan.goals?.deadline || '');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este plano terapêutico?')) return;
    try {
      await remove('pti_goals', id);
      addToast('Plano terapêutico excluído.', 'success');
      if (editingId === id) resetForm();
    } catch (err: any) {
      addToast(`Erro ao excluir plano: ${err.message || 'Falha desconhecida'}`, 'error');
    }
  };

  return (
    <div className="space-y-6 pb-20 md:h-[calc(100vh-100px)] h-auto flex flex-col md:flex-row gap-6 animate-in fade-in">
      <div className="w-full md:w-80 flex flex-col gap-4 md:h-full h-auto">
        <div className="glass-card p-4 rounded-[24px] md:h-full h-auto flex flex-col">
          <h2 className="text-lg font-black text-slate-800 mb-1">PTI - Singular</h2>
          <p className="text-xs text-slate-500 font-bold uppercase mb-4">Selecione o acolhido</p>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/50 rounded-xl text-sm font-bold outline-none border border-white/50 focus:border-indigo-500 focus:bg-white transition-all shadow-sm" />
          </div>

          <div className="space-y-2 md:overflow-y-auto overflow-visible flex-1 custom-scrollbar max-h-[300px] md:max-h-none">
            {filteredPatients.map((p) => (
              <button key={p.id} onClick={() => { setSelectedPatientId(p.id); resetForm(); }} className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all ${selectedPatientId === p.id ? 'bg-indigo-600 text-white shadow-indigo-200 shadow-lg' : 'bg-white/40 hover:bg-white/80 text-slate-700 border border-white/50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${selectedPatientId === p.id ? 'bg-white/20' : 'bg-slate-200'}`}>{p.name.substring(0, 2).toUpperCase()}</div>
                <span className="text-sm font-bold truncate">{p.name}</span>
                {selectedPatientId === p.id && <ChevronRight size={16} className="ml-auto" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 glass-card rounded-[32px] p-4 md:p-8 md:overflow-y-auto overflow-visible min-h-[500px]">
        {!selectedPatient ? (
          <div className="h-full flex flex-col items-center justify-center opacity-40">
            <Brain size={64} className="mb-4 text-slate-400" />
            <p className="text-xl font-black text-slate-400 text-center px-4">Selecione um paciente para gerenciar o PTI</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <header className="flex items-center justify-between border-b border-slate-200/50 pb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-800">Plano Terapêutico Singular</h1>
                <p className="text-base text-indigo-600 font-bold mt-1">{selectedPatient.name}</p>
              </div>
            </header>

            <div className="bg-white/60 rounded-2xl border border-slate-200 p-4 space-y-3">
              <textarea value={goals} onChange={(e) => setGoals(e.target.value)} className="w-full min-h-24 p-3 rounded-xl bg-white border border-slate-200 text-slate-800 outline-none" placeholder="Meta terapêutica" />
              <textarea value={approach} onChange={(e) => setApproach(e.target.value)} className="w-full min-h-24 p-3 rounded-xl bg-white border border-slate-200 text-slate-800 outline-none" placeholder="Abordagem e conduta" />
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full p-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold" />
              <div className="flex gap-2 justify-end">
                {editingId && <button onClick={resetForm} className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold flex items-center gap-1"><X size={14} />Cancelar edição</button>}
                <button onClick={handleSave} disabled={loading} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold flex items-center gap-2"><Save size={14} />{loading ? 'Salvando...' : editingId ? 'Atualizar Plano' : 'Salvar Plano'}</button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-black uppercase text-slate-500">Histórico de Planos</h3>
              {patientPlans.length === 0 ? (
                <p className="text-slate-400 font-bold text-sm">Nenhum plano registrado.</p>
              ) : patientPlans.map((plan) => (
                <div key={plan.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-xs font-black text-indigo-600 uppercase">{new Date(plan.created_at).toLocaleString('pt-BR')}</p>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(plan)} className="p-2 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"><Pencil size={15} /></button>
                      <button onClick={() => handleDelete(plan.id)} className="p-2 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700"><strong>Meta:</strong> {plan.goals?.short_term || '-'}</p>
                  <p className="text-sm text-slate-700 mt-1"><strong>Abordagem:</strong> {plan.goals?.psychological_approach || '-'}</p>
                  <p className="text-xs text-slate-500 mt-2"><strong>Prazo:</strong> {plan.goals?.deadline ? new Date(plan.goals.deadline).toLocaleDateString('pt-BR') : '-'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PTI;
