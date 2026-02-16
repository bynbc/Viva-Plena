import React, { useState } from 'react';
import { Package, DollarSign } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import MobileModal from './common/MobileModal';

const NewItemModal: React.FC = () => {
  const { brain, setQuickAction, push, update, addToast, cancelEdit } = useBrain();
  const [loading, setLoading] = useState(false);

  // Verifica se estamos em modo de edição
  const editingItem = brain.ui.editingItem?.type === 'inventory' ? brain.ui.editingItem.data : null;

  const [name, setName] = useState(editingItem?.name || '');
  const [quantity, setQuantity] = useState(editingItem?.quantity || '');
  const [cost, setCost] = useState(''); // Custo sempre vazio ao abrir, exceto se for criar lógica de histórico
  const [category, setCategory] = useState(editingItem?.category || 'Outros');

  const handleClose = () => {
    cancelEdit();
    setQuickAction(null);
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity) return;
    setLoading(true);

    try {
      if (editingItem) {
        // ATUALIZAR ITEM EXISTENTE
        await update('inventory', editingItem.id, {
          name,
          quantity: Number(quantity),
          category
        });
        addToast("Item atualizado!", "success");
      } else {
        // CRIAR NOVO ITEM
        await push('inventory', {
          clinic_id: brain.session.clinicId,
          name,
          quantity: Number(quantity),
          unit: 'un',
          category,
          created_at: new Date().toISOString()
        });

        // 2. GERAÇÃO AUTOMÁTICA DE DESPESA (Só na criação)
        if (cost && Number(cost) > 0) {
          await push('transactions', {
            clinic_id: brain.session.clinicId,
            description: `Compra Estoque: ${name}`,
            amount: Number(cost),
            type: 'expense',
            category: category === 'Alimentos' ? 'Alimentação' : 'Almoxarifado', // Tenta mapear categoria
            status: 'paid',
            date: new Date().toISOString()
          });
          addToast("Gasto registrado no financeiro!", "success");
        }
        addToast("Item salvo no estoque!", "success");
      }

      handleClose();
    } catch (err) { addToast("Erro ao salvar.", "error"); }
    finally { setLoading(false); }
  };

  return (
    <MobileModal
      title={editingItem ? "Editar Item" : "Novo Item"}
      subtitle="Estoque & Gasto"
      icon={Package}
      iconColor="bg-blue-600"
      onClose={handleClose}
    >
      <form onSubmit={handleSave} className="space-y-4">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nome do Item"
          className="w-full p-4 bg-slate-50 text-slate-900 rounded-xl font-bold border border-slate-100 outline-none"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            placeholder="Qtd"
            className="w-full p-4 bg-slate-50 text-slate-900 rounded-xl font-bold border border-slate-100 outline-none"
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full p-4 bg-slate-50 text-slate-900 rounded-xl font-bold border border-slate-100 outline-none"
          >
            <option value="Alimentos">Alimentos</option>
            <option value="Limpeza">Limpeza</option>
            <option value="Medicamentos">Medicamentos</option>
            <option value="Equipamentos">Equipamentos</option>
            <option value="Outros">Outros</option>
          </select>
        </div>

        {!editingItem && (
          <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
            <label className="text-[10px] font-black text-rose-400 uppercase flex items-center gap-1"><DollarSign size={12} /> Custo da Compra (R$)</label>
            <input type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="0,00" className="w-full p-3 mt-1 bg-white rounded-lg font-black text-rose-600 outline-none border border-rose-200" />
          </div>
        )}

        <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase shadow-lg">
          {editingItem ? 'Salvar Alterações' : 'Confirmar Entrada'}
        </button>
      </form>
    </MobileModal>
  );
};
export default NewItemModal;
