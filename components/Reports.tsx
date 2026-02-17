import React, { useState } from 'react';
import {
    FileText, Users, Clock, CheckCircle, TrendingUp, DollarSign,
    Printer, ArrowUpCircle, ArrowDownCircle, Calendar, Filter, X
} from 'lucide-react';
import { useBrain } from '../context/BrainContext';

const Reports: React.FC = () => {
    const { brain } = useBrain();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const isEventInRange = (dateStr: string) => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (start && date < start) return false;
        if (end && date > end) return false;
        return true;
    };

    const wasPatientActiveInPeriod = (p: any) => {
        if (!p.entry_date) return false;
        const entry = new Date(p.entry_date);
        const exit = p.exit_date ? new Date(p.exit_date) : null;
        const filterEnd = endDate ? new Date(endDate) : new Date();
        const filterStart = startDate ? new Date(startDate) : new Date(0);
        if (entry > filterEnd) return false;
        if (exit && exit < filterStart) return false;
        return true;
    };

    const patientsInPeriod = brain.patients.filter(p => wasPatientActiveInPeriod(p));
    const admissionsInPeriod = brain.patients.filter(p => p.entry_date && isEventInRange(p.entry_date)).length;
    const filteredTransactions = brain.transactions.filter(t => isEventInRange(t.date));

    const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
    const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
    const balance = totalIncome - totalExpenses;

    // ITEM 2 ZERADO CONFORME SOLICITADO
    const avgStay = 0;
    const dischargeRate = 0;
    const recidivismRate = 0;

    return (
        <div className="space-y-8 pb-24 animate-in fade-in">
            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden print-area">
                <div className="flex justify-between items-center mb-8 no-print">
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Relatório Gerencial</h1>
                    <div className="flex gap-2">
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-3 bg-slate-50 text-slate-900 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-3 bg-slate-50 text-slate-900 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                        <button onClick={() => window.print()} className="bg-slate-900 text-white px-5 py-3 rounded-xl font-bold text-xs uppercase flex items-center gap-2"><Printer size={16} /> Imprimir</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Card 1: Acolhimentos */}
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Users size={20} /></div>
                            <p className="text-xs font-black text-slate-400 uppercase">Acolhimentos no Período</p>
                        </div>
                        <p className="text-4xl font-black text-slate-800">{patientsInPeriod.length}</p>
                    </div>

                    {/* Card 2: Estoque (Novo) */}
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><CheckCircle size={20} /></div>
                            <p className="text-xs font-black text-slate-400 uppercase">Itens em Estoque</p>
                        </div>
                        <p className="text-4xl font-black text-slate-800">{brain.inventory?.length || 0}</p>
                        <p className="text-xs text-slate-400 mt-2 font-bold uppercase">
                            Críticos: {brain.inventory?.filter(i => i.quantity <= (i.min_threshold || 5)).length || 0}
                        </p>
                    </div>

                    {/* Card 3: Ocorrências (Novo) */}
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-rose-100 text-rose-600 rounded-xl"><TrendingUp size={20} /></div>
                            <p className="text-xs font-black text-slate-400 uppercase">Ocorrências</p>
                        </div>
                        <p className="text-4xl font-black text-slate-800">{brain.occurrences?.length || 0}</p>
                        <p className="text-xs text-rose-400 mt-2 font-bold uppercase">
                            Abertas: {brain.occurrences?.filter(o => o.status === 'open').length || 0}
                        </p>
                    </div>

                    {/* Card 4: Financeiro (Expandido) */}
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 md:col-span-3">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><DollarSign size={20} /></div>
                                <p className="text-xs font-black text-slate-400 uppercase">Balanço Financeiro (Período)</p>
                            </div>
                            <p className={`text-3xl font-black ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-3 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-black text-emerald-500 uppercase">Receitas: {totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>
                            <div className="bg-white p-3 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-black text-rose-500 uppercase">Despesas: {totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
