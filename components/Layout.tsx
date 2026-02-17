import React, { useState } from 'react';
import {
  LayoutDashboard, Users, FileText, Settings, LogOut, Menu, X,
  Wallet, Calendar, BarChart3, Pill, Activity,
  Package, ClipboardList, Stethoscope, Briefcase, UserCog, AlertTriangle, Hexagon, Zap
} from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import { ModuleType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { brain, navigate, logout } = useBrain();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // MENU PRINCIPAL (Configuração dos Módulos)
  const menuItems: { id: ModuleType; label: string; icon: any; group?: string }[] = [
    // GESTÃO PRINCIPAL
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard, group: 'Gestão' },
    { id: 'patients', label: 'Acolhidos', icon: Users, group: 'Gestão' },

    // ÁREA CLÍNICA (Novos Módulos)
    { id: 'pti', label: 'Plano Terapêutico', icon: ClipboardList, group: 'Clínico' },
    { id: 'health-records', label: 'Prontuário Saúde', icon: Stethoscope, group: 'Clínico' },
    { id: 'medication', label: 'Medicamentos', icon: Pill, group: 'Clínico' },

    // OPERACIONAL
    { id: 'agenda', label: 'Agenda & Visitas', icon: Calendar, group: 'Operacional' },
    { id: 'occurrences', label: 'Ocorrências', icon: AlertTriangle, group: 'Operacional' },
    { id: 'inventory', label: 'Almoxarifado', icon: Package, group: 'Operacional' },
    { id: 'documents', label: 'Documentos', icon: FileText, group: 'Operacional' },

    // ADMINISTRATIVO
    { id: 'finance', label: 'Financeiro', icon: Wallet, group: 'Admin' },
    { id: 'human-resources', label: 'Recursos Humanos', icon: Briefcase, group: 'Admin' },
    { id: 'government-report', label: 'Relatórios Técnicos', icon: FileText, group: 'Admin' },
    { id: 'reports', label: 'Dashboards', icon: BarChart3, group: 'Admin' },
    { id: 'users', label: 'Acesso Sistema', icon: UserCog, group: 'Admin' },
  ];

  const activeModule = brain.ui.activeModule;

  const handleNavigate = (module: ModuleType) => {
    navigate(module);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex font-sans text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-100 overflow-hidden bg-[#0f172a]">

      {/* BACKGROUND ANIMADO (GLOBAL) */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-violet-600/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[80px] opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] bg-fuchsia-600/10 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      {/* SIDEBAR DESKTOP */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-[60] glass transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col border-r border-white/10
          ${isSidebarOpen ? 'w-72' : 'w-24 hidden lg:flex'}
          ${isMobileMenuOpen ? 'translate-x-0 w-80 shadow-2xl bg-[#0f172a]/90' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* LOGO AREA */}
        <div className="p-8 flex items-center justify-between lg:justify-start gap-4 shrink-0 relative z-10 group/logo cursor-pointer" onClick={() => handleNavigate('dashboard')}>
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-lg opacity-40 group-hover/logo:opacity-75 transition-opacity duration-500"></div>
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg border border-white/20 relative z-10 group-hover/logo:rotate-3 transition-all duration-500">
              <Hexagon size={24} className="fill-white/20" />
            </div>
          </div>

          {(isSidebarOpen || isMobileMenuOpen) && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-700">
              <span className="font-black text-2xl text-white tracking-tight leading-none block text-glow drop-shadow-md">Vida Plena</span>
              <span className="text-[9px] font-black text-indigo-300 uppercase tracking-[0.3em] block mt-1 flex items-center gap-1 opacity-80">
                Gestão
              </span>
            </div>
          )}
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-slate-400 hover:bg-white/10 rounded-xl"><X size={24} /></button>
        </div>

        {/* MENU ITENS */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-2 custom-scrollbar relative z-10">
          {menuItems.map((item, index) => {
            const isActive = activeModule === item.id;
            const showGroupTitle = (index === 0 || menuItems[index - 1].group !== item.group) && (isSidebarOpen || isMobileMenuOpen);

            return (
              <React.Fragment key={item.id}>
                {showGroupTitle && (
                  <div className="mt-6 mb-2 px-4 animate-in fade-in duration-700">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.group}</span>
                  </div>
                )}

                <button
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden
                    ${isActive
                      ? 'bg-gradient-to-r from-indigo-600/90 to-violet-600/90 text-white shadow-lg shadow-indigo-500/25 translate-x-1 border border-white/10'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white hover:translate-x-1'
                    }
                  `}
                >
                  <div className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'drop-shadow-md' : ''} />
                  </div>

                  {(isSidebarOpen || isMobileMenuOpen) && (
                    <span className={`relative z-10 font-bold text-sm tracking-wide ${isActive ? 'text-white' : ''}`}>
                      {item.label}
                    </span>
                  )}

                  {/* Hover Glow */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* FOOTER USER */}
        <div className="p-4 border-t border-white/5 shrink-0 bg-black/20 relative z-10 backdrop-blur-md">
          <div className={`rounded-[24px] p-2 flex items-center gap-3 transition-all ${!isSidebarOpen && !isMobileMenuOpen ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-lg ring-2 ring-white/5">
              {brain.session.user?.username?.substring(0, 2).toUpperCase() || 'US'}
            </div>
            {(isSidebarOpen || isMobileMenuOpen) && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-white truncate">{brain.session.user?.username || 'Usuário'}</p>
                <p className="text-[10px] font-bold text-indigo-400 truncate capitalize">{brain.session.user?.role === 'ADMIN' ? 'Administrador' : 'Colaborador'}</p>
              </div>
            )}
            {(isSidebarOpen || isMobileMenuOpen) && (
              <button onClick={logout} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors" title="Sair">
                <LogOut size={18} />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:flex w-full mt-2 items-center justify-center p-2 text-slate-500 hover:text-indigo-400 transition-colors group"
          >
            <div className={`w-8 h-1 bg-white/10 rounded-full group-hover:bg-indigo-500/50 transition-all duration-300 ${!isSidebarOpen ? 'w-2 h-2' : ''}`} />
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        <header className="lg:hidden glass border-b border-white/5 p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg">VP</div>
            <span className="font-black text-lg text-white text-glow">Vida Plena</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-white/5 rounded-xl text-white border border-white/10">
            <Menu size={24} />
          </button>
        </header>

        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-[55] lg:hidden backdrop-blur-md animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 custom-scrollbar scroll-smooth">
          <div className="max-w-[1400px] mx-auto h-full">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
};

export default Layout;
