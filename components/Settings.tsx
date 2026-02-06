import React, { useState } from 'react';
import { 
  Building2, Sliders, Bell, CreditCard, Shield, Users, ChevronLeft, 
  Save, Plus, Trash2, ChevronRight, ToggleLeft, ToggleRight, Lock, 
  Search, XCircle 
} from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import { SettingsSectionType } from '../types';
import UsersManagement from './Users';

const Settings: React.FC = () => {
  const { brain, navigate, update, push, addToast } = useBrain();
  const { activeSettingsSection } = brain.ui;
  const [searchTerm, setSearchTerm] = useState(''); // <--- ESTADO DA BUSCA

  // AGORA USAMOS OS LOGS REAIS DO CONTEXTO
  const auditLogs = brain.logs || [];

  const handleSaveSetting = async (key: string, value: any) => {
    try {
      await update('settings', key, value);
    } catch (err) {
      console.error(err);
    }
  };

  const getSetting = (key: string, fallback: string) => {
    return brain.settings[key] || fallback;
  };

  // --- SE ESTIVER DENTRO DE UMA SEÇÃO (NÃO MUDA NADA AQUI) ---
  if (activeSettingsSection) {
    return (
      <div className="space-y-6 lg:space-y-10 animate-in slide-in-from-right-6 duration-700 pb-20 max-w-full overflow-hidden">
        <button 
          onClick={() => navigate('settings', null)}
          className="flex items-center gap-3 text-slate-500 hover:text-emerald-700 font-black transition-all group px-6 py-4 glass bg-white/60 rounded-[20px] border border-white/80 shadow-sm w-fit text-[10px] uppercase tracking-widest active:scale-95"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Voltar para Menu
        </button>
        
        <div className="glass bg-white/50 p-8 lg:p-14 rounded-[48px] lg:rounded-[64px] border border-white shadow-2xl backdrop-blur-3xl min-w-0 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/20 via-transparent to-emerald-500/20"></div>

          {/* --- SEÇÃO: INSTITUIÇÃO --- */}
          {activeSettingsSection === 'organization' && (
            <div className="space-y-12">
              <Header icon={Building2} title="Instituição" subtitle="Identidade jurídica da unidade" color="emerald" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 pt-4">
                <Field label="Nome Fantasia" value={getSetting('org_name', brain.organization.name)} onChange={(v: any) => handleSaveSetting('org_name', v)} />
                <Field label="Unidade Operacional" value={getSetting('org_unit', brain.organization.unit)} onChange={(v: any) => handleSaveSetting('org_unit', v)} />
                <Field label="CNPJ" value={getSetting('org_cnpj', brain.organization.cnpj)} onChange={(v: any) => handleSaveSetting('org_cnpj', v)} />
                <Field label="Sigla (Logo)" value={getSetting('org_logo', brain.organization.logo)} onChange={(v: any) => handleSaveSetting('org_logo', v)} />
              </div>
            </div>
          )}

          {/* --- SEÇÃO: OPERACIONAL --- */}
          {activeSettingsSection === 'operational' && (
            <div className="space-y-12">
              <Header icon={Sliders} title="Operacional" subtitle="Taxonomia e fluxos do VivaPlena" color="amber" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-4">
                <div className="space-y-6">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2">Categorias de Evolução</label>
                  <div className="space-y-3">
                    {(brain.settings.categories || ['Geral', 'Enfermagem', 'Psicologia']).map((cat: string, i: number) => (
                      <div key={i} className="flex items-center justify-between p-5 glass bg-white/40 border border-white rounded-2xl group/item hover:bg-white transition-all shadow-sm">
                        <span className="font-black text-xs text-slate-700">{cat}</span>
                        <button onClick={() => {
                          const current = brain.settings.categories || ['Geral', 'Enfermagem', 'Psicologia'];
                          const newCats = current.filter((_: any, idx: number) => idx !== i);
                          handleSaveSetting('categories', newCats);
                        }} className="text-rose-400 hover:text-rose-600 transition-colors p-2"><Trash2 size={18}/></button>
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        const name = prompt('Nome da nova categoria:');
                        if (name) {
                           const current = brain.settings.categories || ['Geral', 'Enfermagem', 'Psicologia'];
                           handleSaveSetting('categories', [...current, name]);
                        }
                      }}
                      className="w-full p-5 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-3 bg-slate-50/50"
                    >
                      <Plus size={18}/> Nova Categoria
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- SEÇÃO: NOTIFICAÇÕES --- */}
          {activeSettingsSection === 'notifications' && (
            <div className="space-y-12">
              <Header icon={Bell} title="Notificações" subtitle="Alertas e comunicação automática" color="indigo" />
              <div className="space-y-6 pt-4">
                <ToggleRow label="Alertas de Ocorrência Crítica" desc="Enviar e-mail para administradores quando houver risco alto." enabled={getSetting('notif_critical', true)} onToggle={(v: any) => handleSaveSetting('notif_critical', v)} />
                <ToggleRow label="Resumo Diário (Daily Brief)" desc="Receber um resumo da operação todos os dias às 08:00." enabled={getSetting('notif_daily', false)} onToggle={(v: any) => handleSaveSetting('notif_daily', v)} />
                <ToggleRow label="Lembretes de Medicação" desc="Notificar no painel quando medicação estiver atrasada +15min." enabled={getSetting('notif_meds', true)} onToggle={(v: any) => handleSaveSetting('notif_meds', v)} />
              </div>
            </div>
          )}

          {/* --- SEÇÃO: SEGURANÇA --- */}
          {activeSettingsSection === 'security' && (
            <div className="space-y-12">
              <Header icon={Shield} title="Auditoria & Logs" subtitle="Rastreabilidade e segurança" color="blue" />
              <div className="bg-white/40 rounded-[32px] border border-white overflow-hidden">
                <div className="p-6 border-b border-white/50 flex justify-between items-center">
                  <h4 className="font-black text-slate-800 text-sm">Últimas Atividades</h4>
                </div>
                <div className="divide-y divide-white/50 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {auditLogs.length === 0 ? (
                    <div className="p-10 text-center text-slate-400 text-xs font-bold uppercase">Nenhum registro encontrado.</div>
                  ) : (
                    auditLogs.map((log: any, i: number) => (
                      <div key={i} className="p-5 flex items-center justify-between hover:bg-white/60 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                            <Lock size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900">{log.action}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">{log.user} • {log.details}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-slate-400">{new Date(log.created_at).toLocaleString('pt-BR')}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* --- SEÇÃO: USUÁRIOS --- */}
          {activeSettingsSection === 'users' && <UsersManagement />}

          {/* --- SEÇÃO: PLANO --- */}
          {activeSettingsSection === 'plan' && (
            <div className="space-y-12">
              <Header icon={CreditCard} title="Assinatura" subtitle="Controle de licenças e recursos" color="slate" />
              <div className="p-10 lg:p-14 glass-white border border-white rounded-[48px] shadow-2xl relative overflow-hidden group/plan">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-[100px] rounded-full group-hover/plan:bg-emerald-500/20 transition-all duration-1000"></div>
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-8">
                    <div>
                      <h3 className="text-3xl lg:text-4xl font-black text-slate-950 tracking-tighter leading-none">Plano {brain.plan.name}</h3>
                      <p className="text-emerald-600 font-black uppercase tracking-[0.2em] text-[11px] mt-3 bg-emerald-50 w-fit px-4 py-1.5 rounded-full border border-emerald-100">{brain.plan.status}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 pt-10 border-t border-slate-100">
                    <div className="space-y-3">
                      <span className="text-[10px] font-black uppercase text-slate-400 block tracking-[0.3em]">Ocupação Atual</span>
                      <div className="flex items-baseline gap-3">
                        <span className="text-5xl lg:text-6xl font-black text-slate-950 tracking-tighter">{brain.plan.usage.patients}</span>
                        <span className="text-base font-bold text-slate-300">/ {brain.plan.limits.patients} pacientes</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <span className="text-[10px] font-black uppercase text-slate-400 block tracking-[0.3em]">Membros da Equipe</span>
                      <div className="flex items-baseline gap-3">
                        <span className="text-5xl lg:text-6xl font-black text-slate-950 tracking-tighter">{brain.plan.usage.users}</span>
                        <span className="text-base font-bold text-slate-300">/ {brain.plan.limits.users} acessos</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- MENU PRINCIPAL (CARDS) ---
  const cards = [
    { id: 'organization', title: 'Instituição', icon: Building2, desc: 'Dados jurídicos, logo e unidades.', color: 'emerald' },
    { id: 'operational', title: 'Operacional', icon: Sliders, desc: 'Taxonomia, tags e fluxos clínicos.', color: 'amber' },
    { id: 'notifications', title: 'Notificações', icon: Bell, desc: 'Gestão de alertas e relatórios por e-mail.', color: 'indigo' },
    { id: 'plan', title: 'Assinatura', icon: CreditCard, desc: 'Faturamento, limites e recursos SaaS.', color: 'slate' },
    { id: 'users', title: 'Gestão de Membros', icon: Users, desc: 'Acessos, cargos e permissões de equipe.', color: 'rose' },
    { id: 'security', title: 'Auditoria & Logs', icon: Shield, desc: 'Histórico de acessos e conformidade LGPD.', color: 'blue' },
  ];

  // FILTRO INTELIGENTE
  const filteredCards = cards.filter(card => 
    card.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    card.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 lg:space-y-14 animate-in fade-in duration-1000 pb-20 max-w-full overflow-hidden">
      <header className="px-1 lg:px-0">
        <h1 className="text-4xl lg:text-6xl font-black text-slate-950 tracking-tighter leading-none">Ajustes Operacionais</h1>
        <p className="text-sm lg:text-xl text-slate-500 font-bold mt-3 uppercase tracking-[0.2em] opacity-70">Controle central do cérebro operacional VivaPlena</p>
      </header>

      {/* BARRA DE PESQUISA LOCAL */}
      <div className="relative max-w-lg px-1 lg:px-0 group">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
         <input 
           type="text" 
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           placeholder="Buscar ajuste (ex: Usuários, Logos, Alertas)..." 
           className="w-full pl-14 pr-4 py-5 glass bg-white/40 border-white/50 rounded-[24px] text-sm font-bold focus:outline-none focus:bg-white focus:shadow-lg transition-all"
         />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 px-1 lg:px-0">
        {filteredCards.length === 0 ? (
           <div className="col-span-full py-20 text-center opacity-50">
             <XCircle size={48} className="mx-auto mb-4 text-slate-300"/>
             <p className="text-slate-500 font-bold">Nenhuma configuração encontrada para "{searchTerm}".</p>
           </div>
        ) : (
          filteredCards.map((card) => {
            const Icon = card.icon;
            const colors: Record<string, string> = {
              emerald: 'group-hover:bg-emerald-600 text-slate-400 group-hover:text-white',
              amber: 'group-hover:bg-amber-500 text-slate-400 group-hover:text-white',
              indigo: 'group-hover:bg-indigo-600 text-slate-400 group-hover:text-white',
              slate: 'group-hover:bg-slate-900 text-slate-400 group-hover:text-white',
              rose: 'group-hover:bg-rose-600 text-slate-400 group-hover:text-white',
              blue: 'group-hover:bg-blue-600 text-slate-400 group-hover:text-white',
            };

            return (
              <button 
                key={card.id}
                onClick={() => navigate('settings', card.id as SettingsSectionType)}
                className="glass-card bg-white/40 hover:bg-white p-10 rounded-[48px] border border-white/80 shadow-sm hover:shadow-2xl transition-all text-left flex flex-col group min-w-0 relative overflow-hidden active:scale-[0.98]"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-500/5 blur-2xl rounded-full group-hover:bg-slate-500/10 transition-all duration-700"></div>
                
                <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center bg-white border border-slate-100 mb-10 transition-all shadow-md shrink-0 border-white/60 ${colors[card.color]}`}>
                  <Icon size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black text-slate-950 mb-3 truncate tracking-tight">{card.title}</h3>
                <p className="text-sm font-bold text-slate-400 leading-relaxed uppercase tracking-widest opacity-80">{card.desc}</p>
                
                <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-emerald-700 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                  Acessar <ChevronRight size={14} />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

// Componentes Auxiliares
const Header = ({ icon: Icon, title, subtitle, color }: any) => {
  const bgColors: Record<string, string> = {
    emerald: 'bg-emerald-600', amber: 'bg-amber-500', indigo: 'bg-indigo-600', slate: 'bg-slate-900', rose: 'bg-rose-600', blue: 'bg-blue-600'
  };
  return (
    <div className="flex items-center gap-6">
      <div className={`w-16 h-16 ${bgColors[color] || 'bg-slate-900'} rounded-[24px] flex items-center justify-center text-white shadow-xl shrink-0 border border-white/20`}>
        <Icon size={28} />
      </div>
      <div>
        <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter leading-tight">{title}</h2>
        <p className="text-xs lg:text-sm text-slate-400 font-black uppercase tracking-[0.2em] mt-1.5 opacity-80">{subtitle}</p>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange }: any) => (
  <div className="space-y-3 group min-w-0">
    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] pl-3 group-focus-within:text-emerald-700 transition-colors">{label}</label>
    <div className="relative">
      <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full px-7 py-5 bg-white/60 border border-slate-100 rounded-[24px] text-base font-black text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-8 focus:ring-emerald-500/5 transition-all shadow-sm"/>
      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-emerald-500 transition-colors"><Save size={20} /></div>
    </div>
  </div>
);

const ToggleRow = ({ label, desc, enabled, onToggle }: any) => (
  <div className="flex items-center justify-between p-6 glass bg-white/40 border border-white rounded-[24px] hover:bg-white transition-all">
    <div className="pr-4">
      <h4 className="font-black text-slate-900 text-sm mb-1">{label}</h4>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-relaxed">{desc}</p>
    </div>
    <button onClick={() => onToggle(!enabled)} className={`text-4xl transition-colors ${enabled ? 'text-emerald-500' : 'text-slate-300'}`}>{enabled ? <ToggleRight size={40} className="fill-current" /> : <ToggleLeft size={40} />}</button>
  </div>
);

export default Settings;
