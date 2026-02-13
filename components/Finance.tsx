import React, { useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Trash2, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
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
    if (confirm("Excluir esta transação financeira?")) {
      try {
        await remove('transactions', id);
      } catch (err) {
        console.error(err);
        addToast("Erro ao excluir.", "error");
      }
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">Financeiro</h1>
          <p className="text-indigo-200 font-medium mt-1">Fluxo de caixa e movimentações.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={() => setQuickAction('new_income')} className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 border border-emerald-400/20">
            <ArrowUpRight size={16} /> Entrada
          </button>
          <button onClick={() => setQuickAction('new_expense')} className="flex-1 md:flex-none bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 border border-rose-400/20">
            <ArrowDownRight size={16} /> Saída
          </button>
        </div>
      </header>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard label="Entradas" value={summary.income} color="emerald" icon={TrendingUp} />
        <GlassCard label="Saídas" value={summary.expense} color="rose" icon={TrendingDown} />
        <GlassCard label="Saldo Total" value={summary.balance} color="indigo" icon={Wallet} />
      </div>

      {/* Lista de Transações */}
      <div className="glass rounded-[32px] border border-white/10 shadow-xl overflow-hidden bg-white/5">
        <div className="p-8 border-b border-white/10 flex justify-between items-center">
          <h3 className="font-black text-white text-lg">Histórico de Transações</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg border border-white/5">
            {transactions.length} Registros
          </span>
        </div>

        <div className="divide-y divide-white/5">
          {transactions.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center gap-4 opacity-50">
              <Wallet size={48} className="text-indigo-300" />
              <p className="text-indigo-200 font-bold text-sm">Nenhuma movimentação registrada.</p>
            </div>
          ) : (
            transactions.map((t) => (
              <div key={t.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-5 min-w-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${t.type === 'income'
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/20'
                      : 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-rose-500/20'
                    }`}>
                    {t.type === 'income' ? <ArrowUpRight size={20} strokeWidth={3} /> : <ArrowDownRight size={20} strokeWidth={3} />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-white text-lg truncate pr-2 leading-tight group-hover:text-indigo-200 transition-colors">{t.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wide bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                        {t.category}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {new Date(t.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-4 md:pt-0 mt-2 md:mt-0">
                  <span className={`font-black text-xl tracking-tight ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {t.type === 'expense' ? '- ' : '+ '}
                    {Number(t.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>

                  {/* Botão de Excluir */}
                  <button onClick={() => handleDelete(t.id)} className="p-2.5 text-slate-500 hover:text-white hover:bg-rose-500 rounded-xl transition-all opacity-0 group-hover:opacity-100" title="Excluir">
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

const GlassCard = ({ label, value, color, icon: Icon }: any) => {
  const colorStyles: any = {
    emerald: "from-emerald-500 to-teal-500",
    rose: "from-rose-500 to-pink-500",
    indigo: "from-indigo-500 to-violet-500"
  };

  const textStyles: any = {
    emerald: "text-emerald-400",
    rose: "text-rose-400",
    indigo: "text-indigo-400"
  };

  return (
    <div className="glass p-6 rounded-[32px] border border-white/10 relative overflow-hidden group hover:border-white/20 transition-all bg-white/5">
      <div className={`absolute -right-4 -top-4 p-8 opacity-10 bg-gradient-to-br ${colorStyles[color]} blur-2xl rounded-full w-32 h-32 group-hover:opacity-20 transition-opacity`}></div>
      <div className={`absolute top-6 right-6 opacity-20 text-white`}><Icon size={40} /></div>

      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${colorStyles[color]}`}></div>
        {label}
      </p>
      <h3 className={`text-3xl font-black text-white tracking-tight drop-shadow-sm`}>
        {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </h3>
    </div>
  );
};

export default Finance;