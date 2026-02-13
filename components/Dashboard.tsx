import React, { useMemo } from 'react';
import {
  Users, DollarSign, Activity, Calendar, ArrowUpRight,
  ArrowDownRight, Clock, Pill, CheckCircle2, BedDouble,
  DoorOpen, AlertTriangle, FileBarChart
} from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Dashboard: React.FC = () => {
  const { brain, navigate } = useBrain();

  // 1. CÁLCULOS REAIS (O Cérebro da Dashboard)
  const stats = useMemo(() => {
    // --- FINANCEIRO ---
    const revenue = brain.transactions
      .filter(t => t.type === 'income' && t.status === 'paid')
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

    return {
      revenue, activePatients, vacancies, totalCapacity,
      evasions, discharges, combinedAgenda,
      alerts: [...delayedMeds, ...criticalOccurrences]
    };
  }, [brain.transactions, brain.patients, brain.medications, brain.agenda, brain.occurrences, brain.plan]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">

      {/* CABEÇALHO */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">Painel de Controle</h1>
          <p className="text-lg text-indigo-200 font-medium">Visão geral da unidade.</p>
        </div>

        <button
          onClick={() => navigate('reports')}
          className="flex items-center gap-2 bg-white/10 border border-white/20 px-5 py-3 rounded-2xl text-xs font-black uppercase text-indigo-100 hover:bg-white/20 hover:text-white transition-all shadow-lg backdrop-blur-md"
        >
          <FileBarChart size={18} />
          Relatórios Convênios
        </button>
      </header>

      {/* ÁREA DE ALERTAS */}
      {stats.alerts.length > 0 && (
        <div className="bg-rose-500/20 border border-rose-500/30 p-4 rounded-[24px] flex items-start gap-4 animate-pulse backdrop-blur-md">
          <div className="bg-rose-500/20 p-2 rounded-xl text-rose-400 shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="font-black text-rose-400 text-sm uppercase tracking-wide">Atenção Necessária</h3>
            <p className="text-rose-200 text-xs mt-1 font-medium">
              Existem <strong>{stats.alerts.length} pendências críticas</strong> que precisam de intervenção imediata.
            </p>
          </div>
          <button onClick={() => navigate('occurrences')} className="ml-auto text-xs font-black underline text-rose-400 hover:text-rose-200">Verificar</button>
        </div>
      )}

      {/* CARDS DE KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Card 1: Acolhidos */}
        <div onClick={() => navigate('patients')} className="glass p-6 rounded-[32px] border border-white/10 relative overflow-hidden group cursor-pointer hover:border-emerald-500/50 transition-all bg-white/5">
          <div className="absolute right-0 top-0 p-6 opacity-[0.05] group-hover:scale-110 transition-transform"><Users size={80} className="text-white" /></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400"><Users size={20} /></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acolhidos</span>
          </div>
          <h2 className="text-4xl font-black text-white">{stats.activePatients}</h2>
          <div className="mt-2 text-slate-400 text-[10px] font-bold uppercase tracking-wide">Em tratamento ativo</div>
        </div>

        {/* Card 2: Vagas */}
        <div className="glass p-6 rounded-[32px] border border-white/10 relative overflow-hidden group bg-white/5">
          <div className="absolute right-0 top-0 p-6 opacity-[0.05] group-hover:scale-110 transition-transform"><BedDouble size={80} className="text-white" /></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400"><BedDouble size={20} /></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vagas Livres</span>
          </div>
          <h2 className="text-4xl font-black text-white">{stats.vacancies}</h2>
          <div className="mt-2 text-slate-400 text-[10px] font-bold uppercase tracking-wide">Capacidade Total: {stats.totalCapacity}</div>
        </div>

        {/* Card 3: Saídas */}
        <div className="glass p-6 rounded-[32px] border border-white/10 relative overflow-hidden group bg-white/5">
          <div className="absolute right-0 top-0 p-6 opacity-[0.05] group-hover:scale-110 transition-transform"><DoorOpen size={80} className="text-white" /></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-400"><DoorOpen size={20} /></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saídas (Total)</span>
          </div>
          <div className="flex items-baseline gap-1">
            <h2 className="text-4xl font-black text-white">{stats.discharges + stats.evasions}</h2>
          </div>
          <div className="mt-2 flex gap-3 text-[9px] font-black uppercase tracking-wide">
            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Altas: {stats.discharges}</span>
            <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">Evasões: {stats.evasions}</span>
          </div>
        </div>

        {/* Card 4: Financeiro */}
        <div onClick={() => navigate('finance')} className="glass p-6 rounded-[32px] border border-white/10 relative overflow-hidden group cursor-pointer hover:border-emerald-500/50 transition-all bg-white/5">
          <div className="absolute right-0 top-0 p-6 opacity-[0.05] group-hover:scale-110 transition-transform"><DollarSign size={80} className="text-white" /></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400"><DollarSign size={20} /></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Caixa Atual</span>
          </div>
          <h2 className="text-3xl font-black text-white truncate">
            {stats.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </h2>
          <div className="mt-2 flex items-center gap-2 text-emerald-400">
            <ArrowUpRight size={14} />
            <span className="text-[10px] font-bold uppercase">Entradas confirmadas</span>
          </div>
        </div>

      </div>

      {/* SEÇÃO INFERIOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* AGENDA OPERACIONAL */}
        <div className="lg:col-span-1 glass p-8 rounded-[40px] border border-white/10 flex flex-col h-[500px] bg-white/5">
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
                <div key={`${item.type}-${item.id}-${i}`} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all shadow-sm group">
                  <div className={`shrink-0 p-3 rounded-xl flex items-center justify-center ${item.type === 'medication' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                    {item.type === 'medication' ? <Pill size={18} /> : <Calendar size={18} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-slate-500 mb-0.5">
                      <Clock size={10} />
                      <span className="text-[10px] font-black uppercase tracking-wide">{item.time}</span>
                    </div>
                    <h4 className="font-bold text-slate-200 text-sm leading-tight truncate">{item.title}</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5 truncate">{item.patient || 'Geral'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* GRÁFICO FINANCEIRO */}
        <div className="lg:col-span-2 glass p-8 rounded-[40px] border border-white/10 flex flex-col h-[500px] bg-white/5">
          <div className="flex justify-between items-start mb-6 shrink-0">
            <div>
              <h3 className="text-xl font-black text-white">Desempenho Financeiro</h3>
              <p className="text-xs font-bold text-slate-400 uppercase mt-1">Entradas vs Saídas</p>
            </div>
            <button
              onClick={() => navigate('finance')}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-colors shadow-lg"
            >
              Gerenciar Caixa
            </button>
          </div>

          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={brain.chartData}>
                <defs>
                  <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
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
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
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
                  animationDuration={1500}
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
