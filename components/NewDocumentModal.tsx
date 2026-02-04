import React, { useState, useMemo, useRef } from 'react';
import { Files, Search, Loader2, Upload, File, AlertCircle, Trash2 } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import { useAuth } from '../context/AuthContext';
import MobileModal from './common/MobileModal';

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

const NewDocumentModal: React.FC = () => {
  const { brain, setQuickAction, push, navigate, setUI, addToast } = useBrain();
  const { hasPermission } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<string>('Relatório');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(brain.ui.selectedPatientId);
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');
  const [isPatientListOpen, setIsPatientListOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);

  const canCreate = hasPermission('documents');
  const activePatients = brain.patients.filter(p => p.status === 'active');
  const filteredPatients = useMemo(() => {
    if (!search) return activePatients;
    return activePatients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, activePatients]);

  const selectedPatient = useMemo(() => brain.patients.find(p => p.id === selectedPatientId), [selectedPatientId, brain.patients]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      addToast(`Arquivo muito grande. Limite 3MB.`, "warning");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    if (!name) setName(selectedFile.name.split('.')[0]);

    const reader = new FileReader();
    reader.onload = (event) => setFileDataUrl(event.target?.result as string);
    reader.readAsDataURL(selectedFile);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate || !file || !fileDataUrl || name.length < 2) return;

    setLoading(true);
    try {
      await push('documents', {
        name: name.trim(),
        type,
        patient_id: selectedPatientId || null,
        notes: notes.trim() || null,
        file_name: file.name,
        file_mime: file.type,
        file_size: file.size,
        file_data_url: fileDataUrl
      });

      setQuickAction(null);
      if (selectedPatientId) {
        setUI({ selectedPatientId, activeTab: 'documents' });
        navigate('patient-profile');
      } else {
        navigate('documents');
      }
    } catch (err) {
      // Handled by push wrapper
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex flex-col sm:flex-row gap-3">
      <button type="button" disabled={loading} onClick={() => setQuickAction(null)} className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500">Cancelar</button>
      <button form="new-document-form" type="submit" disabled={loading || !file || name.length < 2} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 ${loading || !file || name.length < 2 ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 text-white'}`}>{loading ? <Loader2 className="animate-spin" size={20} /> : 'Salvar Documento'}</button>
    </div>
  );

  return (
    <MobileModal title="Anexar Documento" subtitle="Gestão de Arquivos" icon={Files} iconColor="bg-indigo-600" onClose={() => !loading && setQuickAction(null)} footer={footer}>
      <form id="new-document-form" onSubmit={handleSave} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Arquivo *</label>
          {!file ? (
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-all">
              <Upload className="text-slate-300" size={32} />
              <p className="text-xs font-bold text-slate-400">PDF ou Imagem (Max 3MB)</p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
              <div className="flex items-center gap-3"><File className="text-indigo-600" size={20} /><span className="text-xs font-bold text-indigo-900 truncate max-w-[150px]">{file.name}</span></div>
              <button type="button" onClick={() => setFile(null)} className="p-1 hover:bg-indigo-100 rounded-lg text-indigo-400"><Trash2 size={16} /></button>
            </div>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" className="hidden" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Nome *</label>
            <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold">
              {['Relatório', 'Laudo', 'Contrato', 'Identidade', 'Outro'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2 relative">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Vincular Paciente</label>
          <input type="text" value={selectedPatient?.name || search} onFocus={() => setIsPatientListOpen(true)} onChange={(e) => { setSearch(e.target.value); setSelectedPatientId(null); setIsPatientListOpen(true); }} placeholder="Buscar paciente..." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" />
          {isPatientListOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 max-h-40 overflow-y-auto">
              {filteredPatients.map(p => (
                <button key={p.id} type="button" onClick={() => { setSelectedPatientId(p.id); setSearch(p.name); setIsPatientListOpen(false); }} className="w-full p-4 hover:bg-slate-50 text-left border-b border-slate-50 last:border-0 text-sm font-bold">{p.name}</button>
              ))}
            </div>
          )}
        </div>
      </form>
    </MobileModal>
  );
};

export default NewDocumentModal;