import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, MapPin, Heart, FileText, AlertCircle, Files, Edit2, Printer, Pill, Wallet, Clock, User as UserIcon, Eye, Download, File, Trash2, CheckCircle2, CheckCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useBrain } from '../context/BrainContext';
import { DocumentRecord } from '../types';

interface PatientProfileProps {
  patientId: string;
  onBack: () => void;
}

type Tab = 'summary' | 'medication' | 'finance' | 'records' | 'occurrences' | 'documents';

const PatientProfile: React.FC<PatientProfileProps> = ({ patientId, onBack }) => {
  const { brain, setUI, remove, update, addToast } = useBrain();
  const patient = brain.patients.find(p => p.id === patientId);
  const records = brain.records.filter(r => r.patient_id === patientId);
  const occurrences = brain.occurrences.filter(o => o.patient_id === patientId);
  const documents = (brain.documents || []).filter(d => d.patient_id === patientId);
  
  // Filtra as medicações deste paciente
  const medications = (brain.medications || []).filter(m => m.patient_id === patientId).sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));

  const [activeTab, setActiveTab] = useState<Tab>((brain.ui.activeTab as Tab) || 'summary');

  useEffect(() => {
    if (brain.ui.activeTab && brain.ui.activeTab !== activeTab) {
      setActiveTab(brain.ui.activeTab as Tab);
    }
  }, [brain.ui.activeTab]);

  const handleTabChange = (tabId: Tab) => {
    setActiveTab(tabId);
    setUI({ activeTab: tabId });
  };

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
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  // --- FUNÇÕES DE EXCLUSÃO (Agora conectadas!) ---
  const handleDeleteRecord = (id: string) => {
    if (confirm('Tem certeza que deseja apagar esta evolução?')) remove('records', id);
  };
  const handleDeleteOccurrence = (id: string) => {
    if (confirm('Tem certeza que deseja apagar esta ocorrência?')) remove('occurrences', id);
  };
  const handleDeleteDocument = (id: string) => {
    if (confirm('Tem certeza que deseja apagar este documento?')) remove('documents', id);
  };
  const handleDeleteMedication = (id: string) => {
    if (confirm('Tem certeza que deseja apagar esta prescrição?')) remove('medications', id);
  };

  const handleAdministerMed = async (id: string) => {
      update('medications', id, { status: 'administered' });
      addToast('Medicação administrada!', 'success');
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

  const patientTransactions = brain.finances.transactions.filter(t => t.patientId === patientId);
  
  const chartData = [
    { month: 'Jan', value: 4500 },
    { month: 'Fev', value: 4500 },
    { month: 'Mar', value: 4500 },
    { month: 'Abr', value: 4500 },
    { month: 'Mai', value: patientTransactions.reduce((acc, t) => acc + (t.status === 'paid' ? t.amount : 0), 0) },
  ];

  return (
    <div className="space-y-6 lg:space-y-10 animate-in slide-in-from-right-4 duration-500 relative pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-8 relative z-10">
        <button onClick={onBack} className="p-3 lg:p-5 glass hover:bg-white/60 rounded-[16px] lg:rounded-[24px] border border-white/60 transition-all shadow-lg interactive">
          <ArrowLeft size={20} lg:size={24} className="text-slate-600" />
        </button>
        <div className="flex-1">
          <p className="text-[8px] lg:text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-1 lg:mb-1.5">Módulo Acolhimento</p>
          <h1 className="text-2xl lg:text-4xl font-black text-slate-950 tracking-tight leading-tight">{patient.name}</h1>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none p-3 lg:p-4 glass-header border-white/50 rounded-[16px] lg:rounded-[22px] hover:bg-white/80 transition-all shadow-lg flex items-center justify-center"><Printer size={18} lg:size={22}/></button>
          <button className="flex-1 sm:flex-none p-3 lg:p-4 glass-header border-white/50 rounded-[16px] lg:rounded-[22px] hover:bg-white/80 transition-all shadow-lg flex items-center justify-center"><Edit2 size={18} lg:size={22}/></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-10 items-start">
        <div className="lg:col-span-1 space-y-4 lg:space-y-6">
          <div className="glass bg-white/10 p-6 lg:p-10 rounded-[32px] lg:rounded-[56px] border border-white/50 text-center backdrop-blur-3xl shadow-xl relative overflow-hidden">
            <div className="w-20 h-20 lg:w-28 lg:h-28 bg-emerald-600/90 text-white rounded-[24px] lg:rounded-[36px] flex items-center justify-center font-black text-2xl lg:text-4xl mx-auto mb-6 lg:mb-8 shadow-xl border border-white/20">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </div>
            <h3 className="text-xl lg:text-2xl font-black text-slate-950 tracking-tight leading-tight">{patient.name}</h3>
            <span className={`inline-flex items-center gap-2 px-4 py-1.5 lg:px-5 lg:py-2 rounded-full text-[9px] lg:text-[11px] font-black uppercase mt-3 border backdrop-blur-md ${
              patient.status === 'active' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' : 'bg-slate-200/50 text-slate-600 border-slate-300/30'
            }`}>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              {patient.status}
            </span>

            <div className="space-y-4 lg:space-y-6 text-left mt-8 lg:mt-12 pt-8 lg:pt-12 border-t border-white/20">
              <InfoRow label="Protocolo" value={patient.treatmentType} icon={Heart} />
              <InfoRow label="Acomodação" value={patient.room} icon={MapPin} />
              <InfoRow label="Pagamento" value={patient.paymentType} icon={Wallet} />
              <InfoRow label="Responsável" value={patient.familyResponsible} icon={FileText} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col gap-6 lg:gap-8 min-w-0">
          <div className="flex p-1.5 glass rounded-[20px] lg:rounded-[40px] border border-white/50 backdrop-blur-3xl shadow-lg w-full overflow-x-auto scrollbar-none gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button 
                  key={tab.id} 
                  onClick={() => handleTabChange(tab.id as Tab)}
                  className={`flex-1 min-w-[90px] sm:min-w-[120px] flex items-center justify-center gap-2 py-3 lg:py-5 text-[9px] lg:text-[11px] font-black uppercase tracking-widest rounded-[16px] lg:rounded-[28px] transition-all whitespace-nowrap ${
                    isActive ? 'bg-white text-emerald-800 shadow-lg' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Icon size={14} lg:size={18} />
                  <span className="hidden xs:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="glass-card p-6 lg:p-12 rounded-[32px] lg:rounded-[64px] shadow-xl backdrop-blur-3xl min-h-[400px] lg:min-h-[580px] relative overflow-hidden">
            
            {activeTab === 'summary' && (
              <div className="space-y-8 lg:space-y-12 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                  <div className="space-y-4 lg:space-y-6">
                    <h4 className="text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-widest">Histórico</h4>
                    <p className="text-sm lg:text-lg text-slate-800 font-semibold leading-relaxed glass p-6 lg:p-10 rounded-[24px] lg:rounded-[40px] border border-white/60 shadow-inner italic">
                      "{patient.reason || 'Sem descrição cadastrada.'}"
                    </p>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-widest">Datas</h4>
                    <div className="grid grid-cols-2 gap-4 lg:gap-6">
                      <DateCard label="Ingresso" date={patient.admissionDate} />
                      <DateCard label="Saída Prev." date={patient.exitForecast || '--'} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* EVOLUÇÕES COM DELETE */}
            {activeTab === 'records' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <h3 className="text-xl font-black text-slate-900">Histórico de Evoluções</h3>
                {records.length > 0 ? (
                  <div className="space-y-4">
                    {records.map(record => (
                      <div key={record.id} className="p-6 glass border border-white/60 rounded-[32px] space-y-4 group">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                              <Clock size={20} />
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-800">{new Date(record.created_at).toLocaleDateString('pt-BR')}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Por {record.created_by}</p>
                            </div>
                          </div>
                          {/* Botão de Excluir */}
                          <button onClick={() => handleDeleteRecord(record.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100" title="Excluir">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">{record.content}</p>
                        <div className="flex gap-2">
                            {record.tags.map(tag => (
                              <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-black uppercase rounded-lg border border-slate-200">{tag}</span>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 opacity-50"><FileText size={48} className="mx-auto mb-4 text-slate-300"/><p>Nenhuma evolução registrada.</p></div>
                )}
              </div>
            )}

            {/* OCORRÊNCIAS COM DELETE */}
            {activeTab === 'occurrences' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <h3 className="text-xl font-black text-slate-900">Registro de Ocorrências</h3>
                {occurrences.length > 0 ? (
                  <div className="space-y-4">
                    {occurrences.map(occ => (
                      <div key={occ.id} className="p-6 glass border border-white/60 rounded-[32px] flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${
                            occ.severity === 'critical' ? 'bg-rose-600' : 'bg-amber-500'
                          }`}>
                            <AlertCircle size={20} />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 leading-tight">{occ.title}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{occ.date} • {occ.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[8px] font-black uppercase px-3 py-1 bg-slate-100 text-slate-500 rounded-full">{occ.status}</span>
                            {/* Botão de Excluir */}
                            <button onClick={() => handleDeleteOccurrence(occ.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100" title="Excluir">
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

            {/* DOCUMENTOS COM DELETE */}
            {activeTab === 'documents' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <h3 className="text-xl font-black text-slate-900">Documentos & Laudos</h3>
                {documents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {documents.map(doc => (
                      <div key={doc.id} className="p-6 glass border border-white/60 rounded-[32px] group hover:bg-white/40 transition-all">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                            <File size={20} />
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => handleViewDoc(doc)} className="p-2 glass rounded-lg text-slate-400 hover:text-indigo-600 transition-all">
                              <Eye size={16} />
                            </button>
                            <button onClick={() => handleDownloadDoc(doc)} className="p-2 glass rounded-lg text-slate-400 hover:text-emerald-600 transition-all">
                              <Download size={16} />
                            </button>
                            {/* Botão de Excluir */}
                            <button onClick={() => handleDeleteDocument(doc.id)} className="p-2 glass rounded-lg text-slate-400 hover:text-rose-600 transition-all" title="Excluir">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <h4 className="font-black text-slate-800 text-sm truncate">{doc.name}</h4>
                        <div className="flex items-center justify-between mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <span>{doc.type}</span>
                          <span>{new Date(doc.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 opacity-50"><Files size={48} className="mx-auto mb-4 text-slate-300"/><p>Nenhum documento anexado.</p></div>
                )}
              </div>
            )}

            {activeTab === 'finance' && (
              <div className="animate-in fade-in duration-500 space-y-8 lg:space-y-12">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-8">
                   <div className="bg-emerald-600/90 p-6 lg:p-10 rounded-[24px] lg:rounded-[48px] text-white shadow-xl border border-white/10 backdrop-blur-xl">
                      <p className="text-[9px] lg:text-[11px] font-black uppercase tracking-widest opacity-60 mb-2">Mensalidade</p>
                      <h4 className="text-2xl lg:text-4xl font-black tracking-tighter">R$ 4.500</h4>
                   </div>
                   <div className="glass p-6 lg:p-10 rounded-[24px] lg:rounded-[48px] border border-white/50 shadow-md flex flex-col justify-center text-center">
                      <p className="text-[9px] lg:text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Status</p>
                      <h4 className="text-sm lg:text-xl font-black text-emerald-800 uppercase tracking-tight">Regular</h4>
                   </div>
                   <div className="glass p-6 lg:p-10 rounded-[24px] lg:rounded-[48px] border border-white/50 shadow-md flex flex-col justify-center text-center">
                      <p className="text-[9px] lg:text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total</p>
                      <h4 className="text-sm lg:text-xl font-black text-slate-900 tracking-tighter">R$ 22.500</h4>
                   </div>
                </div>

                <div className="h-[250px] lg:h-[320px] w-full glass-dark p-4 lg:p-10 rounded-[24px] lg:rounded-[48px] border border-white/30 backdrop-blur-3xl">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none'}} />
                      <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                         {chartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#10b981' : 'rgba(16, 185, 129, 0.2)'} />
                         ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            
            {/* CORREÇÃO DO LAYOUT MEDICAÇÃO + DELETE */}
            {(activeTab === 'medication') && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <h3 className="text-xl font-black text-slate-900">Plano Medicamentoso</h3>
                {medications.length > 0 ? (
                  <div className="space-y-3">
                    {medications.map(med => (
                      <div key={med.id} className="p-6 glass border border-white/60 rounded-[32px] flex items-center justify-between group hover:bg-white transition-all shadow-sm">
                        <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                            med.status === 'administered' ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                          }`}>
                            <Pill size={20} />
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-slate-900 leading-tight">{med.name}</h4>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs font-bold text-slate-500">{med.dosage}</span>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <Clock size={12} /> {med.scheduled_time}
                                </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            {med.status === 'administered' ? (
                                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100/50 rounded-lg text-emerald-700">
                                    <CheckCircle size={16} />
                                    <span className="text-[9px] font-black uppercase">Feito</span>
                                </div>
                            ) : (
                                <button onClick={() => handleAdministerMed(med.id)} className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:scale-105 transition-all" title="Administrar">
                                    <CheckCircle2 size={18} />
                                </button>
                            )}
                            
                            {/* Botão de Excluir Medicação */}
                            <button onClick={() => handleDeleteMedication(med.id)} className="p-3 text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100" title="Excluir">
                                <Trash2 size={18} />
                            </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 opacity-50"><Pill size={48} className="mx-auto mb-4 text-slate-300"/><p>Nenhuma prescrição ativa para este paciente.</p></div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, icon: Icon }: any) => (
  <div className="flex items-start gap-3 lg:gap-4 group">
    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-[12px] lg:rounded-[16px] glass border-white bg-white/20 flex items-center justify-center text-slate-500 group-hover:bg-emerald-600/90 group-hover:text-white transition-all duration-300 shadow-sm shrink-0 backdrop-blur-md">
      <Icon size={14} lg:size={18} />
    </div>
    <div className="min-w-0">
      <p className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 lg:mb-2">{label}</p>
      <p className="text-xs lg:text-sm font-bold text-slate-800 leading-tight tracking-tight truncate">{value}</p>
    </div>
  </div>
);

const DateCard = ({ label, date }: any) => (
  <div className="glass p-5 lg:p-10 rounded-[20px] lg:rounded-[36px] border border-white/50 text-center">
    <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
    <p className="text-lg lg:text-xl font-black text-slate-800">{date}</p>
  </div>
);

export default PatientProfile;