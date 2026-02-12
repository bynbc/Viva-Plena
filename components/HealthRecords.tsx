import React, { useState } from 'react';
import { Activity, Heart, Clipboard, FileText, Search, User, Plus, Stethoscope, Pill, Brain } from 'lucide-react';
import { useBrain } from '../context/BrainContext';

const HealthRecords: React.FC = () => {
    const { brain, push, addToast } = useBrain();
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Estado para novo registro
    const [isAdding, setIsAdding] = useState(false);
    const [newRecordType, setNewRecordType] = useState('Evolução de Enfermagem');
    const [newRecordContent, setNewRecordContent] = useState('');

    // Filtros
    const activePatients = brain.patients.filter(p => p.status === 'active');
    const filteredPatients = activePatients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const selectedPatient = brain.patients.find(p => p.id === selectedPatientId);

    // Busca registros REAIS do paciente selecionado
    const patientRecords = brain.healthRecords
        .filter(r => r.patient_id === selectedPatientId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const handleSaveRecord = async () => {
        if (!newRecordContent.trim()) return addToast("Escreva algo na evolução.", "warning");
        if (!selectedPatientId) return;

        try {
            await push('health_records', {
                clinic_id: brain.session.clinicId,
                patient_id: selectedPatientId,
                type: newRecordType,
                content: newRecordContent,
                professional_name: brain.session.user?.username || 'Profissional', // Pega o nome de quem tá logado
                created_at: new Date().toISOString()
            });

            addToast("Evolução registrada com sucesso!", "success");
            setIsAdding(false);
            setNewRecordContent('');
        } catch (err) {
            addToast("Erro ao salvar.", "error");
        }
    };

    return (
        <div className="space-y-6 pb-20 md:h-[calc(100vh-100px)] h-auto flex flex-col md:flex-row gap-6 animate-in fade-in">

            {/* MENU LATERAL */}
            <div className="w-full md:w-80 flex flex-col gap-4 md:h-full h-auto">
                <div className="glass-card p-4 rounded-[24px] md:h-full h-auto flex flex-col">
                    <h2 className="text-lg font-black text-slate-800 mb-2">Prontuários</h2>
                    <div className="relative mb-2">
                        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input
                            placeholder="Buscar Paciente..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white/50 rounded-xl text-sm font-bold outline-none border border-white/50 focus:border-pink-500 focus:bg-white transition-all shadow-sm"
                        />
                    </div>
                    <div className="space-y-2 md:overflow-y-auto overflow-visible flex-1 custom-scrollbar max-h-[300px] md:max-h-none">
                        {filteredPatients.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedPatientId(p.id)}
                                className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${selectedPatientId === p.id ? 'bg-pink-600 text-white shadow-pink-200 shadow-lg' : 'bg-white/40 text-slate-600 hover:bg-white/80 border border-white/50'}`}
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

            {/* ÁREA DO PRONTUÁRIO */}
            <div className="flex-1 glass-card rounded-[32px] p-4 md:p-8 md:overflow-y-auto overflow-visible relative min-h-[500px]">
                {!selectedPatient ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
                        <Activity size={64} className="mb-4 text-slate-400" />
                        <p className="text-xl font-black text-slate-400 text-center px-4">Selecione um paciente para ver o prontuário</p>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in slide-in-from-right-4">
                        {/* CABEÇALHO PACIENTE */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200/50 pb-6 gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden">
                                    {selectedPatient.photo_url ? <img src={selectedPatient.photo_url} className="w-full h-full object-cover" /> : <User className="w-full h-full p-4 text-slate-300" />}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black text-slate-900">{selectedPatient.name}</h1>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Prontuário Médico Digital</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsAdding(!isAdding)}
                                className="bg-pink-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase shadow-lg hover:bg-pink-700 transition-all flex items-center gap-2 justify-center w-full md:w-auto"
                            >
                                <Plus size={18} /> Nova Evolução
                            </button>
                        </div>

                        {/* ÁREA DE NOVO REGISTRO */}
                        {isAdding && (
                            <div className="bg-pink-50/50 backdrop-blur-sm p-6 rounded-2xl border border-pink-100 shadow-inner animate-in slide-in-from-top-4">
                                <h3 className="font-black text-pink-700 mb-4 flex items-center gap-2"><Stethoscope size={18} /> Novo Registro Clínico</h3>

                                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
                                    {['Evolução de Enfermagem', 'Atendimento Médico', 'Psicologia', 'Sinais Vitais'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setNewRecordType(type)}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase whitespace-nowrap transition-colors ${newRecordType === type ? 'bg-pink-600 text-white shadow-md' : 'bg-white/60 text-slate-500 border border-white/60 hover:bg-white'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>

                                <textarea
                                    value={newRecordContent}
                                    onChange={e => setNewRecordContent(e.target.value)}
                                    className="w-full p-4 bg-white/70 rounded-xl border border-pink-200/50 outline-none focus:border-pink-500 focus:bg-white focus:shadow-md transition-all min-h-[300px] md:min-h-[150px] font-medium text-base md:text-sm text-slate-700"
                                    placeholder="Descreva a evolução do paciente, sinais vitais ou observações..."
                                    autoFocus
                                />

                                <div className="flex justify-end gap-3 mt-4">
                                    <button onClick={() => setIsAdding(false)} className="px-6 py-3 bg-white/50 hover:bg-white text-slate-500 font-bold text-xs uppercase rounded-xl border border-slate-200 transition-all">Cancelar</button>
                                    <button onClick={handleSaveRecord} className="px-6 py-3 bg-pink-600 text-white font-bold text-xs uppercase rounded-xl shadow-lg hover:bg-pink-700 hover:scale-105 transition-all">Salvar no Prontuário</button>
                                </div>
                            </div>
                        )}

                        {/* TIMELINE DE EVOLUÇÃO */}
                        <div>
                            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                                <FileText className="text-slate-400" /> Histórico Clínico
                            </h3>

                            {patientRecords.length === 0 ? (
                                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                                    <p className="text-slate-400 font-bold text-sm">Nenhum registro clínico encontrado.</p>
                                    <p className="text-slate-300 text-xs mt-1">Clique em "Nova Evolução" para começar.</p>
                                </div>
                            ) : (
                                <div className="space-y-6 pl-4 border-l-2 border-slate-100">
                                    {patientRecords.map(record => (
                                        <div key={record.id} className="relative pl-8 pb-2">
                                            <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${record.type === 'Atendimento Médico' ? 'bg-indigo-500' :
                                                    record.type === 'Psicologia' ? 'bg-purple-500' :
                                                        'bg-pink-500'
                                                }`}></div>

                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md text-white ${record.type === 'Atendimento Médico' ? 'bg-indigo-500' :
                                                        record.type === 'Psicologia' ? 'bg-purple-500' :
                                                            'bg-pink-500'
                                                    }`}>
                                                    {record.type || 'Evolução'}
                                                </span>
                                                <span className="text-xs font-bold text-slate-400 uppercase">
                                                    {new Date(record.created_at).toLocaleString('pt-BR')}
                                                </span>
                                            </div>

                                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                                <p className="text-slate-700 font-medium text-sm leading-relaxed whitespace-pre-wrap">{record.content}</p>
                                                <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center">
                                                    <span className="text-[10px] font-black text-slate-300 uppercase flex items-center gap-1">
                                                        <User size={10} /> Resp: {record.professional_name || 'Desconhecido'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HealthRecords;
