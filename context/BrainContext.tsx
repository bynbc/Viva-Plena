import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrainState, UIState, QuickActionType, ClinicSession, ModuleType, SettingsSectionType } from '../types';
import { Repository } from '../data/repo';
import { supabase } from '../lib/supabaseClient';
import { hashPassword } from '../utils/security';

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
  selectPatient: (id: string) => void;
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

// --- FUNÇÃO AUXILIAR: O DETETIVE DE ERROS ---
// Ela pega o erro técnico e transforma em algo legível na tela
const formatError = (error: any): string => {
  if (!error) return "Erro desconhecido";
  
  let msg = error.message || "Erro no servidor";
  
  // Traduz erros comuns do Supabase/Postgres
  if (msg.includes("violates row-level security")) return "ERRO DE PERMISSÃO: Seu usuário não pode salvar nesta tabela.";
  if (msg.includes("null value in column")) return `DADOS FALTANDO: O campo obrigatório '${error.column || '?'}' está vazio.`;
  if (msg.includes("violates foreign key")) return "ERRO DE VÍNCULO: Você tentou usar um ID que não existe.";
  if (msg.includes("duplicate key")) return "DUPLICIDADE: Já existe um registro com esses dados.";
  if (msg.includes("column") && msg.includes("does not exist")) return "ERRO DE CÓDIGO: O sistema tentou salvar um campo que não existe no banco.";

  // Se tiver detalhes técnicos, adiciona
  if (error.details) msg += ` | Detalhe: ${error.details}`;
  if (error.hint) msg += ` | Dica: ${error.hint}`;
  
  return msg;
};

export const BrainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brain, setBrain] = useState<BrainState>(initialState);

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
    setTimeout(() => removeToast(id), 5000); // 5 segundos para ler o erro
  };

  // --- ACTIONS (CRUD) COM PROTEÇÃO GLOBAL ---
  
  const push = async (table: string, data: any) => {
    try {
       // Tenta salvar no Supabase
       const { data: savedData, error } = await supabase.from(table).insert(data).select().single();
       
       if (error) throw error; // Se o Supabase reclamar, joga pro catch lá embaixo
       
       await initialize(); 
       return savedData;
    } catch (err: any) {
       console.error(`❌ Erro GLOBAL ao salvar em ${table}:`, err);
       
       // AQUI A MÁGICA: Mostra o erro na tela para qualquer função
       const errorMsg = formatError(err);
       addToast(`ERRO AO SALVAR: ${errorMsg}`, 'error');
       
       throw err; // Repassa o erro pra quem chamou poder parar o "loading"
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
      console.error(`❌ Erro GLOBAL ao atualizar ${table}:`, err);
      const errorMsg = formatError(err);
      addToast(`ERRO AO EDITAR: ${errorMsg}`, 'error');
      throw err;
    }
  };

  const remove = async (table: string, id: string) => {
    // Pacientes: evita DELETE físico para não quebrar integridade referencial (409).
    if (table === 'patients') {
      try {
        const { error: deletedError } = await supabase.from('patients').update({ status: 'deleted' }).eq('id', id);
        if (!deletedError) {
          addToast('Paciente removido.', 'success');
          await initialize();
          return;
        }

        const { error: dischargedError } = await supabase.from('patients').update({ status: 'discharged' }).eq('id', id);
        if (!dischargedError) {
          addToast('Paciente marcado como inativo (alta).', 'warning');
          await initialize();
          return;
        }

        throw dischargedError;
      } catch (err: any) {
        console.error(`❌ Erro GLOBAL ao remover de ${table}:`, err);
        const errorMsg = formatError(err);
        addToast(`ERRO AO APAGAR: ${errorMsg}`, 'error');
        return;
      }
    }

    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      
      addToast('Item removido.', 'success');
      await initialize();
    } catch (err: any) {
      console.error(`❌ Erro GLOBAL ao remover de ${table}:`, err);
      const errorMsg = formatError(err);
      addToast(`ERRO AO APAGAR: ${errorMsg}`, 'error');
      throw err;
    }
  };

  // --- NAVEGAÇÃO & UI ---
  const navigate = (module: ModuleType, section?: SettingsSectionType) => {
    setBrain(prev => ({ 
      ...prev, 
      ui: {
        ...prev.ui,
        activeModule: module,
        activeSettingsSection: section || null,
        selectedPatientId: null
      }
    }));
  };

  const selectPatient = (id: string) => {
    setBrain(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        activeModule: 'patients',
        selectedPatientId: id
      }
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

  const updateUserPermission = (permission: any) => {
    setBrain(prev => ({
      ...prev,
      session: { ...prev.session, permissions: permission }
    }));
  };

  // --- AUTH ---
  const login = async (username: string, passwordRaw: string) => {
    try {
      const { data: user, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (error) {
        addToast("Erro de conexão com o banco.", "error");
        return { success: false, errorCode: 'CONN_ERROR' };
      }

      if (!user) {
        return { success: false, errorCode: 'USER_NOT_FOUND' };
      }

      const inputHash = hashPassword(passwordRaw);
      if (user.password_hash !== inputHash) {
        return { success: false, errorCode: 'PASSWORD_MISMATCH' };
      }

      localStorage.setItem('vp_user_id', user.id);
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
      } catch (error: any) {
          console.error("Erro ao carregar dados:", error);
          const msg = formatError(error);
          addToast(`Erro ao carregar sistema: ${msg}`, 'error');
          setBrain(prev => ({ ...prev, loading: false }));
      }
  };

  const initialize = async () => {
    try {
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
      brain, navigate, selectPatient, setQuickAction, addToast, removeToast, refreshData: initialize, 
      updateUserPermission, push, update, remove, logout, login, edit, cancelEdit 
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
