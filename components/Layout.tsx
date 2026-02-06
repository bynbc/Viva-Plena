import React from 'react';
import { 
  LayoutDashboard, Users, FileText, Settings, LogOut, Menu, X, 
  Calendar, Pill, Wallet, Activity, ClipboardList, Files 
} from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import { useAuth } from '../context/AuthContext';
import { ModuleType } from '../types';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { brain, navigate, logout } = useBrain();
  const { user, hasPermission } = useAuth(); // Importante checar permissão
  const { activeModule } = brain.ui;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // LISTA DE MÓDULOS (Aqui que a mágica acontece)
  const menuItems = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard, permission: 'dashboard' },
    { id: 'patients', label: 'Pacientes', icon: Users, permission: 'patients' },
    { id: 'daily-records', label: 'Evoluções', icon: Activity, permission: 'records' }, // Nome curto pra caber
    { id: 'calendar', label: 'Agenda', icon: Calendar, permission: 'agenda' },
    { id: 'medication', label: 'Medicação', icon: Pill, permission: 'medication' },
    { id: 'occurrences', label: 'Ocorrências', icon: ClipboardList, permission: 'occurrences' },
    { id: 'finance', label: 'Financeiro', icon: Wallet, permission: 'finance' },
    { id: 'documents', label: 'Arquivos', icon: Files, permission: 'documents' }, // <--- ELE ESTAVA FALTANDO
    { id: 'reports', label: 'Relatórios', icon: FileText, permission: 'reports' },
    { id: 'users', label: 'Equipe', icon: Users, permission: 'users' },
    { id: 'settings', label: 'Ajustes', icon: Settings, permission: 'settings' },
  ];

  // Filtra itens que o usuário tem permissão para ver
  const authorizedItems = menuItems.filter(item => hasPermission(item.permission));

  // Função para navegar e fechar menu mobile
  const handleNav = (id: string) => {
    navigate(id as ModuleType);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#F0F4F8] font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* --- SIDEBAR (DESKTOP) --- */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transition-transform duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 shadow-2xl lg:shadow-none flex flex-col`}>
        {/* Logo */}
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 text-emerald-400 mb-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-900 font-black text-lg">
              {brain.organization.logo || 'V'}
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">{brain.organization.name || 'VivaPlena'}</span>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] pl-11">Sistema Clínico</p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
          {authorizedItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id || (activeModule === 'patient-profile' && item.id === 'patients');
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 font-bold' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white font-medium'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400 transition-colors'} />
                <span className="tracking-wide text-sm">{item.label}</span>
                {isActive && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
              </button>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/30">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-black shadow-lg">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.username || 'Usuário'}</p>
              <p className="text-[10px] text-emerald-500 font-black uppercase tracking-wider">{user?.role === 'ADMIN' ? 'Diretor' : 'Colaborador'}</p>
            </div>
            <button onClick={logout} className="p-2 text-slate-500 hover:text-rose-500 transition-colors" title="Sair">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* --- OVERLAY MOBILE --- */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="flex-1 flex flex-col min-h-screen relative w-full max-w-[100vw] overflow-x-hidden">
        
        {/* Header Mobile */}
        <header className="lg:hidden p-4 flex items-center justify-between bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm/50">
          <div className="flex items-center gap-2 text-slate-900">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black">
              {brain.organization.logo || 'V'}
            </div>
            <span className="font-black tracking-tight text-lg">{brain.organization.name}</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 bg-slate-50 rounded-xl border border-slate-100 active:scale-95 transition-transform">
            <Menu size={24} />
          </button>
        </header>

        {/* Área de Scroll do Conteúdo */}
        <div className="flex-1 p-4 lg:p-8 overflow-x-hidden w-full max-w-7xl mx-auto">
          {children}
        </div>

        {/* --- BOTTOM BAR (MENU DE BAIXO MOBILE) --- */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] safe-area-pb">
          {/* Mostra apenas os 5 módulos principais no menu de baixo pra não apertar */}
          {[
            { id: 'dashboard', icon: LayoutDashboard },
            { id: 'patients', icon: Users },
            { id: 'calendar', icon: Calendar },
            { id: 'documents', icon: Files }, // <--- AGORA ELE APARECE AQUI
            { id: 'menu', icon: Menu, action: () => setIsMobileMenuOpen(true) } // Botão "Mais"
          ].map((item: any) => {
             const Icon = item.icon;
             // Se for o botão de menu, tem ação própria. Se não, navega.
             const isActive = activeModule === item.id;
             return (
               <button 
                 key={item.id}
                 onClick={item.action || (() => navigate(item.id))}
                 className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${
                    isActive ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
                 }`}
               >
                 <Icon size={24} className={isActive ? 'fill-current' : ''} strokeWidth={isActive ? 2.5 : 2} />
                 {isActive && <div className="w-1 h-1 bg-emerald-600 rounded-full mt-1"></div>}
               </button>
             )
          })}
        </div>
      </main>
    </div>
  );
};

export default Layout;
