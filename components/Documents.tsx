import React, { useMemo, useState } from 'react';
import { FileText, Search, Plus, Download, Pencil, Trash2, Save, X } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import EmptyState from './common/EmptyState';

const Documents: React.FC = () => {
  const { brain, setQuickAction, update, remove, addToast } = useBrain();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState('Exame');

  const filteredDocs = useMemo(() => brain.documents.filter((doc) =>
    [doc.title, doc.type].filter(Boolean).some((f) => String(f).toLowerCase().includes(searchTerm.toLowerCase()))
  ), [brain.documents, searchTerm]);

  const startEdit = (doc: any) => {
    setEditingId(doc.id);
    setEditTitle(doc.title || '');
    setEditType(doc.type || 'Outros');
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    if (!editTitle.trim()) return addToast('Título é obrigatório.', 'warning');

    try {
      await update('documents', editingId, { title: editTitle, type: editType });
      addToast('Documento atualizado.', 'success');
      setEditingId(null);
    } catch (err: any) {
      addToast(`Erro ao atualizar documento: ${err.message || 'Falha desconhecida'}`, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir documento?')) return;
    try {
      await remove('documents', id);
      addToast('Documento excluído.', 'success');
    } catch (err: any) {
      addToast(`Erro ao excluir documento: ${err.message || 'Falha desconhecida'}`, 'error');
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Documentos</h2>
          <p className="text-sm font-bold text-slate-400">Arquivos e contratos</p>
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
          onChange={(e) => setSearchTerm(e.target.value)}
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
                <th className="text-right p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        {editingId === doc.id ? (
                          <input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 font-bold"
                          />
                        ) : (
                          <p className="font-bold text-slate-800 truncate">{doc.title}</p>
                        )}
                        <p className="text-xs font-bold text-slate-400">
                          {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 hidden md:table-cell">
                    {editingId === doc.id ? (
                      <select value={editType} onChange={(e) => setEditType(e.target.value)} className="border border-slate-200 rounded-lg p-2 text-slate-700 font-bold">
                        <option>Exame</option>
                        <option>Contrato</option>
                        <option>Laudo</option>
                        <option>Documento Pessoal</option>
                        <option>Outros</option>
                      </select>
                    ) : (
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-black uppercase">
                        {doc.type}
                      </span>
                    )}
                  </td>
                  <td className="p-6">
                    <div className="flex justify-end items-center gap-2">
                      {doc.file_url && (
                        <a href={doc.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white transition-all">
                          <Download size={18} />
                        </a>
                      )}

                      {editingId === doc.id ? (
                        <>
                          <button onClick={() => setEditingId(null)} className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"><X size={16} /></button>
                          <button onClick={handleSaveEdit} className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white"><Save size={16} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(doc)} className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"><Pencil size={16} /></button>
                          <button onClick={() => handleDelete(doc.id)} className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={16} /></button>
                        </>
                      )}
                    </div>
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
