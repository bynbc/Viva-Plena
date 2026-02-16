import React, { useState } from 'react';
import { FileText, Search, Plus, Download, File } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import EmptyState from './common/EmptyState';

const Documents: React.FC = () => {
  const { brain, setQuickAction, remove } = useBrain(); // Added remove
  const [searchTerm, setSearchTerm] = useState('');

  // Filtra pelo título (title)
  const filteredDocs = brain.documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      await remove('documents', id);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
      {/* ... Header ... */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-md">Documentos</h2>
          <p className="text-sm font-bold text-indigo-200">Arquivos e contratos</p>
        </div>
        <button
          onClick={() => setQuickAction('new_document')}
          className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Doc
        </button>
      </div>

      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center">
        <Search className="text-slate-400 ml-3" size={20} />
        <input
          placeholder="Buscar documento..."
          className="w-full p-3 font-bold text-slate-700 outline-none bg-transparent placeholder:text-slate-300"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredDocs.length === 0 ? (
        <EmptyState title="Sem Documentos" description="Nenhum arquivo encontrado." />
      ) : (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Nome</th>
                <th className="text-left p-6 text-xs font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Tipo</th>
                <th className="text-right p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <div>
                        {/* CORRIGIDO: name -> title */}
                        <p className="font-bold text-slate-800">{doc.title}</p>
                        <p className="text-xs font-bold text-slate-400">
                          {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 hidden md:table-cell">
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-black uppercase">
                      {doc.type}
                    </span>
                  </td>
                  <td className="p-6 text-right flex items-center justify-end gap-2">
                    {/* DOWNLOAD DO CORRIGIDO: file_url */}
                    {doc.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white transition-all"
                        title="Baixar"
                      >
                        <Download size={18} />
                      </a>
                    )}

                    {/* DELETE ACTION */}
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white transition-all"
                      title="Excluir"
                    >
                      <File size={18} className="rotate-45" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Documents;
