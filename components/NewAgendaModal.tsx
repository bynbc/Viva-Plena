import React, { useState } from 'react';
import { Pill, Loader2, Clock, Plus, Trash2, X } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import MobileModal from './common/MobileModal';

const NewMedicationModal: React.FC = () => {
  const { brain, setQuickAction, push, addToast } = useBrain();
  const [loading, setLoading] = useState(false);
  const [patientId, setPatientId] = useState('');
  
  // LISTA DE MEDICAMENTOS (Array para adicionar vários)
  const [items, setItems] = useState([
    { id: crypto.randomUUID(), name: '', dosage: '', time: '08:00' }
  ]);

  const activePatients = brain.patients?.filter(p => p.status === 'active') || [];

  // Adiciona nova linha em branco
  const handleAddItem = () => {
    setItems([...items, { id: crypto.randomUUID(), name: '', dosage: '', time: '08:00' }]);
  };

  // Remove uma linha específica
  const handleRemoveItem = (id: string) => {
    if (items.length === 1) return; // Não remove o último
    setItems(items.filter(i => i.id !== id));
  };

  // Atualiza os campos da linha
  const updateItem = (id: string, field: string, value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      addToast("Selecione um paciente.", "warning");
      return;
    }

    // Filtra linhas vazias
    const validItems = items.filter(i => i.name.trim().length > 0);
    if (validItems.length === 0) {
      addToast("Adicione pelo menos um medicamento.", "warning");
      return;
    }

    setLoading(true);
    try {
      const patient = activePatients.find(p => p.id === patientId);
      
      // SALVA TUDO DE UMA VEZ (Loop de Promises)
      await Promise.all(validItems.map(item => 
        push('medications', {
          id: crypto.randomUUID(),
          patient_id: patientId,
          patient_name: patient?.name,
          name: item.name,
          dosage: item.dosage,
          scheduled_time: item.time,
          status: 'pending'
        })
      ));

      addToast(`${validItems.length} prescrições criadas!`, "success");
      setQuickAction(null);
    } catch (err) {
      console.error(err);
      addToast("Erro ao criar prescrições.", "error");
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex gap-3 w-full">
      <button type="button" onClick={() => setQuickAction(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-[10px] uppercase text-slate-500">Cancelar</button>
      <button form="new-med-form" type="submit" disabled={loading} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-[10px] uppercase shadow-lg">
        {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : `Agendar (${items.length})`}
      </button>
    </div>
  );

  return (
    <MobileModal 
      title="Nova Prescrição" 
      subtitle="Múltiplos Medicamentos" 
      icon={Pill} 
      iconColor="bg-indigo-600" 
      onClose={() => setQuickAction(null)} 
      footer={footer}
    >
      <form id="new-med-form" onSubmit={handleSave} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Paciente</label>
          <select required value={patientId} onChange={e => setPatientId(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold text-sm outline-none focus:border-indigo-500 transition-colors">
            <option value="">Selecione...</option>
            {activePatients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-end px-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lista de Medicamentos</label>
             <button type="button" onClick={handleAddItem} className="text-[10px] font-bold text-indigo-600 uppercase flex items-center gap-1 hover:underline">
               <Plus size={12} /> Adicionar Linha
             </button>
          </div>

          {items.map((item, index) => (
            <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative group animate-in slide-in-from-left-4 duration-300">
               {/* Botão remover linha */}
               {items.length > 1 && (
                 <button 
                   type="button" 
                   onClick={() => handleRemoveItem(item.id)}
                   className="absolute top-2 right-2 p-2 text-slate-300 hover:text-rose-500 transition-colors"
                 >
                   <X size={16} />
                 </button>
               )}
               
               <div className="flex items-center gap-2">
                 <span className="bg-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100">{index + 1}</span>
                 <input 
                    placeholder="Nome do Medicamento" 
                    value={item.name}
                    onChange={e => updateItem(item.id, 'name', e.target.value)}
                    className="flex-1 bg-transparent border-b border-slate-200 focus:border-indigo-500 outline-none text-sm font-bold placeholder:font-normal py-1"
                 />
               </div>
               
               <div className="grid grid-cols-2 gap-4 pl-8">
                 <input 
                    placeholder="Dose (Ex: 1cp)" 
                    value={item.dosage}
                    onChange={e => updateItem(item.id, 'dosage', e.target.value)}
                    className="bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-indigo-500"
                 />
                 <div className="relative">
                    <input 
                      type="time" 
                      value={item.time}
                      onChange={e => updateItem(item.id, 'time', e.target.value)}
                      className="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-indigo-500 text-center"
                    />
                 </div>
               </div>
            </div>
          ))}
          
          <button 
            type="button" 
            onClick={handleAddItem}
            className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-xs hover:border-indigo-300 hover:text-indigo-500 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Mais um medicamento
          </button>
        </div>
      </form>
    </MobileModal>
  );
};

export default NewMedicationModal;
