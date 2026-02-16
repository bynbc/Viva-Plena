import React, { useMemo, useState } from 'react';
import { Plus, Search, Calendar, User, Pencil, Trash2, CheckCircle2, Save, X } from 'lucide-react';
import { useBrain } from '../context/BrainContext';

const Occurrences: React.FC = () => {
  const { brain, setQuickAction, update, remove, addToast } = useBrain();
  const { occurrences, loading } = brain;

  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', severity: 'MEDIUM' });

  const filteredOccurrences = useMemo(
    () =>
      occurrences.filter((occ) =>
        [occ.title, occ.description, occ.patient_name, occ.severity]
          .filter(Boolean)
          .some((text) => String(text).toLowerCase().includes(searchTerm.toLowerCase()))
      ),
    [occurrences, searchTerm]
  );

  const startEdit = (occ: any) => {
    setEditingId(occ.id);
    setForm({ title: occ.title || '', description: occ.description || '', severity: occ.severity || 'MEDIUM' });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    if (!form.title.trim() || !form.description.trim()) return addToast('Título e descrição são obrigatórios.', 'warning');

    try {
      await update('occurrences', editingId, {
        title: form.title,
        description: form.description,
        severity: form.severity,
      });
      addToast('Ocorrência atualizada.', 'success');
      setEditingId(null);
    } catch (err: any) {
      addToast(`Erro ao atualizar: ${err.message || 'Falha desconhecida'}`, 'error');
    }
  };

  const handleToggleResolved = async (occ: any) => {
    try {
      await update('occurrences', occ.id, {
        status: occ.status === 'resolved' ? 'open' : 'resolved',
      });
      addToast('Status atualizado.', 'success');
    } catch (err: any) {
      addToast(`Erro ao atualizar status: ${err.message || 'Falha desconhecida'}`, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta ocorrência?')) return;
    try {
      await remove('occurrences', id);
      addToast('Ocorrência excluída.', 'success');
    } catch (err: any) {
      addToast(`Erro ao excluir: ${err.message || 'Falha desconhecida'}`, 'error');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ocorrências</h1>
          <p className="text-lg text-slate-500 font-medium">Gestão de eventos adversos e disciplinares.</p>
        </div>
        <button
          onClick={() => setQuickAction('new_occurrence')}
          className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-rose-200 transition-all"
        >
          <Plus size={20} />
          Nova Ocorrência
        </button>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Buscar ocorrência..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-2xl font-medium focus:border-indigo-500 outline-none"
        />
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-slate-400">Carregando...</p>
        ) : filteredOccurrences.length === 0 ? (
          <p className="text-center text-slate-400 py-8">Nenhuma ocorrência encontrada.</p>
        ) : (
          filteredOccurrences.map((occ) => (
            <div key={occ.id} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden">
              <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                occ.severity === 'CRITICAL' || occ.severity === 'Crítica' ? 'bg-rose-500' : 'bg-amber-400'
              }`} />

              <div className="pl-4 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    {editingId === occ.id ? (
                      <input
                        value={form.title}
                        onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                        className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-bold"
                      />
                    ) : (
                      <h3 className="font-bold text-slate-800 text-lg">{occ.title}</h3>
                    )}
                  </div>

                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    occ.status === 'resolved' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {occ.status === 'resolved' ? 'Resolvido' : 'Em Aberto'}
                  </span>
                </div>

                {editingId === occ.id ? (
                  <>
                    <select
                      value={form.severity}
                      onChange={(e) => setForm((prev) => ({ ...prev, severity: e.target.value }))}
                      className="w-full p-2 border border-slate-200 rounded-lg text-slate-700 font-bold"
                    >
                      <option value="LOW">Leve</option>
                      <option value="MEDIUM">Média</option>
                      <option value="HIGH">Grave</option>
                      <option value="CRITICAL">Crítica</option>
                    </select>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                      className="w-full min-h-24 p-3 border border-slate-200 rounded-lg text-slate-700"
                    />
                  </>
                ) : (
                  <p className="text-slate-600">{occ.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
                  <div className="flex items-center gap-1"><User size={14} /> {occ.patient_name || 'Sem vínculo'}</div>
                  <div className="flex items-center gap-1"><Calendar size={14} /> {new Date(occ.created_at).toLocaleDateString()}</div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  {editingId === occ.id ? (
                    <>
                      <button onClick={() => setEditingId(null)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"><X size={16} /></button>
                      <button onClick={handleSaveEdit} className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50"><Save size={16} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleToggleResolved(occ)} className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50" title="Alternar resolvido">
                        <CheckCircle2 size={16} />
                      </button>
                      <button onClick={() => startEdit(occ)} className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(occ.id)} className="p-2 rounded-lg text-rose-600 hover:bg-rose-50"><Trash2 size={16} /></button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Occurrences;
