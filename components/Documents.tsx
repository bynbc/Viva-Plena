import React, { useMemo, useState } from 'react';
import { Files, Search, Filter, Plus, File, Download, Trash2, User, Clock, Eye, ChevronRight } from 'lucide-react';
import { useBrain, usePatients } from '../context/BrainContext';
import { DocumentRecord } from '../types';
import EmptyState from './common/EmptyState';

const Documents: React.FC = () => {
  const { brain, setQuickAction, remove } = useBrain();
  const { patients } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  
  const documents = brain.documents || [];

  const filteredDocs = useMemo(() => {
    if (!searchTerm) return documents;
    return documents.filter(doc => 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      doc.patient_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, documents]);

  const handleView = (doc: DocumentRecord) => {
    const win = window.open();
    if (win) {
      win.document.write(`<iframe src="${doc.file_data_url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      win.document.title = doc.name;
    }
  };

  const handleDownload = (doc: DocumentRecord) => {
    const link = window.document.createElement('a');
    link.href = doc.file_data_url;
    link.download = doc.file_name;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const handleDelete = async (doc: DocumentRecord) => {
    if (confirm(`Tem certeza que deseja remover o documento "${doc.name}"?`)) {
      try {
        await remove('documents', doc.id);
      } catch (err) {
        console.error("Delete doc error:", err);
      }
    }
  };

  return (
    <div className="space-y-8 lg:space-y-12 animate-in fade-in duration-700 relative pb-20 max-w-full overflow-hidden px-1 lg:px-0">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="min-w-0">
          <h1 className="text-3xl lg:text-5xl font-black text-slate-950 tracking-tighter text-glow">Arquivos</h1>
          <p className="text-sm lg:text-xl text-slate-500 font-medium mt-1 truncate">Gestão documental centralizada.</p>
        </div>
        <button 
          onClick={() => setQuickAction('new_document')} 
          className="flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-[24px] text-sm font-black shadow-xl w-full sm:w-auto transition-all hover:scale-[1.02]"
        >
          <Plus size={24} className="stroke-[3.5px]" />
          ANEXAR DOCUMENTO
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group min-w-0">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar nome ou paciente..." 
            className="w-full pl-16 pr-8 py-4 lg:py-5 glass-card border-white/50 rounded-[24px] lg:rounded-[32px] text-sm font-bold focus:outline-none focus:bg-white transition-all shadow-sm"
          />
        </div>
        <button className="h-14 lg:h-16 px-6 glass border-white/60 rounded-[24px] lg:rounded-[32px] flex items-center justify-center gap-3 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-white/60 transition-all shrink-0">
          <Filter size={18} /> Filtrar
        </button>
      </div>

      {filteredDocs.length === 0 ? (
        <EmptyState 
          icon={Files}
          title="Nenhum arquivo"
          description={searchTerm ? "Nenhum documento atende aos critérios de busca." : "Ainda não foram anexados documentos para esta unidade."}
          action={!searchTerm ? { label: "Anexar Primeiro", onClick: () => setQuickAction('new_document') } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="group glass-card bg-white/40 hover:bg-white/60 p-6 lg:p-8 rounded-[32px] lg:rounded-[48px] border-white/50 shadow-sm transition-all flex flex-col gap-6 relative overflow-hidden min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="w-14 h-14 bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                  <File size={28} />
                </div>
                <div className="flex gap-1.5 shrink-0 relative z-10">
                  <button onClick={() => handleView(doc)} className="p-3 bg-white/50 hover:bg-white text-slate-500 hover:text-indigo-600 rounded-xl transition-all shadow-sm"><Eye size={18} /></button>
                  <button onClick={() => handleDownload(doc)} className="p-3 bg-white/50 hover:bg-white text-slate-500 hover:text-emerald-600 rounded-xl transition-all shadow-sm"><Download size={18} /></button>
                  <button onClick={() => handleDelete(doc)} className="p-3 bg-white/50 hover:bg-rose-50 text-slate-300 hover:text-rose-600 rounded-xl transition-all shadow-sm"><Trash2 size={18} /></button>
                </div>
              </div>

              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[8px] font-black uppercase rounded-lg border border-indigo-200">{doc.type}</span>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{(doc.file_size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <h3 className="text-lg lg:text-xl font-black text-slate-950 leading-tight truncate tracking-tight group-hover:text-indigo-800 transition-colors">
                  {doc.name}
                </h3>
              </div>

              <div className="mt-auto pt-4 border-t border-white/20 space-y-3">
                {doc.patient_name && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                      <User size={12} />
                    </div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate">{doc.patient_name}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    <Clock size={12} />
                    {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[80px]">Por {doc.created_by}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Documents;