import React, { useState, useMemo } from 'react';
import { FileText, Plus, Search, Clock, User, Tag, Printer } from 'lucide-react';
import { useBrain, useRecords } from '../context/BrainContext';
import EmptyState from './common/EmptyState';
import { LoadingIndicator } from './common/Loading';

const DailyRecords: React.FC = () => {
  const { records } = useRecords();
  const { setQuickAction, loading } = useBrain();
  const [search, setSearch] = useState('');
  
  // ESTADO PARA IMPRESSÃO DE EVOLUÇÃO
  const [printingRecord, setPrintingRecord] = useState<any | null>(null);

  const filtered = useMemo(() => {
    if (!search) return records;
    return records.filter(r => 
      r.patient_name?.toLowerCase().includes(search.toLowerCase()) || 
      r.content.toLowerCase().includes(search.toLowerCase())
    );
  }, [records, search]);

  const handlePrint = (record: any) => {
    setPrintingRecord(record);
    setTimeout(() => {
        window.print();
        setTimeout(() => setPrintingRecord(null), 1000);
    }, 300);
  };

  if (loading) return <LoadingIndicator />;

  return (
    <div className="space-y-6 lg:space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* CSS DE IMPRESSÃO */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #record-print, #record-print * { visibility: visible; }
          #record-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            padding: 40px;
            visibility: visible !important;
            display: block !important;
            color: black;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* DOCUMENTO DE IMPRESSÃO (INVISÍVEL ATÉ CLICAR) */}
      {printingRecord && (
        <div id="record-print" className="hidden">
           <div className="text-center border-b-2 border-black pb-4 mb-6">
              <h1 className="text-xl font-bold uppercase">Registro de Evolução Clínica</h1>
           </div>
           <div className="space-y-4">
              <div className="flex justify-between">
                 <div><strong>Paciente:</strong> {printingRecord.patient_name}</div>
                 <div><strong>Data:</strong> {new Date(printingRecord.created_at).toLocaleDateString()} {new Date(printingRecord.created_at).toLocaleTimeString()}</div>
              </div>
              <div className="flex justify-between">
                 <div><strong>Profissional:</strong> {printingRecord.created_by}</div>
                 <div><strong>Categoria:</strong> {printingRecord.tags.join(', ')}</div>
              </div>
              <div className="mt-6 p-4 border border-gray-300 rounded min-h-[300px] text-justify leading-relaxed whitespace-pre-wrap">
                 {printingRecord.content}
              </div>
              <div className="mt-12 text-center border-t border-black w-1/2 mx-auto pt-2">
                 Assinatura do Profissional
              </div>
           </div>
        </div>
      )}

      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 no-print">
        <div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-950 tracking-tight">Evoluções</h1>
          <p className="text-sm lg:text-lg text-slate-500 font-medium mt-1">Protocolo diário de monitoramento clínico.</p>
        </div>
        <button 
          onClick={() => setQuickAction('new_record')}
          className="flex items-center justify-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl text-sm font-black transition-all shadow-xl shadow-blue-100"
        >
          <Plus size={20} className="stroke-[3px]" /> Novo Registro
        </button>
      </header>

      <div className="relative group no-print">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar registros ou pacientes..." 
          className="w-full pl-14 pr-6 py-4 glass-card border-white/50 rounded-2xl lg:rounded-3xl text-sm focus:outline-none focus:bg-white transition-all font-bold" 
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState 
          icon={FileText}
          title="Nenhum registro"
          description={search ? "Não encontramos registros para sua busca." : "Ainda não há evoluções cadastradas hoje."}
          action={!search ? { label: "Criar Evolução", onClick: () => setQuickAction('new_record') } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:gap-6 no-print">
          {filtered.map((record) => (
            <div key={record.id} className="glass-card bg-white/40 p-6 lg:p-8 rounded-[32px] border border-white/60 shadow-sm hover:shadow-md transition-all group">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner border border-blue-100">
                    <FileText size={22} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-black text-slate-900 leading-tight truncate">{record.patient_name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <Clock size={12} />
                        {new Date(record.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <span className="text-slate-300">•</span>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <User size={12} />
                        {record.created_by}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-wrap gap-2">
                    {record.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-white border border-slate-100 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-sm">{tag}</span>
                    ))}
                  </div>
                  {/* BOTÃO DE IMPRIMIR */}
                  <button onClick={() => handlePrint(record)} className="p-2 bg-white rounded-xl text-slate-300 hover:text-blue-600 border border-slate-100 shadow-sm transition-all opacity-0 group-hover:opacity-100">
                    <Printer size={18} />
                  </button>
                </div>
              </div>
              <div className="bg-white/60 p-5 rounded-2xl border border-white/80 text-sm lg:text-base text-slate-700 font-medium leading-relaxed italic">
                "{record.content}"
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DailyRecords;
