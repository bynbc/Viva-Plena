import React, { useState, useEffect } from 'react';
import { useBrain } from '../context/BrainContext';
import { Printer, Search, FileText, Calendar } from 'lucide-react';

const GovernmentReport: React.FC = () => {
    const { brain } = useBrain();
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
    const [technicalOpinion, setTechnicalOpinion] = useState('');

    const patient = brain.patients.find(p => p.id === selectedPatientId);

    // Dados Relacionados
    const medications = brain.medications?.filter(m => m.patient_id === selectedPatientId && m.status !== 'stopped') || [];
    const occurrences = brain.occurrences?.filter(o => o.patient_id === selectedPatientId) || [];

    // Últimas Avaliações
    const assessments = brain.assessments?.filter(a => a.patient_id === selectedPatientId) || [];
    const lastAssist = assessments.filter(a => a.type === 'ASSIST').sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
    const lastAudit = assessments.filter(a => a.type === 'AUDIT').sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
    const nursing = assessments.filter(a => a.type === 'NURSING').sort((a, b) => b.created_at.localeCompare(a.created_at))[0];

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="pb-20 animate-in fade-in">
            {/* CONTROLES (Não aparecem na impressão) */}
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm mb-8 no-print flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="text-xs font-black text-slate-400 uppercase ml-2">Selecione o Acolhido</label>
                    <select
                        value={selectedPatientId}
                        onChange={e => setSelectedPatientId(e.target.value)}
                        className="w-full p-4 bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl font-bold outline-none focus:border-indigo-500" style={{ color: "#0f172a" }}
                    >
                        <option value="">-- Selecione --</option>
                        {brain.patients.filter(p => p.status === 'active').map(p => (
                            <option key={p.id} value={p.id} style={{ color: "#0f172a", background: "#ffffff" }}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div className="w-full md:w-auto">
                    <label className="text-xs font-black text-slate-400 uppercase ml-2">Data do Relatório</label>
                    <input
                        type="date"
                        value={reportDate}
                        onChange={e => setReportDate(e.target.value)}
                        className="w-full p-4 bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl font-bold outline-none focus:border-indigo-500" style={{ color: "#0f172a" }}
                    />
                </div>

                <div className="w-full md:w-auto">
                    <button
                        onClick={handlePrint}
                        disabled={!patient}
                        className="w-full bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Printer size={20} /> Imprimir Relatório
                    </button>
                </div>
            </div>

            {/* ÁREA DE IMPRESSÃO */}
            {patient ? (
                <div className="overflow-x-auto pb-8 print:overflow-visible">
                    <div className="bg-white p-8 md:p-12 min-w-[210mm] md:max-w-[210mm] mx-auto min-h-[297mm] shadow-lg print:shadow-none print:w-full print:max-w-none print:p-0 print:m-0" id="print-area">

                        {/* CABEÇALHO */}
                        <div className="border-b-2 border-slate-800 pb-6 mb-8 text-center print:border-black">
                            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-widest print:text-black">Relatório Técnico de Acompanhamento</h1>
                            <p className="text-lg font-bold text-slate-600 mt-2 print:text-black">Instituição Viva Plena - Comunidade Terapêutica</p>
                            <p className="text-sm text-slate-500 print:text-black">Gerado em: {new Date(reportDate).toLocaleDateString()}</p>
                        </div>

                        {/* 1. IDENTIFICAÇÃO */}
                        <section className="mb-8">
                            <h2 className="text-base font-black text-white bg-slate-900 px-4 py-1.5 uppercase inline-block mb-4">1. Identificação do Acolhido</h2>
                            <div className="grid grid-cols-2 gap-y-3 text-base text-slate-800 border border-slate-300 p-5">
                                <p><strong className="uppercase">Nome:</strong> {patient.name}</p>
                                <p><strong className="uppercase">Data Nasc.:</strong> {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : '-'}</p>
                                <p><strong className="uppercase">CPF:</strong> {patient.cpf || '-'}</p>
                                <p><strong className="uppercase">RG:</strong> {patient.rg || '-'}</p>
                                <p><strong className="uppercase">Filiação:</strong> {patient.mother_name || '-'} / {patient.father_name || '-'}</p>
                                <p><strong className="uppercase">Admissão:</strong> {patient.entry_date ? new Date(patient.entry_date).toLocaleDateString() : '-'}</p>
                            </div>
                        </section>

                        {/* 2. DADOS CLÍNICOS E TRIAGEM */}
                        <section className="mb-8">
                            <h2 className="text-base font-black text-white bg-slate-900 px-4 py-1.5 uppercase inline-block mb-4">2. Dados Clínicos e Triagem</h2>
                            <div className="border border-slate-300 p-5 text-base text-slate-800 space-y-3">
                                <p><strong className="uppercase">Diagnóstico (CID):</strong> {patient.diagnosis || 'Não informado'}</p>
                                <p><strong className="uppercase">Origem:</strong> {patient.origin_city || '-'} ({patient.reference_service || '-'})</p>
                                <div className="mt-2 pt-2 border-t border-slate-200">
                                    <strong className="uppercase block mb-1">Histórico de Dependência:</strong>
                                    <p className="italic text-slate-700">{patient.dependence_history || 'Sem histórico registrado.'}</p>
                                </div>
                            </div>
                        </section>

                        {/* 3. AVALIAÇÕES TÉCNICAS */}
                        <section className="mb-8">
                            <h2 className="text-base font-black text-white bg-slate-900 px-4 py-1.5 uppercase inline-block mb-4">3. Avaliações Técnicas (Resumo)</h2>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="border border-slate-300 p-4 text-center">
                                    <strong className="block text-sm uppercase text-slate-500 mb-1">ASSIST (Score)</strong>
                                    <span className="text-2xl font-black text-slate-900">{lastAssist ? lastAssist.total_score : '-'}</span>
                                    <p className="text-xs text-slate-500 mt-1">{lastAssist ? new Date(lastAssist.created_at).toLocaleDateString() : 'Não avaliado'}</p>
                                </div>
                                <div className="border border-slate-300 p-4 text-center">
                                    <strong className="block text-sm uppercase text-slate-500 mb-1">AUDIT (Score)</strong>
                                    <span className="text-2xl font-black text-slate-900">{lastAudit ? lastAudit.total_score : '-'}</span>
                                    <p className="text-xs text-slate-500 mt-1">{lastAudit ? new Date(lastAudit.created_at).toLocaleDateString() : 'Não avaliado'}</p>
                                </div>
                                <div className="border border-slate-300 p-4 text-center">
                                    <strong className="block text-sm uppercase text-slate-500 mb-1">Enfermagem (PA)</strong>
                                    <span className="text-2xl font-black text-slate-900">{nursing && nursing.data ? nursing.data.blood_pressure : '-'}</span>
                                    <p className="text-xs text-slate-500 mt-1">{nursing ? new Date(nursing.created_at).toLocaleDateString() : 'Não aferido'}</p>
                                </div>
                            </div>
                        </section>

                        {/* 4. MEDICAÇÃO EM USO */}
                        <section className="mb-8">
                            <h2 className="text-base font-black text-white bg-slate-900 px-4 py-1.5 uppercase inline-block mb-4">4. Medicação em Uso</h2>
                            <table className="w-full text-base border-collapse border border-slate-300">
                                <thead>
                                    <tr className="bg-slate-100">
                                        <th className="border border-slate-300 p-3 text-left">Medicamento</th>
                                        <th className="border border-slate-300 p-3 text-left">Dosagem</th>
                                        <th className="border border-slate-300 p-3 text-center">Horário</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {medications.length > 0 ? medications.map(m => (
                                        <tr key={m.id}>
                                            <td className="border border-slate-300 p-3 font-bold text-slate-800">{m.name}</td>
                                            <td className="border border-slate-300 p-3 text-slate-800">{m.dosage}</td>
                                            <td className="border border-slate-300 p-3 text-center text-slate-800">{m.scheduled_time}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={3} className="p-4 text-center italic text-slate-500">Nenhuma medicação prescrita.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </section>

                        {/* 5. OCORRÊNCIAS RELEVANTES */}
                        <section className="mb-8">
                            <h2 className="text-base font-black text-white bg-slate-900 px-4 py-1.5 uppercase inline-block mb-4">5. Ocorrências Relevantes</h2>
                            <ul className="list-disc pl-5 text-base space-y-2 text-slate-800">
                                {occurrences.slice(0, 5).map(occ => (
                                    <li key={occ.id}>
                                        <strong className="uppercase text-sm">{new Date(occ.created_at).toLocaleDateString()}:</strong> {occ.title} - {occ.description}
                                    </li>
                                ))}
                                {occurrences.length === 0 && <li className="italic text-slate-500 list-none">Nenhuma ocorrência registrada no período.</li>}
                            </ul>
                        </section>

                        {/* 6. PARECER TÉCNICO */}
                        <section className="mb-12">
                            <h2 className="text-base font-black text-white bg-slate-900 px-4 py-1.5 uppercase inline-block mb-4">6. Parecer Técnico</h2>
                            <textarea
                                className="w-full h-48 border border-slate-300 p-5 text-base text-slate-800 resize-none outline-none print:border-none print:p-0 print:h-auto font-medium"
                                placeholder="Digite aqui o parecer técnico, evolução ou observações finais para impressão..."
                                value={technicalOpinion}
                                onChange={e => setTechnicalOpinion(e.target.value)}
                            />
                        </section>

                        {/* ASSINATURAS */}
                        <div className="grid grid-cols-2 gap-12 mt-20 pt-10 break-inside-avoid">
                            <div className="border-t border-slate-500 text-center pt-2">
                                <p className="font-bold text-base uppercase text-slate-900">{patient.name}</p>
                                <p className="text-sm text-slate-600">Acolhido</p>
                            </div>
                            <div className="border-t border-slate-500 text-center pt-2">
                                <p className="font-bold text-base uppercase text-slate-900">Responsável Técnico</p>
                                <p className="text-sm text-slate-600">Carimbo / Assinatura</p>
                            </div>
                        </div>

                    </div>
                </div>

            ) : (
                <div className="text-center py-20 text-slate-300">
                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="font-bold uppercase">Selecione um acolhido para gerar o relatório.</p>
                </div>
            )
            }
        </div >
    );
};

export default GovernmentReport;
