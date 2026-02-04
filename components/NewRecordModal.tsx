
import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Search, Loader2, Tag, User as UserIcon, Plus, X } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import { useAuth } from '../context/AuthContext';
import { DailyRecord } from '../types';
import MobileModal from './common/MobileModal';

const NewRecordModal: React.FC = () => {
  const { brain, setQuickAction, push, navigate, setUI, addToast } = useBrain();
  const { user, hasPermission } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(brain.ui.selectedPatientId);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPatientListOpen, setIsPatientListOpen] = useState(false);

  const canCreate = hasPermission('records');
  const activePatients = useMemo(() => brain.patients.filter(p => p.status === 'active'), [brain.patients]);
  
  const filteredPatients = useMemo(() => {
    if (!search) return activePatients;
    return activePatients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, activePatients]);

  const selectedPatient = useMemo(() => brain.patients.find(p => p.id === selectedPatientId), [selectedPatientId, brain.patients]);

  useEffect(() => {
    if (selectedPatient) setSearch(selectedPatient.name);
  }, [selectedPatient]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate || !selectedPatientId || content.length < 5) return;

    setLoading(true);
    const newRecord: Partial<DailyRecord> = {
      id: crypto.randomUUID(),
      patient_id: selectedPatientId,
      patient_name: selectedPatient?.name || 'Desconhecido',
      content: content.trim(),
      tags,
      created_at: new Date().toISOString(),
      created_by: user?.username || 'system',
      author_role: user?.role || 'NORMAL'
    };

    try {
      await push('records', newRecord);
      addToast('Evolução registrada!', 'success');
      setQuickAction(null);
      if (selectedPatientId) {
        setUI({ selectedPatientId, activeTab: 'records' });
        navigate('patient-profile');
      } else {
        navigate('daily-records');
      }
    } catch (err) {
      addToast('Erro ao salvar registro.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex flex-col sm:flex-row gap-3">
      <button 
        type="button"
        disabled={loading}
        onClick={() => setQuickAction(null)}
        className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500"
      >
        Cancelar
      </button>
      <button 
        form="new-record-form"
        type="submit"
        disabled={loading || !selectedPatientId || content.length < 5}
        className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 ${
          loading || !selectedPatientId || content.length < 5
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Registrar Evolução'}
      </button>
    </div>
  );

  return (
    <MobileModal
      title="Nova Evolução"
      subtitle="Registro Diário"
      icon={FileText}
      iconColor="bg-blue-600"
      onClose={() => !loading && setQuickAction(null)}
      footer={footer}
    >
      <form id="new-record-form" onSubmit={handleSave} className="space-y-6">
        <div className="space-y-2 relative">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Paciente *</label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onFocus={() => setIsPatientListOpen(true)}
              onChange={(e) => { setSearch(e.target.value); setIsPatientListOpen(true); }}
              placeholder="Buscar paciente..."
              className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:bg-white"
            />
          </div>

          {isPatientListOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 max-h-60 overflow-y-auto">
              {filteredPatients.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { setSelectedPatientId(p.id); setSearch(p.name); setIsPatientListOpen(false); }}
                  className="w-full flex items-center gap-3 p-4 hover:bg-blue-50 text-left border-b border-slate-50 last:border-0"
                >
                  <UserIcon size={16} className="text-slate-400" />
                  <span className="text-sm font-bold text-slate-800">{p.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Descrição *</label>
          <textarea
            required
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Relate o estado do paciente..."
            className="w-full px-5 py-5 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-semibold focus:outline-none focus:bg-white resize-none"
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase flex items-center gap-2">
                {tag}
                <X size={12} className="cursor-pointer" onClick={() => setTags(tags.filter(t => t !== tag))} />
              </span>
            ))}
          </div>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && tagInput.trim()) {
                e.preventDefault();
                setTags([...new Set([...tags, tagInput.trim()])]);
                setTagInput('');
              }
            }}
            placeholder="Nova tag + Enter..."
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none"
          />
        </div>
      </form>
    </MobileModal>
  );
};

export default NewRecordModal;
