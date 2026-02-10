import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrainState, UIState, Toast, QuickActionType, ClinicSession, Transaction, AppUser, EditingItem, ModuleType, SettingsSectionType } from '../types';
import { Repository } from '../data/repo';
import { supabase } from '../lib/supabaseClient';
import { hashPassword } from '../utils/security'; // Importante para verificar a senha

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
  inventory: [], pti: [], healthRecords: [], 
  settings: {}, users: [], logs: [],
  plan: { name: 'ESSENCIAL', status: 'active', limits: { patients: 20, users: 3 }, usage: { patients: 0, users: 0 } },
  chartData: [], loading: true, lastError: null
};

interface BrainContextType {
  brain: BrainState;
  navigate: (module: ModuleType, section?: SettingsSectionType) => void;
  setQuickAction: (action: QuickActionType) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  refreshData: () => Promise<void>;
  updateUserPermission: (permission: any) => void;
  push: (table: string, data: any) => Promise<any>;
  update: (table: string, id: string, data: any) => Promise<void>;
  remove: (table: string, id: string) => Promise<void>;
  logout: () => void;
  login: (username: string, passwordRaw: string) => Promise<{ success: boolean; errorCode?: string }>;
  edit: (type: any, data: any) => void;
  cancelEdit: () => void;
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
       await initialize(); 
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

  // --- AUTH (LOGIN REAL) ---
  const login = async (username: string, passwordRaw: string) => {
    try {
      // 1. Busca usuário na tabela 'app_users' pelo username
      const { data: user, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('username', username)
        .maybeSingle(); // Usa maybeSingle para não dar erro 406 se não achar

      if (error) {
        console.error("Erro Supabase:", error);
        return { success: false, errorCode: 'SUPABASE_CONN_ERROR' };
      }

      if (!user) {
        return { success: false, errorCode: 'USER_NOT_FOUND' };
      }

      // 2. Verifica a senha (Hash)
      const inputHash = hashPassword(passwordRaw);
      if (user.password_hash !== inputHash) {
        return { success: false, errorCode: 'PASSWORD_MISMATCH' };
      }

      // 3. Login Sucesso: Salva sessão local (para F5 não deslogar)
      localStorage.setItem('vp_user_id', user.id);

      // 4. Carrega dados do sistema
      await loadSystemData(user);
      
      return { success: true };

    } catch (err) {
      console.error("Erro fatal login:", err);
      return { success: false, errorCode: 'UNKNOWN' };
    }
  };

  const logout = async () => {
    localStorage.removeItem('vp_user_id');
    await supabase.auth.signOut();
    setBrain(initialState);
  };

  // --- CARREGAMENTO DE DADOS ---
  const loadSystemData = async (userData: any) => {
      try {
        const data = await Repository.fetchInitialData(userData.clinic_id);

        setBrain(prev => ({
            ...prev,
            session: {
            isAuthenticated: true,
            user: userData,
            clinicId: userData.clinic_id,
            permissions: userData.permissions || prev.session.permissions
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
      } catch (error) {
          console.error("Erro ao carregar dados do sistema:", error);
          setBrain(prev => ({ ...prev, loading: false }));
      }
  };

  const initialize = async () => {
    try {
      // 1. Tenta recuperar sessão salva no localStorage (Modo Híbrido)
      const storedUserId = localStorage.getItem('vp_user_id');
      
      if (storedUserId) {
         const { data: userData } = await supabase
            .from('app_users')
            .select('*')
            .eq('id', storedUserId)
            .single();
         
         if (userData) {
            await loadSystemData(userData);
            return;
         }
      }

      // 2. Fallback: Tenta Supabase Auth tradicional
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setBrain(prev => ({ ...prev, loading: false, session: initialSession }));
        return;
      }

      // Se tiver sessão Supabase (ex: entrou por email no futuro)
      const { data: userData } = await supabase
        .from('app_users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (userData) {
          await loadSystemData(userData);
      } else {
          setBrain(prev => ({ ...prev, loading: false }));
      }

    } catch (error: any) {
      console.error("Falha na inicialização:", error);
      setBrain(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    initialize();
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
