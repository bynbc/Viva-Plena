import React from 'react';
import { Pill, CheckCircle2, Clock, AlertTriangle, User, Plus, Syringe, Trash2 } from 'lucide-react';
import { useBrain } from '../context/BrainContext';

const Medication: React.FC = () => {
  const { brain, update, remove, addToast, setQuickAction } = useBrain();
  
  const medications = (brain.medications || []).sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));

  const handleAdminister = async (id: string) => {
    try {
      await update('medications', id, { status: 'administered' });
      addToast('Medicação administrada!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Erro ao atualizar.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm("Excluir esta prescrição?")) {
       await remove('medications', id);
    }
  };

  const delayed = medications.filter(m => m.status === 'delayed');

  return (
    <div className="space-y-6 md:space-y-10 pb-20 animate-in fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">Medicação</h1>
          <p className="text-slate-500 font-medium mt-1">Painel de enfermagem.</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
          {delayed.length > 0 && (
            <div className="bg-rose-50 px-4 py-3 rounded-2xl flex items-center gap-2 animate-pulse flex-1 md:flex-none justify-center">
              <AlertTriangle className="text-rose-600" size={16} />
              <span className="text-rose-700 font-black text-[10px] uppercase">{delayed.length} Atrasos</span>
            </div>
          )}
          <button onClick={() => setQuickAction('new_medication')} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase shadow-lg flex-1 md:flex-none flex justify-center items-center gap-2 hover:bg-indigo-700 transition-all active:scale-95">
            <Plus size={16} /> Nova
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 md:gap-4">
        {medications.length === 0 ? (
           <div className="py-20 text-center opacity-60">
             <Syringe size={40} className="mx-auto mb-4 text-slate-400" />
             <p className="text-slate-500 font-bold">Sem medicações agendadas.</p>
             <button onClick={() => setQuickAction('new_medication')} className="text-indigo-600 text-xs font-bold mt-4 hover:underline">Criar a primeira</button>
           </div>
        ) : (
          medications.map((med) => (
            <div key={med.id} className={`p-5 rounded-[24px] border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
              med.status === 'administered' ? 'bg-emerald-50/50 border-emerald-100 opacity-75' : 'bg-white border-slate-100 shadow-sm'
            }`}>
              {/* Informações */}
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                   med.status === 'administered' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                }`}>
                  <Pill size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-base md:text-lg font-black text-slate-900 truncate">{med.name}</h4>
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-1">
                    <span className="text-xs font-bold text-slate-500">{med.dosage}</span>
                    <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[150px]">
                      <User size={10} className="text-slate-400" />
                      <span className="text-[9px] font-black text-slate-600 uppercase truncate">{med.patient_name || 'Sem Paciente'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações e Hora */}
              <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                 <div className="flex items-center gap-2">
                    <Clock size={16} className="text-slate-400" />
                    <span className="text-lg font-black text-slate-700">{med.scheduled_time}</span>
                 </div>

                 <div className="flex items-center gap-2">
                   {med.status !== 'administered' && (
                     <button onClick={() => handleAdminister(med.id)} className="bg-indigo-600 text-white p-3 rounded-xl shadow-lg active:scale-95 transition-all hover:bg-indigo-700" title="Confirmar Aplicação">
                       <CheckCircle2 size={20} />
                     </button>
                   )}
                   
                   {/* Botão de Excluir */}
                   <button onClick={() => handleDelete(med.id)} className="bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 p-3 rounded-xl transition-all" title="Excluir">
                     <Trash2 size={20} />
                   </button>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Medication;