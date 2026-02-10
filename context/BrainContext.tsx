import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrainState, UIState, Toast, QuickActionType, ClinicSession, Transaction } from '../types';
import { Repository } from '../data/repo';
import { supabase } from '../lib/supabaseClient';

// Estado Inicial Padrão (Evita tela branca)
const initialUI: UIState = {
  activeModule: 'dashboard',
  activeSettingsSection: null,
  selectedPatientId: null,
  quickAction: null,
  toasts: [],
  debugMode: false,
  editingItem: null
};

const initialSession: ClinicSession = {
  isAuthenticated: false,
  user: null,
  clinicId: null,
  permissions: null
};

const initialState: BrainState = {
  ui: initialUI,
  session: initialSession,
  clinic: null,
  organization: { name: '', unit: '', cnpj: '', logo: '' },
  patients: [],
  records: [],
  occurrences: [],
  agenda: [],
  documents: [],
  medications: [],
  transactions: [],
  finances: { transactions: [] },
  
  // NOVOS MÓDULOS (Inicializando vazio para não quebrar)
  inventory: [],
  pti: [],
  healthRecords: [],

  settings: {},
  users: [],
  logs: [],
  plan: {
    name: 'ESSENCIAL',
    status: 'active',
    limits: { patients: 20, users: 3 },
    usage: { patients: 0, users: 0 }
  },
  chartData: [],
  loading: true,
  lastError: null
};

interface BrainContextType {
  brain: BrainState;
  navigate: (module: any) => void;
  setQuickAction: (action: QuickActionType) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  refreshData: () => Promise<void>;
  updateUserPermission: (permission: any) => void;
  push: (table: string, data: any) => Promise<any>; // Função genérica para salvar
  logout: () => void;
}

const BrainContext = createContext<BrainContextType | undefined>(undefined);

export const BrainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brain, setBrain] = useState<BrainState>(initialState);

  // Função Auxiliar de Notificação
  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = Math.random().toString(36).substring(7);
    setBrain(prev => ({
      ...prev,
      ui: { ...prev.ui, toasts: [...prev.ui.toasts, { id, message, type }] }
    }));
    setTimeout(() => {
      setBrain(prev => ({
        ...prev,
        ui: { ...prev.ui, toasts: prev.ui.toasts.filter(t => t.id !== id) }
      }));
    }, 4000);
  };

  // Função Principal: Carregar Dados
  const initialize = async () => {
    try {
      // 1. Verifica Sessão
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setBrain(prev => ({ ...prev, loading: false, session: initialSession }));
        return;
      }

      // 2. Busca Usuário no Banco
      const { data: userData, error: userError } = await supabase
        .from('app_users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (userError || !userData) throw new Error("Usuário não encontrado.");

      // 3. Busca Dados da Clínica (Repository agora traz os módulos novos)
      const data = await Repository.fetchInitialData(userData.clinic_id);

      // 4. Monta o Estado Atualizado
      setBrain(prev => ({
        ...prev,
        session: {
          isAuthenticated: true,
          user: userData,
          clinicId: userData.clinic_id,
          permissions: prev.session.permissions // TODO: Carregar permissões reais
        },
        clinic: { id: userData.clinic_id, name: 'Vida Plena', plan: 'PROFISSIONAL', is_active: true },
        
        // Dados Antigos
        patients: data.patients,
        transactions: data.transactions,
        finances: { transactions: data.transactions },
        agenda: data.agenda,
        occurrences: data.occurrences,
        documents: data.documents,
        medications: data.medications,
        users: data.users,
        
        // NOVOS DADOS CONECTADOS AQUI
        inventory: data.inventory,
        pti: data.pti,
        healthRecords: data.healthRecords,

        loading: false
      }));

    } catch (error: any) {
      console.error("Falha na inicialização:", error);
      setBrain(prev => ({ ...prev, loading: false, lastError: error.message }));
      // Se der erro de autenticação, força logout visual
      if (error.message.includes('Auth')) {
         // Lógica de logout silencioso se necessário
      }
    }
  };

  // Inicializa ao montar
  useEffect(() => {
    initialize();
    
    // Escuta mudanças de auth (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
       if (session) initialize();
       else setBrain(prev => ({ ...prev, session: initialSession, loading: false }));
    });

    return () => subscription.unsubscribe();
  }, []);

  // Navegação
  const navigate = (module: any) => {
    setBrain(prev => ({ ...prev, ui: { ...prev.ui, activeModule: module } }));
  };

  // Ações Rápidas
  const setQuickAction = (action: QuickActionType) => {
    setBrain(prev => ({ ...prev, ui: { ...prev.ui, quickAction: action } }));
  };

  // Função Genérica para Salvar (PUSH)
  // Usada para inserir dados em qualquer tabela
  const push = async (table: string, data: any) => {
     try {
        const { data: savedData, error } = await supabase
           .from(table)
           .insert(data)
           .select()
           .single();

        if (error) throw error;
        
        // Recarrega tudo para garantir sincronia (pode ser otimizado depois)
        await initialize();
        return savedData;
     } catch (err: any) {
        throw err;
     }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setBrain(initialState);
  };

  return (
    <BrainContext.Provider value={{ 
      brain, 
      navigate, 
      setQuickAction, 
      addToast, 
      refreshData: initialize, 
      updateUserPermission: () => {}, 
      push,
      logout
    }}>
      {children}
    </BrainContext.Provider>
  );
};

export const useBrain = () => {
  const context = useContext(BrainContext);
  if (!context) throw new Error("useBrain deve ser usado dentro de BrainProvider");
  return context;
};
