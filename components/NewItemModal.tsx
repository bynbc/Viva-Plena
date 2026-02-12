import React, { useState } from 'react';
import { Package, DollarSign } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import MobileModal from './common/MobileModal';

const NewItemModal: React.FC = () => {
  const { brain, setQuickAction, push, addToast } = useBrain();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [cost, setCost] = useState(''); // CAMPO NOVO

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity) return;
    setLoading(true);

    try {
       // 1. Salva no Estoque
       await push('inventory', {
          clinic_id: brain.session.clinicId,
          name, quantity: Number(quantity), unit: 'un',
          created_at: new Date().toISOString()
       });

       // 2. GERAÇÃO AUTOMÁTICA DE DESPESA
       if (cost && Number(cost) > 0) {
           await push('transactions', {
               clinic_id: brain.session.clinicId,
               description: `Compra Estoque: ${name}`,
               amount: Number(cost),
               type: 'expense',
               category: 'Almoxarifado',
               status: 'paid',
               date: new Date().toISOString()
           });
           addToast("Gasto registrado no financeiro!", "success");
       }

       addToast("Item salvo no estoque!", "success");
       setQuickAction(null);
    } catch(err) { addToast("Erro ao salvar.", "error"); } 
    finally { setLoading(false); }
  };

  return (
    <MobileModal title="Novo Item" subtitle="Estoque & Gasto" icon={Package} iconColor="bg-blue-600" onClose={() => setQuickAction(null)}>
        <form onSubmit={handleSave} className="space-y-4">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do Item" className="w-full p-4 bg-slate-50 rounded-xl font-bold border border-slate-100 outline-none" />
          <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Quantidade" className="w-full p-4 bg-slate-50 rounded-xl font-bold border border-slate-100 outline-none" />
          <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
              <label className="text-[10px] font-black text-rose-400 uppercase flex items-center gap-1"><DollarSign size={12}/> Custo da Compra (R$)</label>
              <input type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="0,00" className="w-full p-3 mt-1 bg-white rounded-lg font-black text-rose-600 outline-none border border-rose-200" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase shadow-lg">Confirmar Entrada</button>
        </form>
    </MobileModal>
  );
};
export default NewItemModal;
