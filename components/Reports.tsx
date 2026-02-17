import React, { useState } from 'react';
import {
    FileText, Users, TrendingUp, DollarSign,
    Printer, Calendar, Activity, Pill, AlertTriangle,
    BarChart3, PieChart, Package, CheckCircle2
} from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell, PieChart as RePieChart, Pie } from 'recharts';
import GovernmentReport from './GovernmentReport'; // Integrating the detailed report

type ReportTab = 'overview' | 'clinical' | 'financial' | 'stock';

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

                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    {[
                        { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
                        { id: 'clinical', label: 'Clínico & Pacientes', icon: Activity },
                        { id: 'financial', label: 'Financeiro', icon: DollarSign },
                        { id: 'stock', label: 'Estoque', icon: Package },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as ReportTab)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase transition-all ${activeTab === tab.id
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
                    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm animate-in slide-in-from-right-4">
                        <div className="text-center py-20 text-slate-300">
                            <DollarSign size={48} className="mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-black text-slate-400">Detalhamento Financeiro</h3>
                            <p className="font-bold uppercase mt-2 text-sm">Funcionalidade de expansão em desenvolvimento.</p>
                            <p className="text-xs text-slate-400 mt-1">Use a aba "Visão Geral" para indicadores chave.</p>
                        </div>
                    </div>
                )}

                {/* --- TAB: STOCK --- */}
                {activeTab === 'stock' && (
                    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm animate-in slide-in-from-right-4">
                        <h3 className="font-black text-slate-800 text-lg mb-6">Itens com Estoque Baixo</h3>
                        <div className="space-y-3">
                            {brain.inventory.filter(i => i.quantity <= (i.min_threshold || 5)).map(item => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle size={18} className="text-amber-500" />
                                        <span className="font-bold text-slate-700">{item.name}</span>
                                    </div>
                                    <span className="font-black text-amber-600">{item.quantity} {item.unit}</span>
                                </div>
                            ))}
                            {brain.inventory.filter(i => i.quantity <= (i.min_threshold || 5)).length === 0 && (
                                <p className="text-center text-slate-400 py-10 font-bold">Nenhum item em estado crítico.</p>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Reports;
