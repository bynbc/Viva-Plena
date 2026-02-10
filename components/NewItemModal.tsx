import React, { useState } from 'react';
import { Package, Save } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import MobileModal from './common/MobileModal';

const NewItemModal: React.FC = () => {
  const { brain, setQuickAction, push, addToast } = useBrain();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [qtd, setQtd] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);
    try {
       await push('inventory', {
          clinic_id: brain.session.clinicId, // <--- CARIMBO
          name,
          quantity: Number(qtd),
          unit: 'un',
          min_threshold: 5,
          created_at: new Date().toISOString()
       });
       addToast("Item adicionado!", "success");
       setQuickAction(null);
    } catch(err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <MobileModal title="Novo Item" subtitle="Estoque" icon={Package} iconColor="bg-emerald-600" onClose={() => setQuickAction(null)} footer={<button onClick={handleSave} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold">Salvar</button>}>
      <div className="space-y-4">
         <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do Produto" className="w-full p-4 bg-slate-50 rounded-xl font-bold border-slate-200 border" />
         <input type="number" value={qtd} onChange={e => setQtd(e.target.value)} placeholder="Quantidade Atual" className="w-full p-4 bg-slate-50 rounded-xl font-bold border-slate-200 border" />
      </div>
    </MobileModal>
  );
};
export default NewItemModal;
