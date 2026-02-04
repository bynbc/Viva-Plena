import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Users, AlertCircle, Calendar, Download, Printer } from 'lucide-react';
import { useBrain } from '../context/BrainContext';

const Reports: React.FC = () => {
  const { brain } = useBrain();
  const [isGenerating, setIsGenerating] = useState(false);

  // 1. CÁLCULOS REAIS
  const metrics = useMemo(() => {
    const activePatients = brain.patients.filter(p => p.status === 'active').length;
    
    // Soma o faturamento (apenas o que foi pago)
    const totalRevenue = brain.transactions
      ? brain.transactions
          .filter(t => t.type === 'income' && t.status === 'paid')
          .reduce((acc, t) => acc + Number(t.amount), 0)
      : 0;

    const openOccurrences = brain.occurrences.filter(o => o.status === 'open').length;

    return { activePatients, totalRevenue, openOccurrences };
  }, [brain.patients, brain.transactions, brain.occurrences]);

  // 2. FUNÇÃO DE IMPRESSÃO (O Pulo do Gato)
  const handlePrint = () => {
    setIsGenerating(true);
    setTimeout(() => {
      window.print(); // Abre a janela nativa para Salvar como PDF
      setIsGenerating(false);
    }, 500);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* 3. ESTILOS DE IMPRESSÃO (CSS INVISÍVEL) */}
      <style>{`
        @media print {
          /* Esconde tudo que não for o relatório */
          body * {
            visibility: hidden;
          }
          /* Mostra só a área de impressão */
          #printable-area, #printable-area * {
            visibility: visible;
          }
          /* Posiciona a folha no topo esquerdo absoluto */
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
          /* Esconde botões flutuantes na hora do print */
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <header className="no-print">
        <h1 className="text-4xl font-extrabold text-slate-950 tracking-tight">Relatórios Gerenciais</h1>
        <p className="text-lg text-slate-500 font-medium mt-1">Visão consolidada da operação em tempo real.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* COLUNA DA ESQUERDA: CONTROLES (Escondida no PDF) */}
        <div className="lg:col-span-1 space-y-8 no-print">
          <div className="glass bg-white/60 p-8 rounded-[40px] border border-white depth-1">
            <h3 className="text-xl font-black text-slate-950 mb-8">Configurar Emissão</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tipo de Relatório</label>
                <select className="w-full px-5 py-4 glass border-white rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:bg-white appearance-none cursor-pointer">
                  <option>Fechamento Mensal (Geral)</option>
                  <option>Evolução Clínica</option>
                  <option>Incidentes e Segurança</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Período</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" placeholder="Início" className="w-full pl-10 pr-4 py-4 glass border-white rounded-2xl text-xs font-bold focus:bg-white focus:outline-none" />
                  </div>
                  <div className="flex-1 relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" placeholder="Fim" className="w-full pl-10 pr-4 py-4 glass border-white rounded-2xl text-xs font-bold focus:bg-white focus:outline-none" />
                  </div>
                </div>
              </div>

              <button 
                onClick={handlePrint}
                disabled={isGenerating}
                className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-sm interactive shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50 hover:bg-emerald-600 transition-colors"
              >
                {isGenerating ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Printer size={20} className="stroke-[3px]" />
                )}
                {isGenerating ? 'Preparando...' : 'Imprimir / Salvar PDF'}
              </button>
            </div>
          </div>
        </div>

        {/* COLUNA DA DIREITA: DOCUMENTO REAL */}
        <div className="lg:col-span-2">
          {/* Container externo (Vidro) - Não sai no print */}
          <div className="glass bg-slate-100/50 p-1 rounded-[44px] border border-white depth-1 h-[600px] flex items-center justify-center relative group overflow-hidden">
            
            {/* A "Folha A4" - ID 'printable-area' é a chave */}
            <div id="printable-area" className="bg-white w-[85%] h-[92%] rounded-xl shadow-2xl p-10 flex flex-col gap-6 transform group-hover:scale-[1.01] transition-all duration-500 overflow-y-auto">
              
              <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-black text-lg print:bg-emerald-600">V</div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Relatório Operacional</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unidade: {brain.organization.unit}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Emissão</p>
                  <p className="text-xs font-black text-slate-900">{new Date().toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Métricas */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 print:border print:bg-gray-50">
                   <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Resumo Executivo</h5>
                   <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-emerald-600">
                          <TrendingUp size={16} />
                          <span className="text-[10px] font-black uppercase">Receita Paga</span>
                        </div>
                        <p className="text-xl font-black text-slate-900">
                          {metrics.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-blue-600">
                          <Users size={16} />
                          <span className="text-[10px] font-black uppercase">Ocupação</span>
                        </div>
                        <p className="text-xl font-black text-slate-900">
                          {metrics.activePatients} <span className="text-xs text-slate-400 font-bold">Leitos</span>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-rose-600">
                          <AlertCircle size={16} />
                          <span className="text-[10px] font-black uppercase">Riscos</span>
                        </div>
                        <p className="text-xl font-black text-slate-900">
                          {metrics.openOccurrences} <span className="text-xs text-slate-400 font-bold">Abertos</span>
                        </p>
                      </div>
                   </div>
                </div>

                {/* Tabela de Transações */}
                <div>
                   <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Movimentações do Período</h5>
                   <div className="space-y-2">
                      {brain.transactions.slice(0, 10).map((t, i) => (
                        <div key={i} className="flex justify-between items-center text-xs p-3 border-b border-slate-50">
                          <span className="font-bold text-slate-700">{t.description}</span>
                          <div className="text-right">
                             <p className={`font-black ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                               {t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toLocaleString()}
                             </p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase">{t.status === 'paid' ? 'Pago' : t.status === 'pending' ? 'Pendente' : 'Atrasado'}</p>
                          </div>
                        </div>
                      ))}
                      {brain.transactions.length === 0 && (
                        <p className="text-xs text-slate-400 italic text-center py-4">Sem dados para exibir.</p>
                      )}
                   </div>
                </div>
              </div>

              <div className="mt-auto border-t-2 border-slate-100 pt-6 flex justify-between items-center opacity-60">
                <span className="text-[9px] font-black text-slate-400">VivaPlena SaaS • Documento Confidencial</span>
                <span className="text-[9px] font-black text-slate-400">Página 1</span>
              </div>
            </div>

            {/* Ações Flutuantes (Somem no Print) */}
            <div className="absolute bottom-10 flex gap-3 no-print">
              <button 
                onClick={handlePrint}
                className="p-4 bg-white rounded-2xl shadow-xl border border-slate-100 text-slate-600 hover:text-emerald-600 transition-all interactive"
                title="Salvar como PDF"
              >
                <Download size={20} />
              </button>
              <button 
                onClick={handlePrint}
                className="p-4 bg-white rounded-2xl shadow-xl border border-slate-100 text-slate-600 hover:text-emerald-600 transition-all interactive"
                title="Imprimir"
              >
                <Printer size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;