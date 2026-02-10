import React, { useState, useMemo } from 'react';
import { 
  Package, Search, Plus, AlertTriangle, Filter, 
  ShoppingCart, Archive, Trash2, Edit2, Save, X 
} from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import { InventoryItem } from '../types';
import MobileModal from './common/MobileModal';

const Inventory: React.FC = () => {
  const { brain, push, update, addToast } = useBrain();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Estado para Modal de Novo/Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  
  // Estado do Formulário
  const [formData, setFormData] = useState({
    name: '',
    category: 'Alimentos',
    quantity: '',
    unit: 'un',
    min_stock: '5'
  });

  // 1. ESTATÍSTICAS DO ESTOQUE
  const stats = useMemo(() => {
    const totalItems = brain.inventory.length;
    const lowStock = brain.inventory.filter(i => i.quantity <= i.min_stock).length;
    // Categorias
    const byCategory = brain.inventory.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalItems, lowStock, byCategory };
  }, [brain.inventory]);

  // 2. FILTRO
  const filteredItems = brain.inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // 3. AÇÕES (Salvar)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        clinic_id: brain.session.clinicId,
        name: formData.name,
        category: formData.category,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        min_stock: Number(formData.min_stock),
        updated_at: new Date().toISOString()
      };

      if (!formData.name.trim()) {
        addToast('Informe o nome do item.', 'warning');
        return;
      }

      if (editingItem) {
        await update('inventory', editingItem.id, payload);
      } else {
        await push('inventory', payload);
        addToast("Item adicionado ao estoque!", "success");
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      addToast("Erro ao salvar item.", "error");
    }
  };

  const resetForm = () => {
    setFormData({ name: '', category: 'Alimentos', quantity: '', unit: 'un', min_stock: '5' });
    setEditingItem(null);
  };

  const openEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      unit: item.unit,
      min_stock: item.min_stock.toString()
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* CABEÇALHO */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Package className="text-indigo-600" size={32} />
            Almoxarifado
          </h1>
          <p className="text-lg text-slate-500 font-medium">Controle de insumos e materiais.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all"
        >
          <Plus size={20} />
          Novo Item
        </button>
      </header>

      {/* CARDS DE ALERTA */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Itens</div>
          <div className="text-2xl font-black text-slate-900">{stats.totalItems}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-rose-400 text-[10px] font-black uppercase tracking-widest mb-1">Estoque Baixo</div>
          <div className="text-2xl font-black text-rose-600 flex items-center gap-2">
            {stats.lowStock}
            {stats.lowStock > 0 && <AlertTriangle size={18} className="animate-pulse" />}
          </div>
        </div>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar item..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl font-medium focus:border-indigo-500 outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {['all', 'Alimentos', 'Limpeza', 'Equipamentos', 'Medicamentos'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-colors
                ${categoryFilter === cat ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}
              `}
            >
              {cat === 'all' ? 'Todos' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* LISTA DE ITENS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => {
          const isLow = item.quantity <= item.min_stock;
          return (
            <div key={item.id} className={`bg-white p-5 rounded-[24px] border transition-all hover:shadow-md group relative
              ${isLow ? 'border-rose-200 bg-rose-50/30' : 'border-slate-100'}
            `}>
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest
                  ${item.category === 'Alimentos' ? 'bg-amber-100 text-amber-600' : 
                    item.category === 'Limpeza' ? 'bg-cyan-100 text-cyan-600' :
                    'bg-slate-100 text-slate-600'}
                `}>
                  {item.category}
                </span>
                {isLow && (
                  <span className="flex items-center gap-1 text-[10px] font-black text-rose-600 uppercase bg-rose-100 px-2 py-1 rounded-lg">
                    <AlertTriangle size={10} /> Repor
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-1">{item.name}</h3>
              
              <div className="flex items-end gap-1 mt-4">
                <span className={`text-3xl font-black ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
                  {item.quantity}
                </span>
                <span className="text-sm font-bold text-slate-400 mb-1">{item.unit}</span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="text-[10px] font-bold text-slate-400">Mínimo: {item.min_stock}</span>
                 <button onClick={() => openEdit(item)} className="text-indigo-600 p-2 hover:bg-indigo-50 rounded-lg">
                   <Edit2 size={16} />
                 </button>
              </div>
            </div>
          );
        })}
        
        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400">
            <Archive size={48} className="mb-4 opacity-20" />
            <p className="font-medium">Nenhum item encontrado no estoque.</p>
          </div>
        )}
      </div>

      {/* MODAL DE CADASTRO (Local) */}
      {isModalOpen && (
        <MobileModal
          title={editingItem ? "Editar Item" : "Novo Item"}
          subtitle="Controle de Estoque"
          icon={Package}
          iconColor="bg-indigo-600"
          onClose={() => setIsModalOpen(false)}
          footer={
            <div className="flex gap-3 w-full">
               <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold text-xs uppercase">Cancelar</button>
               <button onClick={handleSave} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase hover:bg-indigo-700">
                 Salvar Item
               </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Nome do Item</label>
              <input 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 focus:border-indigo-500 outline-none"
                placeholder="Ex: Arroz 5kg, Detergente..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Categoria</label>
                <select 
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none"
                >
                  <option>Alimentos</option>
                  <option>Limpeza</option>
                  <option>Equipamentos</option>
                  <option>Medicamentos</option>
                  <option>Outros</option>
                </select>
              </div>
              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase">Unidade</label>
                 <select 
                  value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}
                  className="w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none"
                >
                  <option value="un">Unidade (un)</option>
                  <option value="kg">Quilos (kg)</option>
                  <option value="l">Litros (l)</option>
                  <option value="cx">Caixa (cx)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase">Quantidade Atual</label>
                 <input 
                    type="number"
                    value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})}
                    className="w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 focus:border-indigo-500 outline-none"
                    placeholder="0"
                  />
               </div>
               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase">Estoque Mínimo</label>
                 <input 
                    type="number"
                    value={formData.min_stock} onChange={e => setFormData({...formData, min_stock: e.target.value})}
                    className="w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 focus:border-indigo-500 outline-none"
                    placeholder="5"
                  />
               </div>
            </div>
          </div>
        </MobileModal>
      )}

    </div>
  );
};

export default Inventory;
