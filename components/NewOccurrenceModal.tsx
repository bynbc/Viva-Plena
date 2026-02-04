import React, { useState, useMemo } from 'react';
import { X, AlertCircle, Search, CheckCircle2, Loader2, ShieldAlert, User as UserIcon, Shield } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import { useAuth } from '../context/AuthContext';
import { Occurrence } from '../types';
import MobileModal from './common/MobileModal';

const NewOccurrenceModal: React.FC = () => {
  const { brain, setQuickAction, push, navigate, setUI, addToast } = useBrain();
  const { hasPermission } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(brain.ui.selectedPatientId);
  const [type, setType] = useState<string>('Comportamental');
  const [severity, setSeverity] = useState<any>('MEDIUM');
  const [description, setDescription] = useState('');
  const [isPatientListOpen, setIsPatientListOpen] = useState(false);

  const canCreate = hasPermission('occurrences');
  const activePatients = brain.patients.filter(p => p.status === 'active');

  const filteredPatients = useMemo(() => {
    if (!search) return activePatients;
    return activePatients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, activePatients]);

  const selectedPatient = useMemo(() => brain.patients.find(p => p.id === selectedPatientId), [selectedPatientId, brain.patients]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate || !selectedPatientId || !severity) return;

    setLoading(true);
    try {
      await push('occurrences', {
        patient_id: selectedPatientId,
        title: `${type}: ${selectedPatient?.name.split(' ')[0]}`,
        description: description.trim(),
        severity: severity,
        status: 'open',
        occurred_at: new Date().toISOString()
      });

      setQuickAction(null);
      if (selectedPatientId) {
        setUI({ selectedPatientId, activeTab: 'occurrences' });
        navigate('patient-profile');
      } else {
        navigate('occurrences');
      }
    } catch (err) {
      // Error handled by push wrapper
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex flex-col sm:flex-row gap-3">
      <button type="button" disabled={loading} onClick={() => setQuickAction(null)} className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500">Cancelar</button>
      <button form="new-occurrence-form" type="submit" disabled={loading || !selectedPatientId || !severity} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 ${loading || !selectedPatientId || !severity ? 'bg-slate-200 text-slate-400' : 'bg-rose-600 text-white'}`}>{loading ? <Loader2 className="animate-spin" size={20} /> : 'Registrar Ocorrência'}</button>
    </div>
  );

  return (
    <MobileModal title="Nova Ocorrência" subtitle="Incidente Operacional" icon={AlertCircle} iconColor="bg-rose-600" onClose={() => !loading && setQuickAction(null)} footer={footer}>
      <form id="new-occurrence-form" onSubmit={handleSave} className="space-y-6">
        <div className="space-y-2 relative">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Paciente Envolvido *</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" value={selectedPatient?.name || search} onFocus={() => setIsPatientListOpen(true)} onChange={(e) => { setSearch(e.target.value); setSelectedPatientId(null); setIsPatientListOpen(true); }} placeholder="Buscar paciente..." className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:bg-white" />
          </div>
          {isPatientListOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 max-h-60 overflow-y-auto">
              {filteredPatients.map(p => (
                <button key={p.id} type="button" onClick={() => { setSelectedPatientId(p.id); setSearch(p.name); setIsPatientListOpen(false); }} className="w-full flex items-center gap-3 p-4 hover:bg-rose-50 text-left border-b border-slate-50 last:border-0"><UserIcon size={16} className="text-slate-400" /><span className="text-sm font-bold text-slate-800">{p.name}</span></button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Gravidade *</label>
          <div className="grid grid-cols-4 gap-2">
            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(lv => (
              <button key={lv} type="button" onClick={() => setSeverity(lv)} className={`py-3 rounded-xl border text-[9px] font-black transition-all ${severity === lv ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>{lv}</button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Descrição</label>
          <textarea rows={6} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes do ocorrido..." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:bg-white resize-none" />
        </div>
      </form>
    </MobileModal>
  );
};

export default NewOccurrenceModal;