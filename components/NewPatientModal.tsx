import React, { useState } from 'react';
import { UserPlus, Loader2 } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import { useAuth } from '../context/AuthContext';
import MobileModal from './common/MobileModal';

const NewPatientModal: React.FC = () => {
  // Chamada do contexto com verificação de segurança
  const context = useBrain();
  const { user, hasPermission } = useAuth();
  
  // 1. SOLUÇÃO PARA TELA BRANCA: 
  // Se o contexto ainda não carregou o 'brain', retornamos null para não quebrar o React.
  if (!context || !context.brain) {
    return null; 
  }

  const { brain, setQuickAction, push, navigate, addToast } = context;

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  
  // Estados financeiros para alimentar o módulo Financeiro
  const [monthlyFee, setMonthlyFee] = useState('4500.00');
  const [dueDay, setDueDay] = useState('10');

  const canCreate = hasPermission('patients');
  const activePatientsCount = brain.patients?.filter(p => p.status === 'active').length || 0;
  const patientLimit = brain.plan?.limits?.patients || 0;
  const isOverLimit = activePatientsCount >= patientLimit;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate || name.length < 2 || isOverLimit) return;

    setLoading(true);
    const newId = crypto.randomUUID();

    try {
      // 2. Salva o Paciente
      await push('patients', {
        id: newId,
        name: name.trim(),
        status: 'active',
        admissionDate: new Date().toISOString(),
        created_at: new Date().toISOString(),
        created_by: user?.username || 'system'
      });

      // 3. Gera a transação financeira automática na nova tabela do Supabase
      await push('transactions', {
        id: crypto.randomUUID(),
        patient_id: newId,
        clinic_id: brain.session?.clinicId || 'default',
        description: `Mensalidade - ${name}`,
        amount: parseFloat(monthlyFee),
        type: 'income',
        status: 'pending',
        category: 'Mensalidade',
        due_date: `2026-02-${dueDay}` 
      });

      addToast('Sucesso! Paciente e Financeiro criados.', 'success');
      setQuickAction(null);
      navigate('patients');
    } catch (err) {
      console.error("Erro ao salvar:", err);
      addToast("Erro de conexão com o banco.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileModal 
      title="Novo Paciente" 
      subtitle="Admissão & Financeiro" 
      icon={UserPlus} 
      iconColor="bg-emerald-600" 
      onClose={() => setQuickAction(null)}
      footer={
        <div className="flex gap-3 w-full">
          <button type="button" onClick={() => setQuickAction(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-[10px] uppercase text-slate-500">Cancelar</button>
          <button form="new-patient-form" type="submit" disabled={loading} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-[10px] uppercase shadow-lg">
            {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Confirmar'}
          </button>
        </div>
      }
    >
      <form id="new-patient-form" onSubmit={handleSave} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Nome do Paciente</label>
          <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:border-emerald-500 transition-all" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest pl-2">Mensalidade (R$)</label>
            <input type="number" value={monthlyFee} onChange={e => setMonthlyFee(e.target.value)} className="w-full px-5 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-sm font-black text-emerald-900 focus:bg-white outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Vencimento</label>
            <select value={dueDay} onChange={e => setDueDay(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold outline-none">
              <option value="05">Dia 05</option>
              <option value="10">Dia 10</option>
              <option value="15">Dia 15</option>
            </select>
          </div>
        </div>
      </form>
    </MobileModal>
  );
};

export default NewPatientModal;