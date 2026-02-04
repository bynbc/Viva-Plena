import React from 'react';
// Imports dos Módulos (Telas)
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Patients from './components/Patients';
import PatientProfile from './components/PatientProfile';
import Settings from './components/Settings';
import Occurrences from './components/Occurrences';
import Reports from './components/Reports';
import DailyRecords from './components/DailyRecords';
import Users from './components/Users';
import Medication from './components/Medication';
import Finance from './components/Finance';
import Calendar from './components/Calendar';
import Documents from './components/Documents';

// Imports dos Modais Globais
import GlobalNewModal from './components/GlobalNewModal';
import GlobalEditModal from './components/GlobalEditModal'; // <--- O Modal de Edição novo
import LoginScreen from './components/LoginScreen';

// Contextos e Utilitários
import { BrainProvider, useBrain } from './context/BrainContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import PermissionGuard from './components/common/PermissionGuard';
import { ShieldCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const { brain, navigate, setUI } = useBrain();
  const { isAuthenticated } = useAuth();
  const { activeModule, selectedPatientId } = brain.ui;

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Lógica de Roteamento (Qual tela mostrar)
  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <PermissionGuard module="dashboard" fallback={<NoAccess />}><Dashboard /></PermissionGuard>;
      case 'patients':
        return (
          <PermissionGuard module="patients" fallback={<NoAccess />}>
            <Patients 
              onSelectPatient={(id) => {
                setUI({ selectedPatientId: id });
                navigate('patient-profile');
              }} 
            />
          </PermissionGuard>
        );
      case 'patient-profile':
        if (!selectedPatientId) {
          navigate('patients');
          return null;
        }
        return (
          <PatientProfile 
            patientId={selectedPatientId}
            onBack={() => navigate('patients')} 
          />
        );
      case 'medication':
        return <PermissionGuard module="medication" fallback={<NoAccess />}><Medication /></PermissionGuard>;
      case 'finance':
        return <PermissionGuard module="finance" fallback={<NoAccess />}><Finance /></PermissionGuard>;
      case 'daily-records':
        return <PermissionGuard module="records" fallback={<NoAccess />}><DailyRecords /></PermissionGuard>;
      case 'occurrences':
        return <PermissionGuard module="occurrences" fallback={<NoAccess />}><Occurrences /></PermissionGuard>;
      
      case 'calendar':
        return <PermissionGuard module="agenda" fallback={<NoAccess />}><Calendar /></PermissionGuard>;
      case 'documents':
        return <PermissionGuard module="documents" fallback={<NoAccess />}><Documents /></PermissionGuard>;

      case 'reports':
        return <PermissionGuard module="reports" fallback={<NoAccess />}><Reports /></PermissionGuard>;
      case 'users':
        return <PermissionGuard module="users" fallback={<NoAccess />}><Users /></PermissionGuard>;
      case 'settings':
        return <PermissionGuard module="settings" fallback={<NoAccess />}><Settings /></PermissionGuard>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="antialiased text-slate-900 min-h-screen relative">
      <Layout>
        {renderModule()}
      </Layout>

      {/* MODAL DE CRIAÇÃO (Botão +) */}
      <GlobalNewModal 
        isOpen={brain.ui.isNewModalOpen} 
        onClose={() => setUI({ isNewModalOpen: false })} 
      />
      
      {/* MODAL DE EDIÇÃO (Lápis) - Conectado aqui! */}
      <GlobalEditModal /> 
    </div>
  );
};

// Componente de Acesso Negado
const NoAccess: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-40 text-center animate-in fade-in">
    <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-6">
      <ShieldCheck size={48} />
    </div>
    <h2 className="text-2xl font-black text-slate-900">Acesso Restrito</h2>
    <p className="text-slate-500 mt-2 max-w-xs font-medium">Você não possui permissões operacionais para visualizar este módulo.</p>
  </div>
);

// Componente Principal que envolve tudo com os Provedores (Contextos)
const App: React.FC = () => (
  <BrainProvider>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </BrainProvider>
);

export default App;