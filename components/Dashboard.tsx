import React, { useMemo, useState, useEffect } from 'react';
import {
  Users, DollarSign, Calendar, ArrowUpRight,
  Clock, Pill, CheckCircle2, BedDouble,
  DoorOpen, AlertTriangle, FileBarChart, Heart, Activity
} from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Dashboard: React.FC = () => {
  const { brain, navigate } = useBrain();
  const [greeting, setGreeting] = useState('');
  const [quote, setQuote] = useState('');

  // 0. DYNAMIC GREETING & QUOTES
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');

    const quotes = [
      "Cada vida importa, cada detalhe conta.",
      "Hoje é um dia perfeito para fazer a diferença.",
      "A excelência no cuidado é nossa assinatura.",
      "Transformando vidas com dedicação e carinho."
    ];
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  // 1. CÁLCULOS REAIS (O Cérebro da Dashboard)
  const stats = useMemo(() => {
    // --- FINANCEIRO ---
    const revenue = brain.transactions
      .filter(t => t.type === 'income' && t.status === 'paid')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const pendingRevenue = brain.transactions
      .filter(t => t.type === 'income' && t.status === 'pending')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    // --- ACOLHIMENTO & VAGAS ---
    const totalCapacity = brain.plan?.limits?.patients || 20;
    const activePatients = brain.patients.filter(p => p.status === 'active').length;
    const vacancies = Math.max(0, totalCapacity - activePatients);

    // --- MOVIMENTAÇÃO ---
    const evasions = brain.patients.filter(p => p.status === 'evaded' || (p as any).status === 'evasão').length;
    const discharges = brain.patients.filter(p => p.status === 'discharged' || (p as any).status === 'alta').length;

    // --- ALERTAS CRÍTICOS ---
    const delayedMeds = brain.medications.filter(m => {
      if (m.status === 'administered') return false;
      const [h, min] = m.scheduled_time.split(':').map(Number);
      const sched = new Date(); sched.setHours(h, min, 0, 0);
      const now = new Date();
      return now.getTime() - sched.getTime() > 15 * 60000;
    });

    const criticalOccurrences = brain.occurrences.filter(o =>
      o.status === 'open' && (o.severity === 'CRITICAL' || o.severity === 'Crítica' || (o.severity as string) === 'critical')
    );

    // --- AGENDA UNIFICADA ---
    const medTasks = brain.medications
      .filter(m => m.status === 'pending')
      .map(m => ({
        id: m.id, type: 'medication', title: `${m.name} - ${m.dosage}`,
        time: m.scheduled_time, patient: m.patient_name, status: m.status
      }));

    const agendaTasks = brain.agenda.map(a => ({
      id: a.id, type: 'event', title: a.title,
      time: a.start_at.split('T')[1]?.substring(0, 5) || '00:00',
      patient: a.patient_name, status: 'scheduled'
    }));

    const combinedAgenda = [...medTasks, ...agendaTasks].sort((a, b) =>
      a.time.localeCompare(b.time)
    );

    // HEALTH SCORE (Mock Logic for Visual Impact)
    // Starts at 100, deducts for alerts/issues
    let healthScore = 100;
    if (criticalOccurrences.length > 0) healthScore -= 20;
    if (delayedMeds.length > 0) healthScore -= 10;
    if (vacancies > 5) healthScore -= 5;
    healthScore = Math.max(0, healthScore);

    return {
      revenue, pendingRevenue, activePatients, vacancies, totalCapacity,
      evasions, discharges, combinedAgenda,
      healthScore,
      alerts: [...delayedMeds, ...criticalOccurrences]
    };
  }, [brain.transactions, brain.patients, brain.medications, brain.agenda, brain.occurrences, brain.plan]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">

      {/* HERO SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 relative">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 animate-slide-up">
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest text-indigo-300 backdrop-blur-md">
              Visão Geral
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-400 backdrop-blur-md flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-xl animate-slide-up" style={{ animationDelay: '100ms' }}>
            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">{brain.session.user?.username || 'Colega'}</span>
          </h1>
          <p className="text-lg text-indigo-200/80 font-medium max-w-lg animate-slide-up" style={{ animationDelay: '200ms' }}>
            {quote}
          </p>
        </div>

        {/* CLINICAL PULSE WIDGET */}
        <div className="glass-card p-6 rounded-[32px] flex items-center gap-6 animate-slide-up md:min-w-[300px]" style={{ animationDelay: '300ms' }}>
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="none" />
              <circle
                cx="40" cy="40" r="36"
                stroke={stats.healthScore > 80 ? '#10b981' : stats.healthScore > 50 ? '#f59e0b' : '#f43f5e'}
                strokeWidth="6" fill="none"
                strokeDasharray="226"
                strokeDashoffset={226 - (226 * stats.healthScore) / 100}
                style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white">{stats.healthScore}%</span>
            </div>
          </div>
          <div>
            <h3 className="text-base font-black text-white">Saúde da Clínica</h3>
            <p className="text-xs text-slate-400 font-bold uppercase mt-1">Status Operacional</p>
            <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-emerald-400">
              <Activity size={12} />
              <span>{stats.healthScore > 80 ? 'Excelente' : 'Requer Atenção'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ÁREA DE ALERTAS */}
      {stats.alerts.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-6 rounded-[32px] flex items-center gap-4 animate-pulse-soft backdrop-blur-md relative overflow-hidden group cursor-pointer" onClick={() => navigate('occurrences')}>
          <div className="absolute inset-0 bg-rose-500/5 group-hover:bg-rose-500/10 transition-colors" />
          <div className="bg-rose-500/20 p-3 rounded-2xl text-rose-400 shrink-0 relative z-10">
            <AlertTriangle size={32} />
          </div>
          <div className="relative z-10">
            <h3 className="font-black text-rose-400 text-lg uppercase tracking-wide">Atenção Necessária</h3>
            <p className="text-rose-200 text-sm mt-1 font-medium">
              Existem <strong>{stats.alerts.length} pendências críticas</strong> (Atrasos ou Ocorrências) que precisam de intervenção.
            </p>
          </div>
          <div className="ml-auto relative z-10 bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase">Resolver</div>
        </div>
      )}

      {/* CARDS DE KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Card 1: Acolhidos */}
        <div onClick={() => navigate('patients')} className="glass-card p-6 rounded-[32px] relative overflow-hidden group cursor-pointer hover:border-emerald-500/50">
          <div className="absolute right-0 top-0 p-6 opacity-[0.05] group-hover:scale-110 transition-transform duration-500"><Users size={100} className="text-white" /></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400 ring-1 ring-emerald-500/30"><Users size={20} /></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acolhidos</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight">{stats.activePatients}</h2>
          <div className="mt-2 text-slate-400 text-[10px] font-bold uppercase tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Em tratamento ativo
          </div>
        </div>

        {/* Card 2: Vagas */}
        <div className="glass-card p-6 rounded-[32px] relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-6 opacity-[0.05] group-hover:scale-110 transition-transform duration-500"><BedDouble size={100} className="text-white" /></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400 ring-1 ring-blue-500/30"><BedDouble size={20} /></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vagas Livres</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight">{stats.vacancies}</h2>
          <div className="mt-2 text-slate-400 text-[10px] font-bold uppercase tracking-wide">
            Capacidade Total: <span className="text-white">{stats.totalCapacity}</span>
          </div>
        </div>

        {/* Card 3: Saídas */}
        <div className="glass-card p-6 rounded-[32px] relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-6 opacity-[0.05] group-hover:scale-110 transition-transform duration-500"><DoorOpen size={100} className="text-white" /></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-400 ring-1 ring-amber-500/30"><DoorOpen size={20} /></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saídas (Total)</span>
          </div>
          <div className="flex items-baseline gap-1">
            <h2 className="text-4xl font-black text-white tracking-tight">{stats.discharges + stats.evasions}</h2>
          </div>
          <div className="mt-2 flex gap-2 text-[9px] font-black uppercase tracking-wide">
            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">Altas: {stats.discharges}</span>
            <span className="text-rose-400 bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20">Evasões: {stats.evasions}</span>
          </div>
        </div>

        {/* Card 4: Financeiro */}
        <div onClick={() => navigate('finance')} className="glass-card p-6 rounded-[32px] relative overflow-hidden group cursor-pointer hover:border-indigo-500/50">
          <div className="absolute right-0 top-0 p-6 opacity-[0.05] group-hover:scale-110 transition-transform duration-500"><DollarSign size={100} className="text-white" /></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400 ring-1 ring-indigo-500/30"><DollarSign size={20} /></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Caixa Atual</span>
          </div>
          <h2 className="text-3xl font-black text-white truncate tracking-tight text-glow">
            {stats.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </h2>
          <div className="mt-2 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-emerald-400">
              <ArrowUpRight size={14} />
              <span className="text-[10px] font-bold uppercase">Entradas confirmadas</span>
            </div>
            {stats.pendingRevenue > 0 && (
              <div className="flex items-center gap-2 text-amber-400 animate-pulse">
                <Clock size={14} />
                <span className="text-[10px] font-bold uppercase">
                  + {stats.pendingRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} Pendente
                </span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* SEÇÃO INFERIOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* AGENDA OPERACIONAL */}
        <div className="lg:col-span-1 glass-card p-8 rounded-[40px] flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div>
              <h3 className="text-xl font-black text-white">Agenda & Rotina</h3>
              <p className="text-xs font-bold text-slate-400 uppercase mt-1">Próximas atividades</p>
            </div>
            <div className="p-2 bg-white/5 text-indigo-400 rounded-xl border border-white/10">
              <Calendar size={18} />
            </div>
          </div>

          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {stats.combinedAgenda.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                <CheckCircle2 size={40} className="mx-auto mb-3 text-white" />
                <p className="text-sm font-bold text-white">Sem pendências para hoje!</p>
              </div>
            ) : (
              stats.combinedAgenda.map((item, i) => (
                <div key={`${item.type}-${item.id}-${i}`} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all shadow-sm group hover:-translate-y-1">
                  <div className={`shrink-0 p-3 rounded-xl flex items-center justify-center shadow-lg ${item.type === 'medication' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                    {item.type === 'medication' ? <Pill size={18} /> : <Calendar size={18} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-slate-500 mb-0.5">
                      <Clock size={10} />
                      <span className="text-[10px] font-black uppercase tracking-wide">{item.time}</span>
                    </div>
                    <h4 className="font-bold text-slate-200 text-sm leading-tight truncate group-hover:text-white transition-colors">{item.title}</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5 truncate">{item.patient || 'Geral'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* GRÁFICO FINANCEIRO */}
        <div className="lg:col-span-2 glass-card p-8 rounded-[40px] flex flex-col h-[500px]">
          <div className="flex justify-between items-start mb-6 shrink-0">
            <div>
              <h3 className="text-xl font-black text-white">Desempenho Financeiro</h3>
              <p className="text-xs font-bold text-slate-400 uppercase mt-1">Entradas vs Saídas</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('reports')}
                className="px-5 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Relatórios
              </button>
              <button
                onClick={() => navigate('finance')}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
              >
                Caixa
              </button>
            </div>
          </div>

          <div className="flex-1 w-full min-h-0 bg-white/5 rounded-3xl p-4 border border-white/5">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={brain.chartData}>
                <defs>
                  <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                  dy={10}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
                    padding: '12px 16px',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  itemStyle={{ color: '#fff', fontWeight: 800, fontSize: '12px' }}
                  cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="valor"
                  stroke="#818cf8"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorValor)"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
