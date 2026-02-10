import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, FileText, Settings, LogOut, Menu, X, 
  Wallet, Calendar, BarChart3, Pill, Activity, 
  Package, ClipboardList, Stethoscope, Briefcase, UserCog 
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
    { id: 'inventory', label: 'Almoxarifado', icon: Package, group: 'Operacional' }, // Novo
    { id: 'documents', label: 'Documentos', icon: FileText, group: 'Operacional' },
    
    // ADMINISTRATIVO
    { id: 'finance', label: 'Financeiro', icon: Wallet, group: 'Admin' },
    { id: 'human-resources', label: 'Recursos Humanos', icon: Briefcase, group: 'Admin' }, // Novo
    { id: 'reports', label: 'Relatórios Gov.', icon: BarChart3, group: 'Admin' },
    { id: 'users', label: 'Acesso Sistema', icon: UserCog, group: 'Admin' },
  ];

  const activeModule = brain.ui.activeModule;

  const handleNavigate = (module: ModuleType) => {
    navigate(module);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* SIDEBAR DESKTOP */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 ease-spring flex flex-col
          ${isSidebarOpen ? 'w-72' : 'w-24 hidden lg:flex'}
          ${isMobileMenuOpen ? 'translate-x-0 w-80' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* LOGO AREA */}
        <div className="p-8 flex items-center justify-between lg:justify-start gap-4 shrink-0">
          <div className="flex items-center gap-4">
            {/* ÍCONE VP */}
            <div 
              className="w-14 h-14 bg-indigo-600 rounded-[22px] flex items-center justify-center text-white font-black text-xl shadow-xl transform hover:rotate-6 transition-transform cursor-pointer border border-white/40 shrink-0 tracking-tighter" 
              onClick={() => handleNavigate('dashboard')}
            >
              VP
            </div>
            {(isSidebarOpen || isMobileMenuOpen) && (
              <div className="animate-in fade-in slide-in-from-left-2">
                <span className="font-black text-2xl text-slate-900 tracking-tighter whitespace-nowrap leading-none block">Vida Plena</span>
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block mt-1">Gestão 5.0</span>
              </div>
            )}
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-xl"><X size={24} /></button>
        </div>

        {/* MENU ITENS */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
          {menuItems.map((item, index) => {
            const isActive = activeModule === item.id;
            // Separador de Grupo (Exibe apenas se Sidebar estiver aberta)
            const showGroupTitle = (index === 0 || menuItems[index - 1].group !== item.group) && (isSidebarOpen || isMobileMenuOpen);

            return (
              <React.Fragment key={item.id}>
                {showGroupTitle && (
                  <div className="mt-6 mb-2 px-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.group}</span>
                  </div>
                )}
                
                <button
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group relative overflow-hidden
                    ${isActive 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 translate-x-1' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                    }
                  `}
                >
                  <div className={`relative z-10 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`}>
                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  
                  {(isSidebarOpen || isMobileMenuOpen) && (
                    <span className={`relative z-10 font-bold text-sm tracking-wide ${isActive ? 'text-white' : ''}`}>
                      {item.label}
                    </span>
                  )}

                  {/* Active Indicator Dot (Collapsed Mode) */}
                  {!isSidebarOpen && !isMobileMenuOpen && isActive && (
                    <div className="absolute right-2 w-2 h-2 bg-indigo-600 rounded-full" />
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* FOOTER USER */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <div className={`bg-slate-50 rounded-[24px] p-4 flex items-center gap-3 transition-all ${!isSidebarOpen && !isMobileMenuOpen ? 'justify-center' : ''}`}>
             <div className="w-10 h-10 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs shrink-0 shadow-sm">
                {brain.session.user?.username?.substring(0, 2).toUpperCase() || 'US'}
             </div>
             {(isSidebarOpen || isMobileMenuOpen) && (
               <div className="min-w-0 flex-1">
                 <p className="text-xs font-black text-slate-800 truncate">{brain.session.user?.username || 'Usuário'}</p>
                 <p className="text-[10px] font-bold text-slate-400 truncate capitalize">{brain.session.user?.role === 'ADMIN' ? 'Administrador' : 'Colaborador'}</p>
               </div>
             )}
             {(isSidebarOpen || isMobileMenuOpen) && (
               <button onClick={logout} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors" title="Sair">
                 <LogOut size={18} />
               </button>
             )}
          </div>
          
          {/* Toggle Button (Desktop Only) */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:flex w-full mt-4 items-center justify-center p-2 text-slate-300 hover:text-indigo-600 transition-colors"
          >
            <div className="w-8 h-1 bg-slate-200 rounded-full group-hover:bg-indigo-200" />
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="lg:hidden bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm">VP</div>
             <span className="font-black text-lg text-slate-800">Vida Plena</span>
           </div>
           <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-slate-50 rounded-xl text-slate-600">
             <Menu size={24} />
           </button>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 custom-scrollbar scroll-smooth">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
};

export default Layout;
