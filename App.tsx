import React, { useEffect } from 'react';
import { useBrain } from './context/BrainContext';
import Layout from './components/Layout';
import LoginScreen from './components/LoginScreen';
import Loading from './components/common/Loading';
import { Toaster } from 'react-hot-toast';

// Componentes Existentes
import Dashboard from './components/Dashboard';
import Patients from './components/Patients';
import PatientProfile from './components/PatientProfile';
import DailyRecords from './components/DailyRecords';
import Occurrences from './components/Occurrences';
import Calendar from './components/Calendar'; // Agenda
import Medication from './components/Medication';
import Finance from './components/Finance';
import Documents from './components/Documents';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Users from './components/Users';

// NOVOS COMPONENTES
import Inventory from './components/Inventory';
import PTI from './components/PTI';
import HealthRecords from './components/HealthRecords';
import HumanResources from './components/HumanResources';
import GovernmentReport from './components/GovernmentReport';
import DebugConn from './components/DebugConn';

// IMPORTANTE: O Gerenciador de Modais que faltava
import QuickActionModals from './components/QuickActionModals';
import GlobalEditModal from './components/GlobalEditModal';
import MedicationNotifier from './components/common/MedicationNotifier';

function App() {
  const { brain, refreshData, navigate } = useBrain();
  const { activeModule } = brain.ui;

  // Atualiza dados periodicamente
  useEffect(() => {
    if (brain.session.isAuthenticated) {
      refreshData();
      const interval = setInterval(refreshData, 30000); // 30s
      return () => clearInterval(interval);
    }
  }, [brain.session.isAuthenticated]);

  // Backdoor para Debug
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#debug') {
        navigate('debug');
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Roteador Simples
  const renderModule = () => {
    if (brain.ui.selectedPatientId) {
      return <PatientProfile />;
    }

    switch (activeModule) {
      // Módulos Clínicos
      case 'dashboard':
        return <Dashboard />;
      case 'patients':
        return <Patients />;
      case 'pti':
        return <PTI />;
      case 'health-records':
        return <HealthRecords />;
      case 'medication':
        return <Medication />;

      // Módulos Operacionais
      case 'agenda':
        return <Calendar />;
      case 'daily-records':
        return <DailyRecords />;
      case 'occurrences':
        return <Occurrences />;
      case 'inventory':
        return <Inventory />;
      case 'documents':
        return <Documents />;

      // Módulos Administrativos
      case 'finance':
        return <Finance />;
      case 'reports':
        return <Reports />;
      case 'government-report':
        return <GovernmentReport />;
      case 'users':
        return <Users />;
      case 'human-resources':
        return <HumanResources />;
      case 'settings':
        return <Settings />;

      // Diagnóstico
      case 'debug':
        return <DebugConn />;

      default:
        return <Dashboard />;
    }
  };

  // 1. TELA DE CARREGAMENTO
  if (brain.loading) {
    return <Loading />;
  }

  // 2. TELA DE LOGIN
  if (!brain.session.isAuthenticated) {
    return (
      <>
        <Toaster position="top-center" />
        <LoginScreen />
      </>
    );
  }

  // 3. APLICAÇÃO PRINCIPAL
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#333', color: '#fff' } }} />

      {/* AQUI ESTAVA FALTANDO: O componente que exibe os modais quando você clica */}
      <QuickActionModals />
      <GlobalEditModal />
      <MedicationNotifier />

      <Layout>
        <div className="animate-in fade-in duration-500">
          {renderModule()}
        </div>
      </Layout>
    </>
  );
}

export default App;
