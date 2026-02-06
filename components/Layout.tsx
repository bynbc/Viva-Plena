import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users as UsersIcon, FileText, AlertCircle, 
  Calendar, BarChart3, Settings as SettingsIcon, 
  Search, Bell, Menu, User, LogOut, ShieldCheck, Pill, Wallet, X 
} from 'lucide-react';
import { ModuleType } from '../types';
import { useBrain } from '../context/BrainContext';
import { useAuth } from '../context/AuthContext';
import PermissionGuard from './common/PermissionGuard';
import QuickActionModals from './QuickActionModals';
import Toast from './common/Toast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { brain, navigate, setQuickAction, logout } = useBrain();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeModule = brain.ui.activeModule;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, perm: 'dashboard' },
    { id: 'patients', label: 'Pacientes', icon: UsersIcon, perm: 'patients' },
    { id: 'daily-records', label: 'Evoluções', icon: FileText, perm: 'records' },
    { id: 'calendar', label: 'Agenda', icon: Calendar, perm: 'agenda' },
    { id: 'medication', label: 'Medicação', icon: Pill, perm: 'medication' },
    { id: 'occurrences', label: 'Ocorrências', icon: AlertCircle, perm: 'occurrences' },
    { id: 'finance', label: 'Financeiro', icon: Wallet, perm: 'finance' },
    { id: 'reports', label: 'Relatórios', icon: BarChart3, perm: 'reports' },
    { id: 'users', label: 'Usuários', icon: ShieldCheck, perm: 'users' },
    { id: 'settings', label: 'Configurações', icon: SettingsIcon, perm: 'settings' },
  ];

  const handleNavigate = (id: string) => {
    navigate(id as ModuleType);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden lg:p-6 gap-0 lg:gap-6 bg-slate-50/30 max-w-full">
      <Toast />
      
      <div 
        className={`fixed inset-0 bg-slate-900/50 z-40 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 flex flex-col glass lg:rounded-[48px] bg-white lg:bg-white/40
        transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] 
        ${isMobileMenuOpen ? 'translate-x-0 w-[80%] max-w-[300px]' : '-translate-x-full lg:translate-x-0'}
        ${isSidebarOpen ? 'lg:w-80' : 'lg:w-24'}
      `}>
        <div className="p-8 flex items-center justify-between lg:justify-start gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 bg-emerald-600/90 rounded-[22px] flex items-center justify-center text-white font-black text-2xl shadow-xl transform hover:rotate-6 transition-transform cursor-pointer backdrop-blur-3xl border border-white/40 shrink-0" 
              onClick={() => handleNavigate('dashboard')}
            >
              ZG
            </div>
            {(isSidebarOpen || isMobileMenuOpen) && (
              // --- MUDANÇA DE NOME NO MENU LATERAL ---
              <div className="animate-in fade-in slide-in-from-left-2">
                <span className="font-black text-2xl text-slate-900 tracking-tighter whitespace-nowrap leading-none block">
                  Z-Grow
                </span>
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block mt-1">
                  Sistema Operacional
                </span>
              </div>
            )}
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-slate-400">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-5 space-y-2 overflow-y-auto custom-scrollbar py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <PermissionGuard key={item.id} module={item.perm}>
                <button
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-5 px-6 py-4 rounded-[28px] transition-all group relative overflow-hidden ${
                    isActive 
                      ? 'bg-emerald-600 text-white shadow-lg border border-white/20' 
                      : 'text-slate-500 hover:bg-slate-100 lg:hover:bg-white/40 hover:text-emerald-900'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'group-hover:scale-110 transition-transform'} />
                  {(isSidebarOpen || isMobileMenuOpen) && <span className="font-bold tracking-tight text-sm whitespace-nowrap">{item.label}</span>}
                </button>
              </PermissionGuard>
            );
          })}
        </nav>

        <div className="p-8 mt-auto border-t border-slate-100 lg:border-white/10 shrink-0">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-5 px-6 py-4 rounded-[24px] text-rose-500 hover:bg-rose-500/10 hover:text-rose-700 transition-all border border-transparent hover:border-rose-500/20"
          >
            <LogOut size={20} />
            {(isSidebarOpen || isMobileMenuOpen) && <span className="font-bold text-sm">Sair</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col gap-0 lg:gap-6 overflow-hidden relative max-w-full">
        <header className="h-16 lg:h-24 glass-header lg:rounded-[48px] flex items-center justify-between px-6 lg:px-10 shrink-0 relative z-20 pt-safe bg-white/80 lg:bg-rgba(255,255,255,0.25)">
          <div className="flex items-center gap-4 lg:gap-8 flex-1 min-w-0">
            <div className="lg:hidden shrink-0">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2.5 text-slate-600 bg-slate-100 rounded-xl active:scale-95 transition-transform"
              >
                <Menu size={24} />
              </button>
            </div>
            <div className="hidden lg:flex shrink-0">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-3.5 text-slate-500 hover:text-emerald-700 hover:bg-white/50 rounded-2xl transition-all border border-transparent hover:border-white/40"
              >
                <Menu size={24} />
              </button>
            </div>
            <div className="relative max-w-xs lg:max-w-md w-full group ml-2 lg:ml-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar no Z-Grow..." 
                className="w-full pl-12 pr-4 py-2.5 lg:py-3.5 bg-slate-100 lg:bg-white/40 border border-transparent lg:border-white/60 rounded-2xl lg:rounded-[24px] text-sm focus:outline-none focus:bg-white transition-all font-bold placeholder:text-slate-400"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 lg:gap-6 shrink-0 ml-4">
            <button className="hidden sm:flex tap-target text-slate-500 hover:bg-white/60 rounded-2xl relative transition-all border border-transparent hover:border-white/40">
              <Bell size={22} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-white shadow-sm"></span>
            </button>
            <div 
              className="flex items-center gap-2 lg:gap-4 group cursor-pointer hover:bg-white/60 p-1 lg:p-2 rounded-2xl lg:rounded-[28px] transition-all"
              onClick={() => navigate('settings', 'users')}
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs lg:text-sm font-black text-slate-900 leading-none">{user?.username}</p>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">{user?.role}</p>
              </div>
              <div className="w-9 h-9 lg:w-14 lg:h-14 bg-emerald-100 lg:bg-white/60 rounded-xl lg:rounded-[22px] border border-transparent lg:border-white/60 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                <User size={20} lg:size={28} />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 glass lg:rounded-[56px] overflow-hidden relative border-white/40 max-w-full bg-white/30 lg:bg-rgba(255,255,255,0.2)">
          <div className="absolute inset-0 overflow-y-auto overflow-x-hidden p-5 lg:p-12 scroll-smooth custom-scrollbar pb-12">
            {children}
          </div>
        </main>
      </div>

      <QuickActionModals />
    </div>
  );
};

export default Layout;
