import React, { useState, useMemo } from 'react';
import { FileText, Plus, Search, Clock, User, Printer } from 'lucide-react';
import { useBrain, useRecords } from '../context/BrainContext';
import EmptyState from './common/EmptyState';
import { LoadingIndicator } from './common/Loading';

const DailyRecords: React.FC = () => {
  const { records } = useRecords();
  const { setQuickAction, loading, brain } = useBrain();
  const [search, setSearch] = useState('');
  const [printData, setPrintData] = useState<any>(null);

  const filtered = useMemo(() => {
    if (!search) return records;
    return records.filter(r => r.patient_name?.toLowerCase().includes(search.toLowerCase()) || r.content.toLowerCase().includes(search.toLowerCase()));
  }, [records, search]);

  const handlePrint = (record: any) => {
    setPrintData(record);
    setTimeout(() => { window.print(); setPrintData(null); }, 300);
  };

  if (loading) return <LoadingIndicator />;

  return (
    <>
      <style>{`@media print { body * { visibility: hidden; } #record-print, #record-print * { visibility: visible; } #record-print { position: absolute; left: 0; top: 0; width: 100%; visibility: visible !important; display: block !important; } .no-print { display: none !important; } }`}</style>
      
      {printData && (
        <div id="record-print" className="hidden p-10 bg-white text-black font-serif">
           <div className="text-center border-b pb-4 mb-6"><h1 className="text-xl font-bold uppercase">{brain.organization.name}</h1><h2>Registro de Evolução Clínica</h2></div>
           <div className="space-y-2 mb-6">
              <p><strong>Paciente:</strong> {printData.patient_name}</p>
              <p><strong>Data/Hora:</strong> {new Date(printData.created_at).toLocaleString()}</p>
              <p><strong>Profissional:</strong> {printData.created_by}</p>
              <p><strong>Tipo:</strong> {printData.tags?.join(', ') || 'Geral'}</p>
           </div>
           <div className="border p-6 rounded min-h-[300px] text-justify leading-relaxed whitespace-pre-wrap">{printData.content}</div>
           <div className="mt-12 text-center pt-4 border-t w-1/2 mx-auto">Assinatura do Responsável</div>
        </div>
      )}

      <div className="space-y-6 lg:space-y-10 pb-20 no-print">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div><h1 className="text-3xl lg:text-4xl font-extrabold text-slate-950">Evoluções</h1><p className="text-sm text-slate-500 font-medium">Diário clínico.</p></div>
          <button onClick={() => setQuickAction('new_record')} className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl text-sm font-black shadow-xl"><Plus size={20}/> Novo Registro</button>
        </header>
        <div className="relative group"><Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20}/><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="w-full pl-14 pr-6 py-4 glass-card border-white/50 rounded-2xl text-sm font-bold outline-none"/></div>
        {filtered.length === 0 ? <EmptyState icon={FileText} title="Sem registros" description="Nenhuma evolução encontrada."/> : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((r) => (
              <div key={r.id} className="glass-card bg-white/40 p-6 rounded-[32px] border border-white/60 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4"><div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><FileText size={22}/></div><div><h3 className="text-lg font-black text-slate-900">{r.patient_name}</h3><div className="flex gap-3 mt-1 text-[10px] font-bold text-slate-400 uppercase"><span className="flex gap-1"><Clock size={12}/>{new Date(r.created_at).toLocaleTimeString()}</span><span className="flex gap-1"><User size={12}/>{r.created_by}</span></div></div></div>
                  <button onClick={() => handlePrint(r)} className="p-2 bg-white rounded-xl text-slate-400 hover:text-blue-600 shadow-sm border border-slate-100"><Printer size={18}/></button>
                </div>
                <div className="bg-white/60 p-5 rounded-2xl border border-white/80 text-sm text-slate-700 italic">"{r.content}"</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
export default DailyRecords;
