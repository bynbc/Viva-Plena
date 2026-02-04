import React, { useState, useEffect } from 'react';
import { useBrain } from '../context/BrainContext';
import { X, Save, Loader2, User, Pill, DollarSign } from 'lucide-react';

const GlobalEditModal: React.FC = () => {
  const { brain, update, cancelEdit } = useBrain();
  const { editingItem } = brain.ui;
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setFormData(editingItem.data);
    }
  }, [editingItem]);

  if (!editingItem) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await update(editingItem.type, editingItem.data.id, formData);
      // O update já chama cancelEdit no sucesso
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  // --- FORMULÁRIOS ESPECÍFICOS POR TIPO ---

  const renderFormContent = () => {
    switch (editingItem.type) {
      case 'patients':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4 text-emerald-600">
               <User size={24}/> <span className="font-black text-lg">Editar Paciente</span>
            </div>
            <Input label="Nome Completo" value={formData.name} onChange={(v: any) => handleChange('name', v)} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="CPF" value={formData.cpf} onChange={(v: any) => handleChange('cpf', v)} />
              <Input label="Acomodação (Quarto)" value={formData.room} onChange={(v: any) => handleChange('room', v)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Status</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none"
                  >
                    <option value="active">Ativo</option>
                    <option value="waiting">Em Espera</option>
                    <option value="discharged">Alta</option>
                    <option value="inactive">Inativo</option>
                  </select>
               </div>
               <Input type="number" label="Mensalidade (R$)" value={formData.monthly_fee} onChange={(v: any) => handleChange('monthly_fee', v)} />
            </div>
            <Input label="Responsável" value={formData.familyResponsible} onChange={(v: any) => handleChange('familyResponsible', v)} />
            <TextArea label="Diagnóstico / Notas" value={formData.reason} onChange={(v: any) => handleChange('reason', v)} />
          </div>
        );

      case 'medications':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4 text-indigo-600">
               <Pill size={24}/> <span className="font-black text-lg">Editar Prescrição</span>
            </div>
            <Input label="Medicamento" value={formData.name} onChange={(v: any) => handleChange('name', v)} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Dose" value={formData.dosage} onChange={(v: any) => handleChange('dosage', v)} />
              <Input type="time" label="Horário" value={formData.scheduled_time} onChange={(v: any) => handleChange('scheduled_time', v)} />
            </div>
          </div>
        );

      case 'transactions':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4 text-amber-600">
               <DollarSign size={24}/> <span className="font-black text-lg">Editar Transação</span>
            </div>
            <Input label="Descrição" value={formData.description} onChange={(v: any) => handleChange('description', v)} />
            <div className="grid grid-cols-2 gap-4">
              <Input type="number" label="Valor (R$)" value={formData.amount} onChange={(v: any) => handleChange('amount', v)} />
              <Input type="date" label="Data" value={formData.date ? formData.date.split('T')[0] : ''} onChange={(v: any) => handleChange('date', v)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Tipo</label>
                  <select value={formData.type} onChange={(e) => handleChange('type', e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none">
                    <option value="income">Entrada</option>
                    <option value="expense">Saída</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Categoria</label>
                  <select value={formData.category} onChange={(e) => handleChange('category', e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none">
                    <option value="Mensalidade">Mensalidade</option>
                    <option value="Serviços">Serviços</option>
                    <option value="Salários">Salários</option>
                    <option value="Alimentação">Alimentação</option>
                    <option value="Manutenção">Manutenção</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
            </div>
          </div>
        );

      default:
        return <p>Edição não suportada para este item.</p>;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
           <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Modo de Edição</span>
           <button onClick={cancelEdit} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 md:p-8">
          {renderFormContent()}

          {/* Footer Actions */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100">
            <button type="button" onClick={cancelEdit} className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white bg-slate-900 hover:bg-emerald-600 transition-colors shadow-lg flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Salvar Alterações</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componentes de Input Auxiliares
const Input = ({ label, value, onChange, type = "text" }: any) => (
  <div className="space-y-1.5 w-full">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">{label}</label>
    <input 
      type={type} 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all"
    />
  </div>
);

const TextArea = ({ label, value, onChange }: any) => (
  <div className="space-y-1.5 w-full">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">{label}</label>
    <textarea 
      rows={3}
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
    />
  </div>
);

export default GlobalEditModal;