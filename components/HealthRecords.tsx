import React, { useMemo, useState } from 'react';
import { Activity, Search, User, Plus, Save, Pencil, Trash2, X } from 'lucide-react';
import { useBrain } from '../context/BrainContext';

const HealthRecords: React.FC = () => {
  const { brain, push, update, remove, addToast } = useBrain();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [isAdding, setIsAdding] = useState(false);
  const [newRecordType, setNewRecordType] = useState('Evolução de Enfermagem');
  const [newRecordContent, setNewRecordContent] = useState('');
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const activePatients = brain.patients.filter((p) => p.status === 'active');
  const filteredPatients = activePatients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const selectedPatient = brain.patients.find((p) => p.id === selectedPatientId);

  const patientRecords = useMemo(
    () =>
      brain.healthRecords
        .filter((r) => r.patient_id === selectedPatientId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [brain.healthRecords, selectedPatientId]
  );

  const handleSaveRecord = async () => {
    if (!newRecordContent.trim()) return addToast('Escreva algo na evolução.', 'warning');
    if (!selectedPatientId) return;

    try {
      await push('health_records', {
        clinic_id: brain.session.clinicId,
        patient_id: selectedPatientId,
        type: newRecordType,
        content: newRecordContent,
        professional_name: brain.session.user?.username || 'Profissional',
        created_at: new Date().toISOString(),
      });

      addToast('Evolução registrada com sucesso!', 'success');
      setIsAdding(false);
      setNewRecordContent('');
    } catch (err: any) {
      addToast(`Erro ao salvar: ${err.message || 'Falha desconhecida'}`, 'error');
    }
  };

  const startEdit = (recordId: string, content: string) => {
    setEditingRecordId(recordId);
    setEditingContent(content);
  };

  const handleUpdateRecord = async () => {
    if (!editingRecordId) return;
    if (!editingContent.trim()) return addToast('O conteúdo não pode ficar vazio.', 'warning');

    try {
      await update('health_records', editingRecordId, {
        content: editingContent,
      });
      addToast('Prontuário atualizado!', 'success');
      setEditingRecordId(null);
      setEditingContent('');
    } catch (err: any) {
      addToast(`Erro ao atualizar: ${err.message || 'Falha desconhecida'}`, 'error');
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('Excluir este registro clínico?')) return;
    try {
      await remove('health_records', recordId);
      addToast('Registro excluído.', 'success');
    } catch (err: any) {
      addToast(`Erro ao excluir: ${err.message || 'Falha desconhecida'}`, 'error');
    }
  };

  return (
    <div className="space-y-6 pb-20 md:h-[calc(100vh-100px)] h-auto flex flex-col md:flex-row gap-6 animate-in fade-in">
      <div className="w-full md:w-80 flex flex-col gap-4 md:h-full h-auto">
        <div className="glass-card p-4 rounded-[24px] md:h-full h-auto flex flex-col">
          <h2 className="text-lg font-black text-slate-800 mb-2">Prontuários</h2>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              placeholder="Buscar Paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/50 rounded-xl text-sm font-bold outline-none border border-white/50 focus:border-pink-500 focus:bg-white transition-all shadow-sm"
            />
          </div>
          <div className="space-y-2 md:overflow-y-auto overflow-visible flex-1 custom-scrollbar max-h-[300px] md:max-h-none">
            {filteredPatients.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPatientId(p.id)}
                className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                  selectedPatientId === p.id
                    ? 'bg-pink-600 text-white shadow-pink-200 shadow-lg'
                    : 'bg-white/40 text-slate-600 hover:bg-white/80 border border-white/50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${selectedPatientId === p.id ? 'bg-white/20' : 'bg-slate-200'}`}>
                  {p.name.substring(0, 2)}
                </div>
                <span className="text-sm font-bold truncate">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 glass-card rounded-[32px] p-4 md:p-8 md:overflow-y-auto overflow-visible relative min-h-[500px]">
        {!selectedPatient ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
            <Activity size={64} className="mb-4 text-slate-400" />
            <p className="text-xl font-black text-slate-400 text-center px-4">Selecione um paciente para ver o prontuário</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200/50 pb-6 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden">
                  {selectedPatient.photo_url ? (
                    <img src={selectedPatient.photo_url} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-full h-full p-4 text-slate-300" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900">{selectedPatient.name}</h1>
                  <p className="text-slate-500 font-bold text-sm">Registro clínico e evolução</p>
                </div>
              </div>

              <button
                onClick={() => setIsAdding((v) => !v)}
                className="px-5 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2"
              >
                <Plus size={16} /> Nova Evolução
              </button>
            </div>

            {isAdding && (
              <div className="bg-white/50 rounded-2xl border border-slate-200 p-4 space-y-3">
                <select
                  value={newRecordType}
                  onChange={(e) => setNewRecordType(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-slate-200 font-bold text-slate-800"
                >
                  <option>Evolução de Enfermagem</option>
                  <option>Evolução Médica</option>
                  <option>Evolução Psicológica</option>
                  <option>Observação Geral</option>
                </select>
                <textarea
                  value={newRecordContent}
                  onChange={(e) => setNewRecordContent(e.target.value)}
                  className="w-full min-h-32 p-3 rounded-xl bg-white border border-slate-200 text-slate-800 outline-none"
                  placeholder="Descreva a evolução..."
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setIsAdding(false)} className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold">Cancelar</button>
                  <button onClick={handleSaveRecord} className="px-4 py-2 rounded-xl bg-pink-600 text-white font-bold flex items-center gap-2"><Save size={14} />Salvar</button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {patientRecords.length === 0 ? (
                <p className="text-slate-400 font-bold text-center py-10">Sem evoluções registradas.</p>
              ) : (
                patientRecords.map((record) => (
                  <div key={record.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="text-xs font-black uppercase text-pink-600">{record.type || 'Evolução'}</p>
                        <p className="text-[11px] font-bold text-slate-400">
                          {new Date(record.created_at).toLocaleString('pt-BR')} • {record.professional_name || 'Profissional'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEdit(record.id, record.content)} className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"><Pencil size={16} /></button>
                        <button onClick={() => handleDeleteRecord(record.id)} className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"><Trash2 size={16} /></button>
                      </div>
                    </div>

                    {editingRecordId === record.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="w-full min-h-28 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 outline-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingRecordId(null)} className="px-3 py-2 rounded-lg bg-white border border-slate-200 font-bold text-slate-600 flex items-center gap-1"><X size={14} />Cancelar</button>
                          <button onClick={handleUpdateRecord} className="px-3 py-2 rounded-lg bg-indigo-600 text-white font-bold flex items-center gap-1"><Save size={14} />Atualizar</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-700 whitespace-pre-wrap">{record.content}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthRecords;
