import React, { useState, useMemo } from 'react';
import { Users, AlertCircle, Printer, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { useBrain } from '../context/BrainContext';

const Reports: React.FC = () => {
  const { brain } = useBrain();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Estados do Filtro de Data (Padrão: Últimos 30 dias)
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // 1. CÁLCULOS REAIS (COM FILTRO DE DATA)
  const metrics = useMemo(() => {
    // Pacientes é um retrato atual (quem está ativo hoje), não depende de data passada
    const activePatients = brain.patients.filter(p => p.status === 'active').length;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59); // Garante que pegue o dia final inteiro

    // Filtra ocorrências pela data selecionada
    const periodOccurrences = brain.occurrences.filter(o => {
      const occDate = new Date(o.created_at);
      return occDate >= start && occDate <= end;
    });

    // Filtra transações pela data selecionada
    const periodTransactions = (brain.transactions || []).filter(t => {
      const transDate = new Date(t.date);
      return transDate >= start && transDate <= end;
    });

    return { 
      activePatients, 
      occurrencesCount: periodOccurrences.length,
      transactions: periodTransactions
    };
  }, [brain.patients, brain.occurrences, brain.transactions, startDate, endDate]);

  const handlePrint = () => {
    setIsGenerating(true);
    setTimeout(() => {
      window.print();
      setIsGenerating(false);
    }, 500);
  };

  return (
    <div className="space-y-8 lg:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-1 lg:px-0">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-area, #printable-area * { visibility: visible; }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            background: white;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <header className="no-print">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-950 tracking-tight">Relatórios</h1>
        <p className="text-sm lg:text-lg text-slate-500 font-medium mt-1">Selecione o período e gere o documento oficial.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        
        {/* --- ÁREA AZUL: FILTROS (CONTROLE REMOTO) --- */}
        <div className="lg:col-span-1 space-y-8 no-print order-1">
          <div className="glass bg-white/60 p-6 lg:p-8 rounded-[32px] border border-white shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
               <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600"><Filter size={20} /></div>
               <div>
                 <h3 className="text-lg font-black text-slate-900">Filtrar Dados</h3>
                 <p className="text-[10px] text-slate-400 font-bold uppercase">Define o que aparece ao lado</p>
               </div>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Início do Período</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:border-indigo-500 outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fim do Período</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:border-indigo-500 outline-none" 
                  />
                </div>
              </div>

              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <p className="text-[10px] font-bold text-indigo-800 leading-relaxed">
                  💡 Dica: Ao mudar as datas acima, os números de ocorrências e movimentações no relatório ao lado se atualizam automaticamente.
                </p>
              </div>

              <button 
                onClick={handlePrint}
                disabled={isGenerating}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-3 mt-4"
              >
                {isGenerating ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div> : <Printer size={18} />}
                Imprimir / Salvar PDF
              </button>
            </div>
          </div>
        </div>

        {/* --- ÁREA VERDE: O PAPEL (RESULTADO) --- */}
        <div className="lg:col-span-2 order-2">
          <div className="glass bg-slate-100/50 p-2 lg:p-4 rounded-[32px] border border-white h-auto min-h-[600px] flex items-start justify-center relative overflow-hidden">
            
            {/* FOLHA A4 */}
            <div id="printable-area" className="bg-white w-full max-w-2xl min-h-[80vh] rounded-xl shadow-lg p-6 lg:p-10 flex flex-col gap-6">
              
              {/* Cabeçalho do Papel */}
              <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-xl print:bg-emerald-600">
                    {brain.organization.logo || 'V'}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{brain.organization.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Relatório Operacional</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Período</p>
                  <p className="text-xs font-black text-slate-900">
                    {new Date(startDate).toLocaleDateString('pt-BR')} até {new Date(endDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              
              <div className="space-y-8">
                
                {/* --- AQUI ESTÁ O LAYOUT CORRIGIDO (VERDE) --- */}
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 print:border print:bg-gray-50">
                   <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Indicadores Chave</h5>
                   
                   {/* Grid de 2 Colunas Limpo */}
                   <div className="grid grid-cols-2 gap-8">
                      {/* Item 1: Pacientes */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                          <Users size={18} />
                          <span className="text-[10px] font-black uppercase">Pacientes Acolhidos</span>
                        </div>
                        <p className="text-4xl font-black text-slate-900 tracking-tighter">
                          {metrics.activePatients}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400">Total ativo na unidade hoje.</p>
                      </div>

                      {/* Item 2: Riscos */}
                      <div className="flex flex-col gap-2 border-l border-slate-200 pl-8">
                        <div className="flex items-center gap-2 text-rose-600 mb-1">
                          <AlertCircle size={18} />
                          <span className="text-[10px] font-black uppercase">Ocorrências / Riscos</span>
                        </div>
                        <p className="text-4xl font-black text-slate-900 tracking-tighter">
                          {metrics.occurrencesCount}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400">Registrados no período selecionado.</p>
                      </div>
                   </div>
                </div>

                {/* Tabela de Movimentações (Filtrada pela data) */}
                <div>
                   <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Histórico de Transações do Período</h5>
                   <div className="space-y-0 border rounded-xl overflow-hidden border-slate-100">
                      {metrics.transactions.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs italic font-medium bg-slate-50">
                          Nenhuma movimentação financeira encontrada entre {new Date(startDate).toLocaleDateString('pt-BR')} e {new Date(endDate).toLocaleDateString('pt-BR')}.
                        </div>
                      ) : (
                        metrics.transactions.slice(0, 10).map((t, i) => (
                          <div key={i} className="flex justify-between items-center p-3 border-b border-slate-50 last:border-0 bg-white hover:bg-slate-50 print:break-inside-avoid">
                            <span className="text-xs font-bold text-slate-700 truncate max-w-[60%]">{t.description}</span>
                            <div className="text-right">
                               <p className={`text-xs font-black ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                 {t.type === 'income' ? '+' : '-'} {Number(t.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                               </p>
                               <p className="text-[8px] font-bold text-slate-400 uppercase">{new Date(t.date).toLocaleDateString('pt-BR')}</p>
                            </div>
                          </div>
                        ))
                      )}
                   </div>
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-slate-100 flex justify-between items-center opacity-50">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">VivaPlena SaaS</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Confidencial</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
