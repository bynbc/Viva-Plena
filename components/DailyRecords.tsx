import React, { useState } from 'react';
import { Book, Plus, Search, Calendar, User, Clock, FileText } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import MobileModal from './common/MobileModal';
import NewRecordModal from './NewRecordModal';

const DailyRecords: React.FC = () => {
  const { brain, setQuickAction } = useBrain();
  const { records, loading } = brain;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Garante que é um array para não quebrar o .filter
  const safeRecords = records || [];

  const filteredRecords = safeRecords.filter(record => 
    (record.content && record.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (record.patient_name && record.patient_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Diário de Plantão</h1>
          <p className="text-lg text-slate-500 font-medium">Registro geral de ocorrências diárias.</p>
        </div>
        <button 
          onClick={() => setQuickAction('new_record')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all"
        >
          <Plus size={20} />
          Novo Registro
        </button>
      </header>

      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar no diário..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl font-medium focus:border-indigo-500 outline-none transition-all"
        />
      </div>

      {/* LISTA DE REGISTROS */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-slate-400 py-10">Carregando diário...</p>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-10 opacity-50">
             <Book size={48} className="mx-auto mb-2" />
             <p>Sem registros encontrados.</p>
          </div>
        ) : (
          filteredRecords.map(record => (
            <div key={record.id} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:border-indigo-200 transition-all">
               <div className="flex items-center gap-3 mb-3">
                 <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl">
                   <User size={16} />
                 </div>
                 <span className="font-bold text-slate-700">{record.patient_name || 'Geral'}</span>
                 <div className="ml-auto flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-lg">
                    <Calendar size={12} />
                    {new Date(record.created_at).toLocaleDateString('pt-BR')}
                    <Clock size={12} className="ml-2" />
                    {new Date(record.created_at).toLocaleTimeString('pt-BR').substring(0,5)}
                 </div>
               </div>
               <p className="text-slate-600 leading-relaxed pl-1">{record.content}</p>
               <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase text-slate-300">
                  <FileText size={12} />
                  Registrado por: {record.created_by}
               </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && <NewRecordModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default DailyRecords;
