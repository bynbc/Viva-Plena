import React, { useState } from 'react';
import { Book, Plus, Search, Calendar, User, Clock, FileText } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import MobileModal from './common/MobileModal';
import NewRecordModal from './NewRecordModal';

const DailyRecords: React.FC = () => {
  const { brain, setQuickAction } = useBrain(); // Mudança aqui
  const { records, loading } = brain; // Mudança aqui
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredRecords = records.filter(record => 
    record.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.patient_name?.toLowerCase().includes(searchTerm.toLowerCase())
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

      {/* LISTA */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-slate-400 py-10">Carregando diário...</p>
