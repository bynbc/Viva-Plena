import React, { useState } from 'react';
import {
    FileText, Users, TrendingUp, DollarSign,
    Printer, Calendar, Activity, Pill, AlertTriangle,
    BarChart3, PieChart, Package, CheckCircle2
} from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell, PieChart as RePieChart, Pie } from 'recharts';
import GovernmentReport from './GovernmentReport'; // Integrating the detailed report

type ReportTab = 'overview' | 'clinical' | 'financial' | 'stock' | 'government';

const Reports: React.FC = () => {
    const { brain } = useBrain();
    const [activeTab, setActiveTab] = useState<ReportTab>('overview');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // --- DATA HELPERS ---
    const activePatients = brain.patients.filter(p => p.status === 'active');

    // Occupancy
    const capacity = brain.clinic?.patient_limit || 20; // Default capacity if not set
    const occupancyRate = (activePatients.length / capacity) * 100;

    // Financial Data for Charts
    const financialData = brain.transactions?.reduce((acc: any[], t) => {
        const existing = acc.find(i => i.name === t.category);
        if (existing) {
            existing.value += Number(t.amount);
        } else {
            acc.push({ name: t.category, value: Number(t.amount) });
        }
        return acc;
    }, []) || [];

    // Demographic (Gender)
    const genderData = activePatients.reduce((acc: any[], p) => {
        const gender = p.gender || p.sex || 'Não Informado';
        const existing = acc.find(i => i.name === gender);
        if (existing) existing.value++;
        else acc.push({ name: gender, value: 1 });
        return acc;
    }, []);

    const COLORS = ['#818cf8', '#34d399', '#f472b6', '#fbbf24', '#a78bfa'];

    return (
        <div className="space-y-6 pb-24 animate-in fade-in">
            {/* HEADER & TABS */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8 print:hidden">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Central de Inteligência</h1>
                    <p className="text-slate-500 font-bold">Relatórios, Indicadores e Gestão Estratégica</p>
                </div>

                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto max-w-full">
                    {[
                        { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
                        { id: 'clinical', label: 'Clínico', icon: Activity },
                        { id: 'government', label: 'Governamental', icon: FileText },
                        { id: 'financial', label: 'Financeiro', icon: DollarSign },
                        { id: 'stock', label: 'Estoque', icon: Package },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as ReportTab)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
                                }`}
                        >
                            <tab.icon size={16} /> <span className="hidden md:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="min-h-[500px]">

                {/* --- TAB: OVERVIEW --- */}
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* KPI 1: Pacientes Ativos */}
                            <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase">Acolhidos Ativos</p>
                                    <p className="text-3xl font-black text-slate-800 mt-1">{activePatients.length}</p>
                                </div>
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Users size={24} /></div>
                            </div>

                            {/* KPI 2: Taxa de Ocupação */}
                            <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase">Taxa de Ocupação</p>
                                    <div className="flex items-end gap-2 mt-1">
                                        <p className={`text-3xl font-black ${occupancyRate > 90 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                            {occupancyRate.toFixed(0)}%
                                        </p>
                                        <span className="text-[10px] font-bold text-slate-400 mb-1">/ {capacity} vagas</span>
                                    </div>
                                </div>
                                <div className={`p-3 rounded-2xl ${occupancyRate > 90 ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                    <Activity size={24} />
                                </div>
                            </div>

                            {/* KPI 3: Ocorrências Abertas */}
                            <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase">Ocorrências Abertas</p>
                                    <p className="text-3xl font-black text-rose-500 mt-1">
                                        {brain.occurrences.filter(o => o.status === 'open').length}
                                    </p>
                                </div>
                                <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl"><AlertTriangle size={24} /></div>
                            </div>

                            {/* KPI 4: Estoque Crítico */}
                            <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase">Estoque Crítico</p>
                                    <p className="text-3xl font-black text-amber-500 mt-1">
                                        {brain.inventory.filter(i => i.quantity <= (i.min_threshold || 5)).length}
                                    </p>
                                </div>
                                <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl"><Package size={24} /></div>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                                <h3 className="text-sm font-black text-slate-700 uppercase mb-6">Distribuição Financeira (Categorias)</h3>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={financialData.slice(0, 5)} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fontWeight: 700 }} />
                                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                            <Bar dataKey="value" fill="#818cf8" radius={[0, 4, 4, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                                <h3 className="text-sm font-black text-slate-700 uppercase mb-6">Demografia (Gênero)</h3>
                                <div className="h-[300px] w-full flex justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RePieChart>
                                            <Pie
                                                data={genderData}
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {genderData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </RePieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB: CLINICAL (Government Report Integrated) --- */}
                {activeTab === 'clinical' && (
                    <div className="animate-in slide-in-from-right-4">
                        <div className="bg-indigo-50 p-4 rounded-2xl mb-6 border border-indigo-100 flex items-center gap-3">
                            <Printer className="text-indigo-600" />
                            <div>
                                <h3 className="font-bold text-indigo-900 text-sm">Central de Relatórios Clínicos</h3>
                                <p className="text-xs text-indigo-700">Gere relatórios técnicos completos (PTI, Prontuário, Ocorrências) para impressão.</p>
                            </div>
                        </div>
                        <GovernmentReport />
                    </div>
                )}

                {/* --- TAB: FINANCIAL --- */}
                {activeTab === 'financial' && (
                    <div className="glass-card p-8 rounded-[32px] animate-in slide-in-from-right-4">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-white">Detalhamento Financeiro</h3>
                            <div className="flex gap-2">
                                <div className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    <span className="text-[10px] uppercase font-bold block">Receitas</span>
                                    <span className="text-lg font-black">{brain.transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                </div>
                                <div className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                    <span className="text-[10px] uppercase font-bold block">Despesas</span>
                                    <span className="text-lg font-black">{brain.transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-300">
                                <thead className="text-xs uppercase bg-white/5 text-slate-400">
                                    <tr>
                                        <th className="px-6 py-3 rounded-l-xl">Data</th>
                                        <th className="px-6 py-3">Descrição</th>
                                        <th className="px-6 py-3">Categoria</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right rounded-r-xl">Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {brain.transactions.slice(0, 15).map((t) => (
                                        <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-medium">{new Date(t.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">{t.description}</td>
                                            <td className="px-6 py-4"><span className="px-2 py-1 rounded-lg bg-white/10 text-xs">{t.category}</span></td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${t.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                                                        t.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                                                            'bg-rose-500/20 text-rose-400'
                                                    }`}>
                                                    {t.status === 'paid' ? 'Pago' : t.status === 'pending' ? 'Pendente' : 'Atrasado'}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 text-right font-black ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {t.type === 'expense' ? '- ' : '+ '}
                                                {Number(t.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {brain.transactions.length === 0 && <p className="text-center py-10 text-slate-500">Nenhuma transação registrada.</p>}
                        </div>
                    </div>
                )}

                {/* --- TAB: STOCK --- */}
                {activeTab === 'stock' && (
                    <div className="glass-card p-8 rounded-[32px] animate-in slide-in-from-right-4">
                        <h3 className="font-black text-white text-lg mb-6">Itens com Estoque Baixo</h3>
                        <div className="space-y-3">
                            {brain.inventory.filter(i => i.quantity <= (i.min_threshold || 5)).map(item => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle size={18} className="text-amber-400" />
                                        <span className="font-bold text-slate-200">{item.name}</span>
                                    </div>
                                    <span className="font-black text-amber-400">{item.quantity} {item.unit}</span>
                                </div>
                            ))}
                            {brain.inventory.filter(i => i.quantity <= (i.min_threshold || 5)).length === 0 && (
                                <p className="text-center text-slate-500 py-10 font-bold">Nenhum item em estado crítico.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* --- TAB: GOVERNMENT (MDS/AUDIT) --- */}
                {activeTab === 'government' && (
                    <div className="space-y-6 animate-in slide-in-from-right-4">

                        {/* --- SCREEN VIEW (DASHBOARD - SIMPLIFIED) --- */}
                        <div className="print:hidden space-y-6">
                            <div className="flex justify-between items-center bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800">Painel Governamental (MDS)</h2>
                                    <p className="text-slate-500 font-bold">Resumo Executivo para Gestão</p>
                                </div>
                                <button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase text-xs hover:bg-slate-700 transition-colors flex items-center gap-2">
                                    <Printer size={16} /> Imprimir Relatório Detalhado
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                                    <p className="text-xs font-black text-slate-400 uppercase">Atendimentos</p>
                                    <p className="text-4xl font-black text-slate-800 mt-2">{brain.patients.length}</p>
                                </div>
                                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                                    <p className="text-xs font-black text-slate-400 uppercase">Ocorrências</p>
                                    <p className="text-4xl font-black text-rose-500 mt-2">{brain.occurrences.length}</p>
                                </div>
                                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                                    <p className="text-xs font-black text-slate-400 uppercase">Reincidência</p>
                                    <p className="text-4xl font-black text-indigo-500 mt-2">
                                        {(() => {
                                            const cpfs = brain.patients.map(p => p.cpf).filter(c => c && c.length > 5);
                                            const uniqueCpfs = new Set(cpfs);
                                            return cpfs.length - uniqueCpfs.size;
                                        })()}
                                    </p>
                                </div>
                                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                                    <p className="text-xs font-black text-slate-400 uppercase">Custo Médio</p>
                                    <p className="text-xl font-black text-emerald-600 mt-2">
                                        {(financialData.reduce((acc, i) => acc + i.value, 0) / (activePatients.length || 1)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </p>
                                </div>
                            </div>

                            <div className="glass-card p-6 rounded-[24px]">
                                <h3 className="font-bold text-white mb-4">Resumo de Ocorrências</h3>
                                <div className="space-y-2">
                                    {brain.occurrences.slice(0, 3).map(occ => (
                                        <div key={occ.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                            <span className="text-xs text-slate-300 font-bold">{new Date(occ.created_at).toLocaleDateString()}</span>
                                            <span className="text-sm font-medium text-white">{occ.title}</span>
                                            <span className={`text-[10px] px-2 py-1 rounded bg-white/10 uppercase ${occ.severity === 'high' ? 'text-rose-400' : 'text-emerald-400'
                                                }`}>{occ.severity}</span>
                                        </div>
                                    ))}
                                    <p className="text-xs text-center text-slate-500 mt-2 italic">
                                        Use a impressão para ver todos os detalhes.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* --- PRINT VIEW (DETAILED REPORT - HIDDEN ON SCREEN) --- */}
                        <div className="hidden print:block print-area bg-white text-slate-900 p-8 rounded-[32px] shadow-lg print:shadow-none print:bg-white print:text-black print:border print:border-black print:w-full print:max-w-none print:m-0">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-widest text-slate-900">Relatório Oficial de Gestão</h2>
                                    <p className="text-slate-500 font-medium mt-1">Ministério do Desenvolvimento Social / Conselhos</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-500 uppercase">Período de Análise</p>
                                    <p className="font-black text-xl text-slate-900">{startDate ? new Date(startDate).toLocaleDateString() : 'Início'} - {endDate ? new Date(endDate).toLocaleDateString() : 'Hoje'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                                {/* METRIC: Atendimentos */}
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 print:border-black">
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Total de Atendimentos</p>
                                    <p className="text-3xl font-black mt-1 text-slate-900">{brain.patients.length}</p>
                                </div>

                                {/* METRIC: Tempo Médio */}
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 print:border-black">
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Tempo Médio (Dias)</p>
                                    <p className="text-3xl font-black mt-1 text-slate-900">
                                        {(() => {
                                            const exited = brain.patients.filter(p => p.exit_date && p.entry_date);
                                            if (exited.length === 0) return 0;
                                            const totalDays = exited.reduce((acc, p) => {
                                                const start = new Date(p.entry_date!);
                                                const end = new Date(p.exit_date!);
                                                return acc + (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
                                            }, 0);
                                            return Math.round(totalDays / exited.length);
                                        })()}
                                    </p>
                                </div>

                                {/* METRIC: Taxa de Alta */}
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 print:border-black">
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Taxa de Alta (%)</p>
                                    <p className="text-3xl font-black mt-1 text-emerald-600">
                                        {(() => {
                                            const discharged = brain.patients.filter(p => p.status === 'discharged').length; // discharged or alta
                                            const totalExits = brain.patients.filter(p => ['discharged', 'evaded', 'deceased', 'alta', 'evasão'].includes(p.status)).length;
                                            if (totalExits === 0) return 0;
                                            return Math.round((discharged / totalExits) * 100);
                                        })()}%
                                    </p>
                                </div>

                                {/* METRIC: Reincidência */}
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 print:border-black">
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Reincidência</p>
                                    <p className="text-3xl font-black mt-1 text-rose-600">
                                        {(() => {
                                            const cpfs = brain.patients.map(p => p.cpf).filter(c => c && c.length > 5);
                                            const uniqueCpfs = new Set(cpfs);
                                            return cpfs.length - uniqueCpfs.size;
                                        })()}
                                    </p>
                                </div>
                            </div>

                            {/* DETAILED LISTS FOR PRINT ONLY */}
                            <div className="space-y-4 mb-8">
                                <h3 className="text-sm font-bold uppercase border-b border-black pb-1">Detalhamento de Ocorrências</h3>
                                {brain.occurrences.length > 0 ? (
                                    <table className="w-full text-xs text-left border-collapse">
                                        <thead>
                                            <tr>
                                                <th className="border border-black p-1">Data</th>
                                                <th className="border border-black p-1">Acolhido</th>
                                                <th className="border border-black p-1">Título</th>
                                                <th className="border border-black p-1">Descrição</th>
                                                <th className="border border-black p-1">Gravidade</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {brain.occurrences.map(occ => (
                                                <tr key={occ.id}>
                                                    <td className="border border-black p-1">{new Date(occ.created_at).toLocaleDateString()}</td>
                                                    <td className="border border-black p-1">{occ.patient_name}</td>
                                                    <td className="border border-black p-1">{occ.title}</td>
                                                    <td className="border border-black p-1">{occ.description}</td>
                                                    <td className="border border-black p-1 uppercase">{occ.severity}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : <p className="text-xs italic">Nenhuma ocorrência registrada.</p>}
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-200 print:border-black">
                                <h3 className="text-sm font-bold uppercase mb-4 text-slate-800">Custo per Capita (Estimado)</h3>
                                <div className="flex gap-4 items-end">
                                    <p className="text-4xl font-black text-slate-900">
                                        {(financialData.reduce((acc, i) => acc + i.value, 0) / (activePatients.length || 1)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </p>
                                    <span className="text-xs text-slate-500 mb-2 font-bold uppercase">/ Paciente Ativo</span>
                                </div>
                            </div>

                            <div className="mt-12 text-center text-xs uppercase font-bold text-slate-900">
                                Documento Gerado Automaticamente pelo Sistema Vida Plena
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Reports;
