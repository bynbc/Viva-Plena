import React, { useMemo } from 'react';
import { 
  Users, DollarSign, Activity, Calendar, ArrowUpRight, 
  ArrowDownRight, Clock, Pill, CheckCircle2 
} from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const { brain, navigate } = useBrain();

  // 1. CÁLCULOS REAIS (O Cérebro da Dashboard)
  const stats = useMemo(() => {
    // Financeiro
    const revenue = brain.transactions
      .filter(t => t.type === 'income' && t.status === 'paid')
      .reduce((acc, t) => acc + Number(t.amount), 0);
    
    const expenses = brain.transactions
      .filter(t => t.type === 'expense' && t.status === 'paid')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    // Pacientes
    const activePatients = brain.patients.filter(p => p.status === 'active').length;

    // AGENDA UNIFICADA (Mistura Remédios + Compromissos)
    const today = new Date().toISOString().split('T')[0];
    
    // Pega remédios pendentes
    const medTasks = brain.medications
      .filter(m => m.status === 'pending') // ou m.status === 'delayed'
      .map(m => ({
        id: m.id,
        type: 'medication',
        title: `${m.name} - ${m.dosage}`,
        time: m.scheduled_time,
        patient: m.patient_name,
        status: m.status
      }));

    // Pega eventos da agenda (se tiver filtro de data, aplicaria aqui)
    const agendaTasks = brain.agenda.map(a => ({
      id: a.id,
      type: 'event',
      title: a.title,
      time: a.start_at.split('T')[1]?.substring(0, 5) || '00:00', // Pega HH:mm se for ISO
      patient: a.patient_name,
      status: 'scheduled'
    }));

    // Junta e ordena por horário
    const combinedAgenda = [...medTasks, ...agendaTasks].sort((a, b) => 
      a.time.localeCompare(b.time)
    );

    return { revenue, expenses, activePatients, combinedAgenda };
  }, [brain.transactions, brain.patients, brain.medications, brain.agenda]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* CABEÇALHO */}
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Visão Geral</h1>
        <p className="text-lg text-slate-500 font-medium">Bom dia, {brain.session.user?.username || 'Gestor'}. A operação está rodando.</p>
      </header>

      {/* CARDS DE KPI (Números Reais) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Receita */}
        <div className="glass p-6 rounded-[32px] border border-white/50 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
            <DollarSign size={80} />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
              <DollarSign size={20} />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Caixa Atual</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900">
            {stats.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </h2>
          <div className="mt-2 flex items-center gap-2 text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-lg">
            <ArrowUpRight size={14} />
            <span className="text-[10px] font-bold uppercase">Entradas confirmadas</span>
          </div>
        </div>

        {/* Card 2: Pacientes */}
        <div 
          onClick={() => navigate('patients')}
          className="glass p-6 rounded-[32px] border border-white/50 relative overflow-hidden group cursor-pointer hover:border-indigo-200 transition-colors"
        >
          <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
            <Users size={80} />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
              <Users size={20} />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Ocupação</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900">
            {stats.activePatients} <span className="text-lg text-slate-400 font-medium">/ {brain.plan.limits.patients}</span>
          </h2>
          <div className="mt-2 text-slate-400 text-xs font-bold pl-1">
            Pacientes ativos na unidade
          </div>
        </div>

        {/* Card 3: Pendências (Agenda + Medicação) */}
        <div className="glass p-6 rounded-[32px] border border-white/50 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
            <Activity size={80} />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-rose-100 rounded-2xl text-rose-600">
              <Activity size={20} />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Pendências Hoje</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900">
            {stats.combinedAgenda.length}
          </h2>
          <div className="mt-2 text-slate-400 text-xs font-bold pl-1">
            Medicações e eventos aguardando
          </div>
        </div>
      </div>

      {/* SEÇÃO INFERIOR: GRÁFICO E AGENDA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* AGENDA INTELIGENTE (Lista Mista) */}
        <div className="lg:col-span-1 glass p-8 rounded-[40px] border border-white/50">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900">Agenda do Dia</h3>
            <div className="p-2 bg-slate-100 rounded-xl">
              <Calendar size={18} className="text-slate-500" />
            </div>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {stats.combinedAgenda.length === 0 ? (
              <div className="text-center py-10 opacity-50">
                <CheckCircle2 size={40} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-bold text-slate-400">Tudo limpo por hoje!</p>
              </div>
            ) : (
              stats.combinedAgenda.map((item, i) => (
                <div key={`${item.type}-${item.id}-${i}`} className="flex items-start gap-4 p-4 bg-white/50 rounded-2xl border border-white hover:bg-white transition-colors group">
                  <div className={`mt-1 p-2 rounded-xl ${item.type === 'medication' ? 'bg-indigo-100 text-indigo-600' : 'bg-orange-100 text-orange-600'}`}>
                    {item.type === 'medication' ? <Pill size={16} /> : <Calendar size={16} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-slate-400" />
                      <span className="text-xs font-black text-slate-900">{item.time}</span>
                    </div>
                    <h4 className="font-bold text-slate-700 leading-tight mt-1">{item.title}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{item.patient || 'Geral'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* GRÁFICO (Cenográfico por enquanto, mas ocupa espaço) */}
        <div className="lg:col-span-2 glass p-8 rounded-[40px] border border-white/50 flex flex-col justify-between">
           <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">Fluxo Financeiro</h3>
                <p className="text-sm font-medium text-slate-400">Desempenho dos últimos 7 dias</p>
              </div>
              <button 
                onClick={() => navigate('finance')}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors"
              >
                Ver Detalhes
              </button>
           </div>

           <div className="h-[300px] w-full mt-4">
             {/* Usamos dados mockados no gráfico para manter o visual bonito, já que histórico financeiro requer queries complexas */}
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={brain.chartData}>
                 <defs>
                   <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                     <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} dy={10} />
                 <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)'}}
                    itemStyle={{color: '#0f172a', fontWeight: 800}}
                 />
                 <Area type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorValor)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;