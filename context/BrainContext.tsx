import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrainState, UIState, Toast, QuickActionType, ClinicSession, Transaction, AppUser, EditingItem, ModuleType, SettingsSectionType } from '../types';
import { Repository } from '../data/repo';
import { supabase } from '../lib/supabaseClient';

// Estado Inicial Padrão
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
  patients: [], records: [], occurrences: [], agenda: [], documents: [],
  medications: [], transactions: [], finances: { transactions: [] },
  inventory: [], pti: [], healthRecords: [], // Novos módulos
  settings: {}, users: [], logs: [],
  plan: { name: 'ESSENCIAL', status: 'active', limits: { patients: 20, users: 3 }, usage: { patients: 0, users: 0 } },
  chartData: [], loading: true, lastError: null
};

// Interface Completa (com as funções que faltavam)
interface BrainContextType {
  brain: BrainState;
  navigate: (module: ModuleType, section?: SettingsSectionType) => void;
  setQuickAction: (action: QuickActionType) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void; // Adicionado
  refreshData: () => Promise<void>;
  updateUserPermission: (permission: any) => void;
  push: (table: string, data: any) => Promise<any>;
  update: (table: string, id: string, data: any) => Promise<void>; // Adicionado
  remove: (table: string, id: string) => Promise<void>; // Adicionado
  logout: () => void;
  login: (username: string, passwordRaw: string) => Promise<{ success: boolean; errorCode?: string }>; // Adicionado para AuthContext
  edit: (type: any, data: any) => void; // Adicionado
  cancelEdit: () => void; // Adicionado
}

const BrainContext = createContext<BrainContextType | undefined>(undefined);

export const BrainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brain, setBrain] = useState<BrainState>(initialState);

  // --- NOTIFICAÇÕES ---
  const removeToast = (id: string) => {
    setBrain(prev => ({
      ...prev,
      ui: { ...prev.ui, toasts: prev.ui.toasts.filter(t => t.id !== id) }
    }));
  };

  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setBrain(prev => ({
      ...prev,
      ui: { ...prev.ui, toasts: [...prev.ui.toasts, { id, message, type }] }
    }));
    setTimeout(() => removeToast(id), 4000);
  };

  // --- ACTIONS (CRUD) ---
  const push = async (table: string, data: any) => {
    try {
       const { data: savedData, error } = await supabase.from(table).insert(data).select().single();
       if (error) throw error;
       await initialize(); // Recarrega dados
       return savedData;
    } catch (err: any) {
       console.error("Erro no push:", err);
       throw err;
    }
  };

  const update = async (table: string, id: string, data: any) => {
    try {
      const { error } = await supabase.from(table).update(data).eq('id', id);
      if (error) throw error;
      addToast('Item atualizado com sucesso!', 'success');
      await initialize();
      cancelEdit();
    } catch (err: any) {
      console.error("Erro no update:", err);
      addToast('Erro ao atualizar item.', 'error');
      throw err;
    }
  };

  const remove = async (table: string, id: string) => {
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      addToast('Item removido.', 'success');
      await initialize();
    } catch (err: any) {
      console.error("Erro no remove:", err);
      addToast('Erro ao remover item.', 'error');
      throw err;
    }
  };

  // --- NAVEGAÇÃO & UI ---
  const navigate = (module: ModuleType, section?: SettingsSectionType) => {
    setBrain(prev => ({ 
      ...prev, 
      ui: { ...prev.ui, activeModule: module, activeSettingsSection: section || null } 
    }));
  };

  const setQuickAction = (action: QuickActionType) => {
    setBrain(prev => ({ ...prev, ui: { ...prev.ui, quickAction: action } }));
  };

  const edit = (type: any, data: any) => {
    setBrain(prev => ({ ...prev, ui: { ...prev.ui, editingItem: { type, data } } }));
  };

  const cancelEdit = () => {
    setBrain(prev => ({ ...prev, ui: { ...prev.ui, editingItem: null } }));
  };

  // --- AUTH ---
  const login = async (username: string, passwordRaw: string) => {
    // Simulação para manter compatibilidade com AuthContext legado
    // O ideal é migrar tudo para usar supabase.auth.signInWithPassword
    return { success: false, errorCode: 'USE_SUPABASE_LOGIN' }; 
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setBrain(initialState);
  };

  // --- CARREGAMENTO DE DADOS ---
  const initialize = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setBrain(prev => ({ ...prev, loading: false, session: initialSession }));
        return;
      }

      const { data: userData } = await supabase
        .from('app_users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!userData) throw new Error("Usuário não encontrado.");

      const data = await Repository.fetchInitialData(userData.clinic_id);

      setBrain(prev => ({
        ...prev,
        session: {
          isAuthenticated: true,
          user: userData,
          clinicId: userData.clinic_id,
          permissions: prev.session.permissions
        },
        clinic: { id: userData.clinic_id, name: 'Vida Plena', plan: 'PROFISSIONAL', is_active: true },
        patients: data.patients,
        transactions: data.transactions,
        finances: { transactions: data.transactions },
        agenda: data.agenda,
        occurrences: data.occurrences,
        documents: data.documents,
        medications: data.medications,
        users: data.users,
        inventory: data.inventory || [],
        pti: data.pti || [],
        healthRecords: data.healthRecords || [],
        loading: false
      }));

    } catch (error: any) {
      console.error("Falha na inicialização:", error);
      setBrain(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    initialize();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
       if (session) initialize();
       else setBrain(prev => ({ ...prev, session: initialSession, loading: false }));
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrainContext.Provider value={{ 
      brain, navigate, setQuickAction, addToast, removeToast, refreshData: initialize, 
      updateUserPermission: () => {}, push, update, remove, logout, login, edit, cancelEdit 
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
