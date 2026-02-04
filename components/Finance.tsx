import React, { useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useBrain } from '../context/BrainContext';

const Finance: React.FC = () => {
  const { brain, setQuickAction, remove, addToast } = useBrain();
  const transactions = brain.transactions || [];

  const summary = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const handleDelete = async (id: string) => {
    if(confirm("Excluir esta transação financeira?")) {
        try {
            await remove('transactions', id);
        } catch (err) {
            console.error(err);
            addToast("Erro ao excluir.", "error");
        }
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Financeiro</h1>
          <p className="text-slate-500 font-medium">Fluxo de caixa.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={() => setQuickAction('new_income')} className="flex-1 md:flex-none bg-emerald-600 text-white px-5 py-3 rounded-2xl font-bold text-xs uppercase shadow-lg flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-95">
            <ArrowUpRight size={16} /> Entrada
          </button>
          <button onClick={() => setQuickAction('new_expense')} className="flex-1 md:flex-none bg-rose-600 text-white px-5 py-3 rounded-2xl font-bold text-xs uppercase shadow-lg flex items-center justify-center gap-2 hover:bg-rose-700 transition-all active:scale-95">
            <ArrowDownRight size={16} /> Saída
          </button>
        </div>
      </header>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card label="Entradas" value={summary.income} color="emerald" icon={TrendingUp} />
        <Card label="Saídas" value={summary.expense} color="rose" icon={TrendingDown} />
        <Card label="Saldo" value={summary.balance} color="indigo" icon={DollarSign} />
      </div>

      {/* Lista de Transações */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-black text-slate-800 text-lg">Histórico</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {transactions.length === 0 ? (
             <div className="p-10 text-center text-slate-400 font-bold text-sm">Nenhuma movimentação registrada.</div>
          ) : (
            transactions.map((t) => (
              <div key={t.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {t.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-slate-900 truncate pr-2">{t.description}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase truncate">{t.category} • {new Date(t.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 mt-2 md:mt-0">
                  <span className={`font-black text-sm md:text-base ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === 'expense' ? '- ' : '+ '}
                    {Number(t.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                  
                  {/* Botão de Excluir */}
                  <button onClick={() => handleDelete(t.id)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors bg-white border border-slate-100 md:border-none rounded-lg md:bg-transparent" title="Excluir">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const Card = ({ label, value, color, icon: Icon }: any) => (
  <div className={`bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden`}>
    <div className={`absolute top-0 right-0 p-4 opacity-10 text-${color}-600`}><Icon size={60} /></div>
    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
    <h3 className={`text-2xl font-black text-${color}-600`}>
      {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
    </h3>
  </div>
);

export default Finance;