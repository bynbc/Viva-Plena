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

// Modais Globais
import GlobalNewModal from './components/GlobalNewModal';
import GlobalEditModal from './components/GlobalEditModal';
import MedicationNotifier from './components/common/MedicationNotifier';

function App() {
  const { brain, refreshData, navigate } = useBrain(); // Adicionei navigate
  const { activeModule } = brain.ui;

  // Atualiza dados periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      if (brain.session.isAuthenticated) {
        refreshData();
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [brain.session.isAuthenticated]);

  // Função de Renderização (Movida para dentro para ter acesso ao 'brain' e 'navigate')
  const renderModule = (module: string) => {
    switch (module) {
      // Módulos Principais
      case 'dashboard':
        return <Dashboard />;
      case 'patients':
        return <Patients onSelectPatient={(id) => {
             // Quando selecionar um paciente, navega para o perfil
             // Nota: O ID deve ser setado no estado global em uma implementação ideal
             navigate('patient-profile'); 
        }} />;
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
      case 'daily-records': 
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
      
      <MedicationNotifier />

      <Layout>
        <div className="animate-in fade-in duration-500">
          {renderModule(activeModule)}
        </div>
      </Layout>

      <GlobalNewModal />
      <GlobalEditModal />
    </>
  );
}

export default App;
