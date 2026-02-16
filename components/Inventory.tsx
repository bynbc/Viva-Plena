import React, { useState } from 'react';
import { Package, Search, Plus, Filter, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import EmptyState from './common/EmptyState';

const Inventory: React.FC = () => {
  const { brain, setQuickAction, edit, remove } = useBrain();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Todos');

  const categories = ['Todos', 'Alimentos', 'Limpeza', 'Medicamentos', 'Equipamentos', 'Outros'];

  // Filtra por categoria E por nome
  const filteredItems = brain.inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Todos' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Calcula estatísticas rápidas
  const lowStockCount = brain.inventory.filter(i => i.quantity <= (i.min_threshold || 5)).length;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Controle de Estoque</h2>
          <p className="text-sm font-bold text-slate-400">Gerenciamento de insumos e patrimônio</p>
        </div>
        <button
          onClick={() => setQuickAction('new_stock')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Item
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase">Total de Itens</p>
          <p className="text-2xl font-black text-slate-800">{brain.inventory.length}</p>
        </div>
        <div className={`p-4 rounded-2xl border shadow-sm ${lowStockCount > 0 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
          <p className={`text-xs font-black uppercase ${lowStockCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>Alertas de Estoque</p>
          <p className={`text-2xl font-black ${lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {lowStockCount > 0 ? `${lowStockCount} itens baixos` : 'Tudo ok'}
          </p>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="space-y-3">
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center">
          <Search className="text-slate-400 ml-3" size={20} />
          <input
            placeholder="Buscar item..."
            className="w-full p-3 font-bold text-slate-700 outline-none bg-transparent placeholder:text-slate-300"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase whitespace-nowrap transition-all ${activeCategory === cat
                ? 'bg-slate-800 text-white shadow-md'
                : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Itens */}
      {filteredItems.length === 0 ? (
        <EmptyState title="Nenhum item encontrado" description="Tente mudar o filtro ou adicione um novo item." icon={Package} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map(item => {
            const min = item.min_threshold || 5;
            const isLow = item.quantity <= min;
            const percentage = Math.min((item.quantity / (min * 3)) * 100, 100);

            return (
              <div key={item.id} className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                {isLow && (
                  <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle size={10} /> Repor
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isLow ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                      <Package size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-lg leading-tight">{item.name}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase mt-1 bg-slate-100 inline-block px-2 py-0.5 rounded-md">
                        {item.category || 'Geral'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-50 rounded-xl p-2">
                    <button className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-rose-500 hover:bg-rose-50 font-black active:scale-90 transition-all">
                      <ArrowDown size={18} />
                    </button>

                    <div className="text-center flex-1">
                      <span className={`text-2xl font-black ${isLow ? 'text-rose-600' : 'text-slate-700'}`}>
                        {item.quantity}
                      </span>
                      <span className="text-xs font-bold text-slate-400 ml-1 uppercase">{item.unit}</span>
                    </div>

                    <button className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-emerald-500 hover:bg-emerald-50 font-black active:scale-90 transition-all">
                      <ArrowUp size={18} />
                    </button>
                  </div>

                  {/* Barra de Progresso Visual */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isLow ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>Mínimo: {min}</span>
                    <span>Status: {isLow ? 'Crítico' : 'Normal'}</span>
                  </div>

                  {/* Ações de Edição/Exclusão */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
                    <button
                      onClick={() => {
                        edit('inventory', item);
                        setQuickAction('new_stock');
                      }}
                      className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase hover:bg-slate-200 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Tem certeza que deseja excluir ${item.name}?`)) {
                          remove('inventory', item.id);
                        }
                      }}
                      className="flex-1 py-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-black uppercase hover:bg-rose-100 transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Inventory;
