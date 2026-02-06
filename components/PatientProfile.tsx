import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, MapPin, Heart, FileText, AlertCircle, Files, Edit2, 
  Printer, Pill, Wallet, Clock, User as UserIcon, Eye, Download, File, 
  Trash2, CheckCircle2, AlertTriangle, UploadCloud, Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useBrain } from '../context/BrainContext';
import { DocumentRecord, Occurrence } from '../types';

interface PatientProfileProps {
  patientId: string;
  onBack: () => void;
}

type Tab = 'summary' | 'medication' | 'finance' | 'records' | 'occurrences' | 'documents';

const PatientProfile: React.FC<PatientProfileProps> = ({ patientId, onBack }) => {
  const { brain, setUI, remove, update, addToast, push } = useBrain();
  const patient = brain.patients.find(p => p.id === patientId);
  const records = brain.records.filter(r => r.patient_id === patientId);
  const occurrences = brain.occurrences.filter(o => o.patient_id === patientId);
  const documents = (brain.documents || []).filter(d => d.patient_id === patientId);
  const medications = (brain.medications || []).filter(m => m.patient_id === patientId).sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));

  const [activeTab, setActiveTab] = useState<Tab>((brain.ui.activeTab as Tab) || 'summary');
  const [printingOccurrence, setPrintingOccurrence] = useState<Occurrence | null>(null);
  
  // UPLOAD STATES
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (brain.ui.activeTab && brain.ui.activeTab !== activeTab) {
      setActiveTab(brain.ui.activeTab as Tab);
    }
  }, [brain.ui.activeTab]);

  const handleTabChange = (tabId: Tab) => {
    setActiveTab(tabId);
    setUI({ activeTab: tabId });
  };

  // --- FUNÇÕES DE UPLOAD DE DOCUMENTO (NOVO) ---
  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return addToast('Arquivo muito grande (Max 10MB)', 'warning');

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
        try {
            await push('documents', {
                id: crypto.randomUUID(),
                patient_id: patientId,
                patient_name: patient?.name,
                name: file.name,
                type: 'Outros', // Pode melhorar isso depois se quiser
                file_data_url: reader.result as string,
                file_name: file.name,
                file_type: file.type,
                file_size: file.size
            });
            addToast('Documento anexado com sucesso!', 'success');
        } catch (err) {
            addToast('Erro ao enviar documento.', 'error');
        } finally {
            setUploading(false);
        }
    };
    reader.readAsDataURL(file);
  };

  // --- FUNÇÕES DE DOCUMENTOS ---
  const handleViewDoc = (doc: DocumentRecord) => {
    const win = window.open();
    if (win) {
      win.document.write(`<iframe src="${doc.file_data_url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      win.document.title = doc.name;
    }
  };
  const handleDownloadDoc = (doc: DocumentRecord) => {
    const link = window.document.createElement('a');
    link.href = doc.file_data_url;
    link.download = doc.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- FUNÇÕES DE EXCLUSÃO ---
  const handleDeleteRecord = (id: string) => { if (confirm('Apagar evolução?')) remove('records', id); };
  const handleDeleteOccurrence = (id: string) => { if (confirm('Apagar ocorrência?')) remove('occurrences', id); };
  const handleDeleteDocument = (id: string) => { if (confirm('Apagar documento?')) remove('documents', id); };
  const handleDeleteMedication = (id: string) => { if (confirm('Apagar prescrição?')) remove('medications', id); };
  
  const handleAdministerMed = async (id: string) => {
      update('medications', id, { status: 'administered' });
      addToast('Medicação administrada!', 'success');
  };

  // --- FUNÇÃO DE IMPRESSÃO DE OCORRÊNCIA ---
  const handlePrintOccurrence = (occ: Occurrence) => {
    setPrintingOccurrence(occ);
    setTimeout(() => {
        window.print();
        setTimeout(() => setPrintingOccurrence(null), 1000);
    }, 300);
  };

  if (!patient) return null;

  const tabs = [
    { id: 'summary', label: 'Resumo', icon: Heart },
    { id: 'medication', label: 'Medicação', icon: Pill },
    { id: 'finance', label: 'Financeiro', icon: Wallet },
    { id: 'records', label: 'Evoluções', icon: FileText },
    { id: 'occurrences', label: 'Ocorrências', icon: AlertCircle },
    { id: 'documents', label: 'Documentos', icon: Files },
  ];

  const patientTransactions = brain.finances.transactions.filter(t => t.patient_id === patientId);
  const chartData = [
    { month: 'Total', value: patientTransactions.reduce((acc, t) => acc + (t.status === 'paid' ? t.amount : 0), 0) },
  ];

  return (
    <div className="space-y-6 lg:space-y-10 animate-in slide-in-from-right-4 duration-500 relative pb-20">
      
      {/* CSS PARA IMPRESSÃO */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-occurrence, #printable-occurrence * { visibility: visible; }
          #printable-occurrence {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: white;
            padding: 40px;
            visibility: visible !important;
            display: block !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* DOCUMENTO DE ADVERTÊNCIA (SÓ APARECE AO IMPRIMIR) */}
      {printingOccurrence && (
        <div id="printable-occurrence" className="hidden bg-white p-10 max-w-3xl mx-auto text-slate-900 font-sans">
           <div className="text-center border-b-2 border-slate-900 pb-6 mb-8">
              <h1 className="text-2xl font-black uppercase tracking-widest mb-2">{brain.organization.name}</h1>
              <h2 className="text-xl font-bold uppercase text-slate-600">Advertência Disciplinar / Ocorrência</h2>
           </div>

           <div className="space-y-6 text-sm">
              <div className="flex justify-between">
                 <p><strong>Paciente:</strong> {patient.name}</p>
                 <p><strong>Data:</strong> {new Date(printingOccurrence.created_at).toLocaleDateString('pt-BR')} às {new Date(printingOccurrence.created_at).toLocaleTimeString('pt-BR')}</p>
              </div>
              <div className="flex justify-between">
                 <p><strong>Tipo:</strong> {printingOccurrence.type}</p>
                 <p><strong>Gravidade:</strong> {printingOccurrence.severity}</p>
              </div>

              <div className="border p-4 rounded-xl bg-slate-50 mt-4 min-h-[200px]">
                 <p className="font-bold mb-2 uppercase text-xs text-slate-500">Descrição do Fato:</p>
                 <p className="leading-relaxed whitespace-pre-wrap">{printingOccurrence.description}</p>
              </div>

              <div className="pt-12 space-y-12">
                 <div className="grid grid-cols-2 gap-12">
                    <div className="text-center border-t border-slate-400 pt-2">
                       <p className="font-bold">{patient.name}</p>
                       <p className="text-xs text-slate-500">Assinatura do Paciente</p>
                    </div>
                    <div className="text-center border-t border-slate-400 pt-2">
                       <p className="font-bold">Responsável / Testemunha</p>
                       <p className="text-xs text-slate-500">Assinatura da Unidade</p>
                    </div>
                 </div>
                 
                 <div className="p-4 border border-slate-300 rounded-lg text-xs text-slate-500 text-justify">
                    <strong>Ciência:</strong> Declaro que fui orientado(a) sobre o comportamento inadequado descrito acima e estou ciente das normas da unidade. A reincidência poderá acarretar medidas administrativas conforme o regulamento interno.
                 </div>
              </div>
           </div>
           
           <div className="mt-8 text-center text-[10px] text-slate-400 uppercase">
              Documento gerado eletronicamente em {new Date().toLocaleDateString('pt-BR')} via Sistema VivaPlena.
           </div>
        </div>
      )}

      {/* HEADER DO PERFIL */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-8 relative z-10 no-print">
        <button onClick={onBack} className="p-3 lg:p-5 glass hover:bg-white/60 rounded-[16px] lg:rounded-[24px] border border-white/60 transition-all shadow-lg interactive">
          <ArrowLeft size={20} lg:size={24} className="text-slate-600" />
        </button>
        <div className="flex-1">
          <p className="text-[8px] lg:text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-1 lg:mb-1.5">Módulo Acolhimento</p>
          <h1 className="text-2xl lg:text-4xl font-black text-slate-950 tracking-tight leading-tight">{patient.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-10 items-start no-print">
        
        {/* INFO LATERAL */}
        <div className="lg:col-span-1 space-y-4 lg:space-y-6">
          <div className="glass bg-white/10 p-6 lg:p-10 rounded-[32px] lg:rounded-[56px] border border-white/50 text-center backdrop-blur-3xl shadow-xl relative overflow-hidden">
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-[24px] lg:rounded-[36px] mx-auto mb-6 lg:mb-8 shadow-xl border-4 border-white/30 overflow-hidden relative bg-emerald-600">
              {(patient as any).photo ? (
                <img src={(patient as any).photo} alt={patient.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-emerald-600 text-white font-black text-3xl lg:text-5xl">
                  {patient.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                </div>
              )}
            </div>
            <h3 className="text-xl lg:text-2xl font-black text-slate-950 tracking-tight leading-tight">{patient.name}</h3>
            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase mt-3 ${patient.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
              {patient.status === 'active' ? 'Ativo' : patient.status}
            </span>
          </div>
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="lg:col-span-3 flex flex-col gap-6 lg:gap-8 min-w-0">
          
          <div className="flex p-1.5 glass rounded-[20px] lg:rounded-[40px] border border-white/50 overflow-x-auto scrollbar-none gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => handleTabChange(tab.id as Tab)} className={`flex-1 min-w-[90px] flex items-center justify-center gap-2 py-3 lg:py-5 text-[10px] lg:text-[11px] font-black uppercase tracking-widest rounded-[16px] lg:rounded-[28px] transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-emerald-800 shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}>
                  <Icon size={16} /> <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="glass-card p-6 lg:p-12 rounded-[32px] lg:rounded-[64px] shadow-xl backdrop-blur-3xl min-h-[400px]">
            
            {activeTab === 'occurrences' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <h3 className="text-xl font-black text-slate-900">Registro Disciplinar</h3>
                {occurrences.length > 0 ? (
                  <div className="space-y-4">
                    {occurrences.map(occ => (
                      <div key={occ.id} className="p-6 glass border border-white/60 rounded-[32px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-white/40 transition-all">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-md ${
                            occ.severity === 'Crítica' || occ.severity === 'Grave' ? 'bg-rose-500' : 
                            occ.severity === 'Média' ? 'bg-amber-500' : 'bg-blue-500'
                          }`}>
                            <AlertTriangle size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                               <h4 className="font-black text-slate-900 text-lg leading-none">{occ.type}</h4>
                               <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                 occ.severity === 'Crítica' || occ.severity === 'Grave' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'
                               }`}>{occ.severity}</span>
                            </div>
                            <p className="text-sm text-slate-600 font-medium leading-relaxed">{occ.description}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">{new Date(occ.created_at).toLocaleDateString('pt-BR')} • {new Date(occ.created_at).toLocaleTimeString('pt-BR')}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 self-end sm:self-center">
                            <button onClick={() => handlePrintOccurrence(occ)} className="p-3 bg-white text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-100 rounded-xl shadow-sm transition-all" title="Imprimir Advertência">
                                <Printer size={18} />
                            </button>
                            <button onClick={() => handleDeleteOccurrence(occ.id)} className="p-3 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-100 rounded-xl shadow-sm transition-all opacity-0 group-hover:opacity-100">
                                <Trash2 size={18} />
                            </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 opacity-50"><AlertCircle size={48} className="mx-auto mb-4 text-slate-300"/><p>Nenhuma ocorrência registrada.</p></div>
                )}
              </div>
            )}

            {/* ABA DE DOCUMENTOS COM UPLOAD */}
            {activeTab === 'documents' && (
               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black text-slate-900">Arquivos do Paciente</h3>
                    
                    {/* BOTÃO DE UPLOAD */}
                    <div>
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                      <button 
                        onClick={handleUploadClick} 
                        disabled={uploading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all"
                      >
                        {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                        Anexar Arquivo
                      </button>
                    </div>
                  </div>

                  {documents.length > 0 ? (
                    <div className="space-y-4">
                        {documents.map(d => (
                            <div key={d.id} className="p-4 glass rounded-2xl flex justify-between items-center border border-white/60">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><File size={20}/></div> 
                                    <div>
                                        <p className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{d.name}</p>
                                        <p className="text-[10px] text-slate-400 uppercase">{new Date(d.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={() => handleViewDoc(d)} className="p-2 bg-white rounded-lg text-slate-400 hover:text-indigo-600 border border-slate-100"><Eye size={16}/></button>
                                  <button onClick={() => handleDeleteDocument(d.id)} className="p-2 bg-white rounded-lg text-slate-400 hover:text-rose-600 border border-slate-100"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 opacity-50"><Files size={48} className="mx-auto mb-4 text-slate-300"/><p>Nenhum documento anexado.</p></div>
                  )}
               </div>
            )}

            {/* OUTRAS ABAS SIMPLIFICADAS */}
            {activeTab === 'summary' && <div className="space-y-6 text-center py-10 opacity-60"><Heart size={48} className="mx-auto mb-4"/> <p>Resumo do Prontuário</p></div>}
            {activeTab === 'medication' && (
               <div className="space-y-4">
                  <h3 className="text-xl font-black text-slate-900">Medicação Ativa</h3>
                  {medications.map(med => (
                      <div key={med.id} className="p-4 glass rounded-2xl flex justify-between items-center">
                          <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Pill size={20}/></div>
                              <div><p className="font-bold text-slate-900">{med.name}</p><p className="text-xs text-slate-500">{med.dosage} • {med.scheduled_time}</p></div>
                          </div>
                          <button onClick={() => handleDeleteMedication(med.id)} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 size={16}/></button>
                      </div>
                  ))}
               </div>
            )}
            {activeTab === 'finance' && <div className="text-center py-10 opacity-60"><Wallet size={48} className="mx-auto mb-4"/> <p>Histórico Financeiro</p></div>}
            {activeTab === 'records' && (
               <div className="space-y-4">
                  <h3 className="text-xl font-black text-slate-900">Evoluções</h3>
                  {records.map(r => (
                      <div key={r.id} className="p-4 glass rounded-2xl">
                          <p className="text-sm text-slate-700">{r.content}</p>
                          <div className="flex justify-between mt-2"><span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(r.created_at).toLocaleDateString()}</span> <button onClick={() => handleDeleteRecord(r.id)}><Trash2 size={14} className="text-slate-300 hover:text-rose-500"/></button></div>
                      </div>
                  ))}
               </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
