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
    const totalCapacity = brain.plan?.limits?.patients || 20; // Pega do plano ou fallback
    const activePatients = brain.patients.filter(p => p.status === 'active').length;
    const vacancies = Math.max(0, totalCapacity - activePatients); // Garante que não dê negativo
    
    // --- MOVIMENTAÇÃO (Altas e Evasões) ---
    // Nota: Isso depende do status estar atualizado no banco
    const evasions = brain.patients.filter(p => p.status === 'evaded' || (p as any).status === 'evasão').length;
    const discharges = brain.patients.filter(p => p.status === 'discharged' || (p as any).status === 'alta').length;

    // --- ALERTAS CRÍTICOS (Medicação Atrasada + Ocorrências Graves Abertas) ---
    const delayedMeds = brain.medications.filter(m => {
        if (m.status === 'administered') return false;
        const [h, min] = m.scheduled_time.split(':').map(Number);
        const sched = new Date(); sched.setHours(h, min, 0, 0);
        const now = new Date();
        return now.getTime() - sched.getTime() > 15 * 60000; // 15 min de tolerância
    });

    const criticalOccurrences = brain.occurrences.filter(o => 
        o.status === 'open' && (o.severity === 'Crítica' || o.severity === 'Grave' || o.severity === 'critical')
    );

    // --- AGENDA UNIFICADA ---
    const today = new Date().toISOString().split('T')[0];
    
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
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Painel de Controle</h1>
          <p className="text-lg text-slate-500 font-medium">Visão geral da unidade.</p>
        </div>
        
        {/* BOTÃO RÁPIDO PARA RELATÓRIOS (Pedido do Julian) */}
        <button 
            onClick={() => navigate('reports')}
            className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-3 rounded-2xl text-xs font-black uppercase text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm"
        >
            <FileBarChart size={18} />
            Relatórios Convênios
        </button>
      </header>

      {/* ÁREA DE ALERTAS (Se houver) */}
      {stats.alerts.length > 0 && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-[24px] flex items-start gap-4 animate-pulse">
              <div className="bg-rose-100 p-2 rounded-xl text-rose-600 shrink-0">
                  <AlertTriangle size={24} />
              </div>
              <div>
                  <h3 className="font-black text-rose-700 text-sm uppercase tracking-wide">Atenção Necessária</h3>
                  <p className="text-rose-600 text-xs mt-1 font-medium">
                      Existem <strong>{stats.alerts.length} pendências críticas</strong> (Medicações atrasadas ou ocorrências graves) que precisam de intervenção imediata.
                  </p>
              </div>
              <button onClick={() => navigate('occurrences')} className="ml-auto text-xs font-black underline text-rose-700">Verificar</button>
          </div>
      )}

      {/* CARDS DE KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Acolhidos Ativos */}
        <div onClick={() => navigate('patients')} className="glass p-6 rounded-[32px] border border-white/50 relative overflow-hidden group cursor-pointer hover:border-emerald-200 transition-all">
          <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><Users size={80} /></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600"><Users size={20} /></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acolhidos</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900">{stats.activePatients}</h2>
          <div className="mt-2 text-slate-400 text-[10px] font-bold uppercase tracking-wide">Em tratamento ativo</div>
        </div>

        {/* Card 2: Vagas Disponíveis (NOVO) */}
        <div className="glass p-6 rounded-[32px] border border-white/50 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><BedDouble size={80} /></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-2xl text-blue-600"><BedDouble size={20} /></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vagas Livres</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900">{stats.vacancies}</h2>
          <div className="mt-2 text-slate-400 text-[10px] font-bold uppercase tracking-wide">Capacidade Total: {stats.totalCapacity}</div>
        </div>

        {/* Card 3: Saídas (Altas/Evasões) (NOVO) */}
        <div className="glass p-6 rounded-[32px] border border-white/50 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><DoorOpen size={80} /></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-100 rounded-2xl text-amber-600"><DoorOpen size={20} /></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saídas (Total)</span>
          </div>
          <div className="flex items-baseline gap-1">
             <h2 className="text-4xl font-black text-slate-900">{stats.discharges + stats.evasions}</h2>
          </div>
          <div className="mt-2 flex gap-3 text-[9px] font-black uppercase tracking-wide">
             <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Altas: {stats.discharges}</span>
             <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Evasões: {stats.evasions}</span>
          </div>
        </div>

        {/* Card 4: Financeiro (Caixa) */}
        <div onClick={() => navigate('finance')} className="glass p-6 rounded-[32px] border border-white/50 relative overflow-hidden group cursor-pointer hover:border-emerald-200 transition-all">
          <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><DollarSign size={80} /></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-slate-100 rounded-2xl text-slate-600"><DollarSign size={20} /></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Caixa Atual</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 truncate">
            {stats.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </h2>
          <div className="mt-2 flex items-center gap-2 text-emerald-600">
            <ArrowUpRight size={14} />
            <span className="text-[10px] font-bold uppercase">Entradas confirmadas</span>
          </div>
        </div>

      </div>

      {/* SEÇÃO INFERIOR: AGENDA E GRÁFICO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* AGENDA OPERACIONAL */}
        <div className="lg:col-span-1 glass p-8 rounded-[40px] border border-white/50 flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div>
                <h3 className="text-xl font-black text-slate-900">Agenda & Rotina</h3>
                <p className="text-xs font-bold text-slate-400 uppercase mt-1">Próximas atividades</p>
            </div>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Calendar size={18} />
            </div>
          </div>

          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {stats.combinedAgenda.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                <CheckCircle2 size={40} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-bold text-slate-400">Sem pendências para hoje!</p>
              </div>
            ) : (
              stats.combinedAgenda.map((item, i) => (
                <div key={`${item.type}-${item.id}-${i}`} className="flex items-center gap-4 p-4 bg-white/60 rounded-2xl border border-white hover:bg-white transition-all shadow-sm group">
                  <div className={`shrink-0 p-3 rounded-xl flex items-center justify-center ${
                      item.type === 'medication' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {item.type === 'medication' ? <Pill size={18} /> : <Calendar size={18} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-slate-400 mb-0.5">
                      <Clock size={10} />
                      <span className="text-[10px] font-black uppercase tracking-wide">{item.time}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm leading-tight truncate">{item.title}</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5 truncate">{item.patient || 'Geral'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* GRÁFICO FINANCEIRO */}
        <div className="lg:col-span-2 glass p-8 rounded-[40px] border border-white/50 flex flex-col h-[500px]">
           <div className="flex justify-between items-start mb-6 shrink-0">
              <div>
                <h3 className="text-xl font-black text-slate-900">Desempenho Financeiro</h3>
                <p className="text-xs font-bold text-slate-400 uppercase mt-1">Entradas vs Saídas (Últimos 6 meses)</p>
              </div>
              <button 
                onClick={() => navigate('finance')}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-lg"
              >
                Gerenciar Caixa
              </button>
           </div>

           <div className="flex-1 w-full min-h-0">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={brain.chartData}>
                 <defs>
                   <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                     <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                 <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} 
                    dy={10} 
                 />
                 <Tooltip 
                    contentStyle={{
                        borderRadius: '16px', 
                        border: 'none', 
                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
                        padding: '12px 16px',
                        fontFamily: 'Inter, sans-serif'
                    }}
                    itemStyle={{color: '#0f172a', fontWeight: 800, fontSize: '12px'}}
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                 />
                 <Area 
                    type="monotone" 
                    dataKey="valor" 
                    stroke="#10b981" 
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
