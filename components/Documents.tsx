import React, { useState, useMemo } from 'react';
import { Files, UploadCloud, Search, FileText, Eye, Trash2, Filter, Check } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import { LoadingIndicator } from './common/Loading';
import EmptyState from './common/EmptyState';

const Documents: React.FC = () => {
  const { brain, setQuickAction, remove, loading } = useBrain();
  const [search, setSearch] = useState('');
  
  // ESTADOS DO FILTRO
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('todos'); // 'todos', 'Laudo', 'Receita', 'Contrato', 'Exame'

  const documents = brain.documents || [];

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      // 1. Filtro de Texto
      const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) || 
                            doc.patient_name?.toLowerCase().includes(search.toLowerCase());
      
      // 2. Filtro de Tipo
      const matchesType = filterType === 'todos' ? true : 
                          doc.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [documents, search, filterType]);

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      await remove('documents', id);
    }
  };

  const handleView = (doc: any) => {
    const win = window.open();
    if (win) {
       win.document.write(`<iframe src="${doc.file_data_url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
       win.document.title = doc.name;
    }
  };

  if (loading) return <LoadingIndicator />;

  return (
    <div className="space-y-8 lg:space-y-12 animate-in fade-in duration-700 px-1 lg:px-0 pb-20" onClick={() => setIsFilterOpen(false)}>
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-5xl font-black text-slate-950 tracking-tighter text-glow">Documentos</h1>
          <p className="text-sm lg:text-xl text-slate-500 font-medium mt-1">Gestão de arquivos e prontuários digitais.</p>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); setQuickAction('new_document'); }} 
          className="flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-[24px] text-sm font-black shadow-xl w-full sm:w-auto hover:scale-[1.02] transition-all"
        >
          <UploadCloud size={20} className="stroke-[3.5px]" /> UPLOAD
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-4 relative z-20">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou paciente..." 
            className="w-full pl-14 pr-6 py-4 glass-card border-white/50 rounded-[24px] text-sm font-bold focus:outline-none focus:bg-white shadow-sm" 
          />
        </div>

        {/* BOTÃO DE FILTRO FUNCIONAL */}
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsFilterOpen(!isFilterOpen); }}
            className={`h-14 px-6 border rounded-[24px] flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all shrink-0 ${
              filterType !== 'todos' || isFilterOpen ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'glass border-white/60 text-slate-500 hover:bg-white/60'
            }`}
          >
            <Filter size={18} /> {filterType === 'todos' ? 'Filtrar' : filterType}
          </button>

          {/* MENU DROPDOWN */}
          {isFilterOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-2 space-y-1">
                {['todos', 'Laudo', 'Receita', 'Exame', 'Contrato', 'Outros'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase flex justify-between items-center ${
                      filterType === type ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {type}
                    {filterType === type && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {filteredDocs.length === 0 ? (
        <EmptyState 
          icon={Files}
          title="Nenhum documento"
          description={search || filterType !== 'todos' ? "Nada encontrado para esses filtros." : "O repositório de arquivos está vazio."}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="glass-card bg-white/40 hover:bg-white p-6 rounded-[32px] border-white/60 shadow-sm transition-all group relative overflow-hidden">
               <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                    <FileText size={24} />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleView(doc)} className="p-2 bg-white text-slate-400 hover:text-indigo-600 rounded-xl shadow-sm"><Eye size={18} /></button>
                    <button onClick={() => handleDelete(doc.id)} className="p-2 bg-white text-slate-400 hover:text-rose-600 rounded-xl shadow-sm"><Trash2 size={18} /></button>
                  </div>
               </div>
               
               <h3 className="text-lg font-black text-slate-900 leading-tight truncate mb-1" title={doc.name}>{doc.name}</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{doc.type}</p>
               
               {doc.patient_name && (
                 <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-[10px] font-bold">
                      {doc.patient_name[0]}
                    </div>
                    <span className="text-xs font-bold text-slate-600 truncate">{doc.patient_name}</span>
                 </div>
               )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Documents;
