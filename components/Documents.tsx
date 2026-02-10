import React, { useState } from 'react';
import { FileText, Download, Plus, Search, File, Trash2 } from 'lucide-react';
import { useBrain } from '../context/BrainContext';

const Documents: React.FC = () => {
  const { brain, setQuickAction, remove } = useBrain();
  const { documents, loading } = brain; // Correção aqui

  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.patient_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Documentos</h1>
          <p className="text-lg text-slate-500 font-medium">Arquivos, laudos e contratos.</p>
        </div>
        <button 
           onClick={() => setQuickAction('new_document')}
           className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-slate-800 transition-all"
        >
          <Plus size={20} />
          Upload
        </button>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar documento..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl font-medium focus:border-indigo-500 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
           <p className="col-span-full text-center text-slate-400 py-10">Carregando arquivos...</p>
        ) : filteredDocs.length === 0 ? (
           <div className="col-span-full text-center py-10 opacity-50">
              <FileText size={48} className="mx-auto mb-2 text-slate-300" />
              <p>Nenhum documento encontrado.</p>
           </div>
        ) : (
           filteredDocs.map(doc => (
             <div key={doc.id} className="bg-white p-5 rounded-[24px] border border-slate-100 flex items-start gap-4 hover:border-indigo-200 transition-all group relative">
                <div className="bg-slate-100 text-slate-500 p-3 rounded-xl shrink-0">
                   <File size={24} />
                </div>
                <div className="flex-1 min-w-0">
                   <h3 className="font-bold text-slate-800 text-sm truncate">{doc.name}</h3>
                   <p className="text-xs font-bold text-slate-400 uppercase mt-1">{doc.type}</p>
                   <p className="text-xs text-slate-500 mt-1 truncate">{doc.patient_name || 'Geral'}</p>
                   
                   <div className="flex gap-2 mt-3">
                      <a href={doc.file_data_url} download={doc.file_name} className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 flex items-center gap-1">
                         <Download size={12} /> Baixar
                      </a>
                      <button 
                        onClick={() => remove('documents', doc.id)}
                        className="text-[10px] font-black uppercase bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-100 flex items-center gap-1"
                      >
                         <Trash2 size={12} />
                      </button>
                   </div>
                </div>
             </div>
           ))
        )}
      </div>
    </div>
  );
};

export default Documents;
