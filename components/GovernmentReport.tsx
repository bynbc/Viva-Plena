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
    const pti = brain.pti?.find(p => p.patient_id === selectedPatientId && p.goals);
    const healthRecords = brain.healthRecords?.filter(h => h.patient_id === selectedPatientId).slice(0, 5) || []; // Últimos 5

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
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm mb-8 print:hidden flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="text-xs font-black text-slate-400 uppercase ml-2">Selecione o Acolhido</label>
                    <select
                        value={selectedPatientId}
                        onChange={e => setSelectedPatientId(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-indigo-500 text-slate-900"
                    >
                        <option value="">-- Selecione --</option>
                        {brain.patients.filter(p => p.status === 'active').map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div className="w-full md:w-auto">
                    <label className="text-xs font-black text-slate-400 uppercase ml-2">Data do Relatório</label>
                    <input
                        type="date"
                        value={reportDate}
                        onChange={e => setReportDate(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-indigo-500 text-slate-900"
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
                <div className="overflow-x-auto pb-8 print:overflow-visible print:pb-0">
                    <div className="bg-white p-8 md:p-12 min-w-[210mm] md:max-w-[210mm] mx-auto min-h-[297mm] shadow-lg print:shadow-none print:w-full print:max-w-none print:p-[15mm] print:m-0" id="print-area">

                        {/* CABEÇALHO */}
                        <div className="border-b-2 border-slate-800 pb-6 mb-8 text-center print:border-black">
                            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-widest print:text-black">Relatório Técnico de Acompanhamento</h1>
                            <p className="text-lg font-bold text-slate-600 mt-2 print:text-black">Instituição Viva Plena - Comunidade Terapêutica</p>
                            <p className="text-sm text-slate-500 print:text-black">Gerado em: {new Date(reportDate).toLocaleDateString()}</p>
                        </div>

                        {/* 1. IDENTIFICAÇÃO */}
                        <section className="mb-6 break-inside-avoid">
                            <h2 className="text-sm font-black text-white bg-slate-900 px-3 py-1 uppercase inline-block mb-3 print:bg-black print:text-white">1. Identificação do Acolhido</h2>
                            <div className="grid grid-cols-2 gap-y-2 text-sm text-slate-900 border border-slate-400 p-4 bg-white print:border-black">
                                <p><strong className="uppercase">Nome:</strong> {patient.name}</p>
                                <p><strong className="uppercase">Data Nasc.:</strong> {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : '-'}</p>
                                <p><strong className="uppercase">CPF:</strong> {patient.cpf || '-'}</p>
                                <p><strong className="uppercase">RG:</strong> {patient.rg || '-'}</p>
                                <p><strong className="uppercase">Filiação:</strong> {patient.mother_name || '-'} / {patient.father_name || '-'}</p>
                                <p><strong className="uppercase">Admissão:</strong> {patient.entry_date ? new Date(patient.entry_date).toLocaleDateString() : '-'}</p>
                            </div>
                        </section>

                        {/* 2. DADOS CLÍNICOS E PTI */}
                        <section className="mb-6 break-inside-avoid">
                            <h2 className="text-sm font-black text-white bg-slate-900 px-3 py-1 uppercase inline-block mb-3 print:bg-black print:text-white">2. Dados Clínicos & Terapêuticos</h2>
                            <div className="border border-slate-400 p-4 text-sm text-slate-900 space-y-3 bg-white print:border-black">
                                <p><strong className="uppercase">Diagnóstico (CID):</strong> {patient.diagnosis || 'Não informado'}</p>
                                <div className="pt-2 border-t border-slate-200">
                                    <strong className="uppercase block mb-1">Metas Terapêuticas (PTI):</strong>
                                    <p className="italic text-slate-800">{pti?.goals?.short_term || 'Plano Terapêutico Singular não registrado.'}</p>
                                </div>
                                <div className="pt-2 border-t border-slate-200">
                                    <strong className="uppercase block mb-1">Abordagem Definida:</strong>
                                    <p className="italic text-slate-800">{pti?.goals?.psychological_approach || '-'}</p>
                                </div>
                            </div>
                        </section>

                        {/* 3. AVALIAÇÕES */}
                        <section className="mb-6 break-inside-avoid">
                            <h2 className="text-sm font-black text-white bg-slate-900 px-3 py-1 uppercase inline-block mb-3 print:bg-black print:text-white">3. Avaliações Técnicas (Escores)</h2>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="border border-slate-400 p-3 text-center bg-white print:border-black">
                                    <strong className="block text-xs uppercase text-slate-600 mb-1 print:text-black">ASSIST</strong>
                                    <span className="text-xl font-black text-slate-900">{lastAssist ? lastAssist.total_score : '-'}</span>
                                </div>
                                <div className="border border-slate-400 p-3 text-center bg-white print:border-black">
                                    <strong className="block text-xs uppercase text-slate-600 mb-1 print:text-black">AUDIT</strong>
                                    <span className="text-xl font-black text-slate-900">{lastAudit ? lastAudit.total_score : '-'}</span>
                                </div>
                                <div className="border border-slate-400 p-3 text-center bg-white print:border-black">
                                    <strong className="block text-xs uppercase text-slate-600 mb-1 print:text-black">PA (Enf.)</strong>
                                    <span className="text-xl font-black text-slate-900">{nursing && nursing.data ? nursing.data.blood_pressure : '-'}</span>
                                </div>
                            </div>
                        </section>

                        {/* 4. MEDICAÇÃO */}
                        <section className="mb-6 break-inside-avoid">
                            <h2 className="text-sm font-black text-white bg-slate-900 px-3 py-1 uppercase inline-block mb-3 print:bg-black print:text-white">4. Medicação em Uso</h2>
                            <table className="w-full text-sm border-collapse border border-slate-400 bg-white">
                                <thead className="bg-slate-200 print:bg-slate-200">
                                    <tr>
                                        <th className="border border-slate-400 p-2 text-left text-slate-900 print:text-black">Medicamento</th>
                                        <th className="border border-slate-400 p-2 text-left text-slate-900 print:text-black">Dosagem</th>
                                        <th className="border border-slate-400 p-2 text-center text-slate-900 print:text-black">Horário</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {medications.length > 0 ? medications.map(m => (
                                        <tr key={m.id}>
                                            <td className="border border-slate-400 p-2 font-bold text-slate-900">{m.name}</td>
                                            <td className="border border-slate-400 p-2 text-slate-900">{m.dosage}</td>
                                            <td className="border border-slate-400 p-2 text-center text-slate-900">{m.scheduled_time}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={3} className="border border-slate-400 p-2 text-center italic text-slate-500 print:text-black">Nenhuma medicação prescrita.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </section>

                        {/* 5. PRONTUÁRIO / EVOLUÇÃO RECENTE */}
                        <section className="mb-6 break-inside-avoid">
                            <h2 className="text-sm font-black text-white bg-slate-900 px-3 py-1 uppercase inline-block mb-3 print:bg-black print:text-white">5. Últimas Evoluções (Prontuário)</h2>
                            <div className="border border-slate-400 bg-white print:border-black">
                                {healthRecords.length > 0 ? healthRecords.map((rec, i) => (
                                    <div key={rec.id} className={`p-3 ${i < healthRecords.length - 1 ? 'border-b border-slate-300' : ''}`}>
                                        <div className="flex justify-between items-center mb-1">
                                            <strong className="text-xs uppercase text-slate-700">{rec.type}</strong>
                                            <span className="text-[10px] text-slate-500">{new Date(rec.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs text-slate-900 italic">{rec.content}</p>
                                    </div>
                                )) : <div className="p-3 text-center italic text-slate-500">Sem registros recentes.</div>}
                            </div>
                        </section>

                        {/* 6. OCORRÊNCIAS */}
                        <section className="mb-6 break-inside-avoid">
                            <h2 className="text-sm font-black text-white bg-slate-900 px-3 py-1 uppercase inline-block mb-3 print:bg-black print:text-white">6. Ocorrências</h2>
                            <ul className="list-disc pl-5 text-sm space-y-1 text-slate-800">
                                {occurrences.slice(0, 5).map(occ => (
                                    <li key={occ.id}>
                                        <strong className="uppercase text-xs">{new Date(occ.created_at).toLocaleDateString()}:</strong> {occ.title} ({occ.severity})
                                    </li>
                                ))}
                                {occurrences.length === 0 && <li className="italic text-slate-500 list-none">Nenhuma intercorrência no período.</li>}
                            </ul>
                        </section>

                        {/* 7. PARECER TÉCNICO */}
                        <section className="mb-8 break-inside-avoid">
                            <h2 className="text-sm font-black text-white bg-slate-900 px-3 py-1 uppercase inline-block mb-3 print:bg-black print:text-white">7. Parecer Técnico Conclusivo</h2>
                            <textarea
                                className="w-full h-32 border border-slate-300 p-3 text-sm text-slate-900 resize-none outline-none print:border-none print:p-0 print:h-auto font-medium bg-transparent"
                                placeholder="Digite aqui a conclusão técnica para impressão..."
                                value={technicalOpinion}
                                onChange={e => setTechnicalOpinion(e.target.value)}
                            />
                        </section>

                        {/* ASSINATURAS */}
                        <div className="grid grid-cols-2 gap-12 mt-12 pt-8 break-inside-avoid">
                            <div className="border-t border-slate-500 text-center pt-2 print:border-black">
                                <p className="font-bold text-sm uppercase text-slate-900 print:text-black">{patient.name}</p>
                                <p className="text-xs text-slate-600 print:text-black">Acolhido</p>
                            </div>
                            <div className="border-t border-slate-500 text-center pt-2 print:border-black">
                                <p className="font-bold text-sm uppercase text-slate-900 print:text-black">Responsável Técnico</p>
                                <p className="text-xs text-slate-600 print:text-black">Carimbo / Assinatura</p>
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
