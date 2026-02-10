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

// NOVOS COMPONENTES (Vamos criar estes arquivos nas próximas etapas)
// Se der erro agora, é normal. Eles serão criados a seguir.
import Inventory from './components/Inventory';
import PTI from './components/PTI'; 
import HealthRecords from './components/HealthRecords';
import HumanResources from './components/HumanResources';

// Modais Globais
import GlobalNewModal from './components/GlobalNewModal';
import GlobalEditModal from './components/GlobalEditModal';
import MedicationNotifier from './components/common/MedicationNotifier';

function App() {
  const { brain, refreshData } = useBrain();
  const { activeModule } = brain.ui;

  // Atualiza dados periodicamente (a cada 5 minutos)
  useEffect(() => {
    const interval = setInterval(() => {
      if (brain.session.isAuthenticated) {
        refreshData();
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [brain.session.isAuthenticated]);

  // 1. TELA DE CARREGAMENTO
  if (brain.loading) {
    return <Loading />;
  }

  // 2. TELA DE LOGIN (Se não estiver autenticado)
  if (!brain.session.isAuthenticated) {
    return (
      <>
        <Toaster position="top-center" />
        <LoginScreen />
      </>
    );
  }

  // 3. APLICAÇÃO PRINCIPAL (Com Layout e Menu)
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#333', color: '#fff' } }} />
      
      {/* Notificador de Medicamentos (Roda em background) */}
      <MedicationNotifier />

      <Layout>
        <div className="animate-in fade-in duration-500">
          {renderModule(activeModule, brain.ui.selectedPatientId)}
        </div>
      </Layout>

      {/* Modais Globais de Ação Rápida */}
      <GlobalNewModal />
      <GlobalEditModal />
    </>
  );
}

// Função auxiliar para renderizar o módulo correto
function renderModule(module: string, patientId: string | null) {
  switch (module) {
    // Módulos Principais
    case 'dashboard':
      return <Dashboard />;
    case 'patients':
      return <Patients />;
    case 'patient-profile':
      return <PatientProfile />;
    
    // Módulos Clínicos (NOVOS)
    case 'pti':
      return <PTI />;
    case 'health-records':
      return <HealthRecords />;
    case 'medication':
      return <Medication />;

    // Módulos Operacionais
    case 'agenda':
      return <Calendar />;
    case 'daily-records': // Mantido para legado ou anotações rápidas
      return <DailyRecords />;
    case 'occurrences':
      return <Occurrences />;
    case 'inventory': // NOVO
      return <Inventory />;
    case 'documents':
      return <Documents />;

    // Módulos Administrativos
    case 'finance':
      return <Finance />;
    case 'reports':
      return <Reports />;
    case 'users':
      return <Users />;
    case 'human-resources': // NOVO
      return <HumanResources />;
    case 'settings':
      return <Settings />;
      
    default:
      return <Dashboard />;
  }
}

export default App;
