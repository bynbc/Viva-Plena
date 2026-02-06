import React, { useState } from 'react';
import { UserPlus, Loader2, User, FileText, CreditCard, Activity } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import { useAuth } from '../context/AuthContext';
import MobileModal from './common/MobileModal';

const NewPatientModal: React.FC = () => {
  const context = useBrain();
  const { user, hasPermission } = useAuth();
  
  // Proteção contra contexto nulo
  if (!context || !context.brain) return null;

  const { brain, setQuickAction, push, navigate, addToast } = context;

  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'pessoal' | 'clinico' | 'financeiro'>('pessoal');

  // FORM STATES
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    birthDate: '',
    phone: '',
    address: '',
    familyResponsible: '',
    emergencyPhone: '',
    admissionDate: new Date().toISOString().split('T')[0],
    treatmentType: 'Internação',
    cid_main: '',
    reason: '',
    paymentType: 'particular',
    insuranceName: '',
    monthly_fee: '4500.00',
    dueDay: '10'
  });

  const canCreate = hasPermission('patients');

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate || formData.name.length < 3) return;

    setLoading(true);
    const newId = crypto.randomUUID();

    try {
      // 1. Cria o Paciente com os dados novos
      await push('patients', {
        id: newId,
        name: formData.name.trim(),
        cpf: formData.cpf,
        birthDate: formData.birthDate,
        phone: formData.phone,
        address: formData.address,
        familyResponsible: formData.familyResponsible,
        emergencyPhone: formData.emergencyPhone,
        admissionDate: new Date(formData.admissionDate).toISOString(),
        status: 'active',
        treatmentType: formData.treatmentType,
        cid_main: formData.cid_main,
        reason: formData.reason,
        paymentType: formData.paymentType,
        insuranceName: formData.insuranceName,
        monthly_fee: parseFloat(formData.monthly_fee),
        created_at: new Date().toISOString(),
        created_by: user?.username || 'system'
      });

      // 2. Gera o Financeiro Inicial (Apenas se for Particular)
      if (formData.paymentType === 'particular') {
        await push('transactions', {
          id: crypto.randomUUID(),
          patient_id: newId,
          clinic_id: brain.session?.clinicId || 'default',
          description: `Mensalidade Inicial - ${formData.name}`,
          amount: parseFloat(formData.monthly_fee),
          type: 'income',
          status: 'pending',
          category: 'Mensalidade',
          due_date: new Date().toISOString(),
          date: new Date().toISOString()
        });
      }

      addToast('Paciente cadastrado com sucesso!', 'success');
      setQuickAction(null);
      navigate('patients');
    } catch (err) {
      console.error("Erro ao salvar:", err);
      addToast("Erro ao salvar dados.", "error");
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex gap-3 w-full">
      <button type="button" onClick={() => setQuickAction(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-[10px] uppercase text-slate-500">
        Cancelar
      </button>
      <button form="new-patient-form" type="submit" disabled={loading} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-[10px] uppercase shadow-lg hover:bg-emerald-700 transition-all">
        {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Finalizar Cadastro'}
      </button>
    </div>
  );

  return (
    <MobileModal 
      title="Admissão de Paciente" 
      subtitle="Cadastro Completo" 
      icon={UserPlus} 
      iconColor="bg-emerald-600" 
      onClose={() => setQuickAction(null)}
      footer={footer}
    >
      {/* NAVEGAÇÃO ENTRE ABAS */}
      <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
        <TabButton active={tab === 'pessoal'} onClick={() => setTab('pessoal')} icon={User} label="Pessoal" />
        <TabButton active={tab === 'clinico'} onClick={() => setTab('clinico')} icon={Activity} label="Clínico" />
        <TabButton active={tab === 'financeiro'} onClick={() => setTab('financeiro')} icon={CreditCard} label="Financeiro" />
      </div>

      <form id="new-patient-form" onSubmit={handleSave} className="space-y-6">
        
        {/* ABA PESSOAL */}
        {tab === 'pessoal' && (
          <div className="space-y-4 animate-in slide-in-from-left-4 fade-in duration-300">
            <Input label="Nome Completo *" value={formData.name} onChange={v => handleChange('name', v)} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="CPF" value={formData.cpf} onChange={v => handleChange('cpf', v)} placeholder="000.000.000-00" />
              <Input label="Nascimento" type="date" value={formData.birthDate} onChange={v => handleChange('birthDate', v)} />
            </div>
            <Input label="Endereço Completo" value={formData.address} onChange={v => handleChange('address', v)} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Responsável Família" value={formData.familyResponsible} onChange={v => handleChange('familyResponsible', v)} />
              <Input label="Tel. Emergência" value={formData.emergencyPhone} onChange={v => handleChange('emergencyPhone', v)} />
            </div>
          </div>
        )}

        {/* ABA CLÍNICO */}
        {tab === 'clinico' && (
          <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
             <div className="grid grid-cols-2 gap-4">
               <Input label="Data de Entrada" type="date" value={formData.admissionDate} onChange={v => handleChange('admissionDate', v)} />
               <Select label="Tipo de Tratamento" value={formData.treatmentType} onChange={v => handleChange('treatmentType', v)}>
                 <option value="Internação">Internação Involuntária</option>
                 <option value="Voluntária">Internação Voluntária</option>
                 <option value="Hospital Dia">Hospital Dia</option>
               </Select>
             </div>
             <Input label="CID Principal (Diagnóstico)" value={formData.cid_main} onChange={v => handleChange('cid_main', v)} placeholder="Ex: F19.2" />
             <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Observações / Plano Terapêutico</label>
               <textarea 
                  rows={4}
                  value={formData.reason} 
                  onChange={e => handleChange('reason', e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:bg-white resize-none"
                  placeholder="Resumo do caso..."
               />
             </div>
          </div>
        )}

        {/* ABA FINANCEIRO */}
        {tab === 'financeiro' && (
          <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
             <Select label="Modalidade" value={formData.paymentType} onChange={v => handleChange('paymentType', v)}>
               <option value="particular">Particular</option>
               <option value="convenio">Convênio Médico</option>
               <option value="social">Vaga Social / SUS</option>
             </Select>

             {formData.paymentType === 'convenio' && (
               <Input label="Nome do Convênio" value={formData.insuranceName} onChange={v => handleChange('insuranceName', v)} placeholder="Ex: Unimed" />
             )}

             {formData.paymentType === 'particular' && (
               <>
                 <Input label="Valor da Mensalidade (R$)" type="number" value={formData.monthly_fee} onChange={v => handleChange('monthly_fee', v)} />
                 <Select label="Dia de Vencimento" value={formData.dueDay} onChange={v => handleChange('dueDay', v)}>
                   <option value="05">Dia 05</option>
                   <option value="10">Dia 10</option>
                   <option value="15">Dia 15</option>
                   <option value="20">Dia 20</option>
                 </Select>
                 <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-800 text-xs font-bold">
                   Uma cobrança será gerada automaticamente ao salvar.
                 </div>
               </>
             )}
          </div>
        )}

      </form>
    </MobileModal>
  );
};

// Componentes Auxiliares
const Input = ({ label, value, onChange, type = "text", placeholder, required }: any) => (
  <div className="space-y-1.5 w-full">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">{label}</label>
    <input required={required} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all" />
  </div>
);

const Select = ({ label, value, onChange, children }: any) => (
  <div className="space-y-1.5 w-full">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500 transition-all cursor-pointer">
      {children}
    </select>
  </div>
);

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button type="button" onClick={onClick} className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all ${active ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>
    <Icon size={14} /> {label}
  </button>
);

export default NewPatientModal;
