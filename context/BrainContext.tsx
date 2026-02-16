import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrainState, UIState, QuickActionType, ClinicSession, ModuleType, SettingsSectionType } from '../types';
import { Repository } from '../data/repo';
import { MockRepository } from '../data/mockRepo';
import { supabase } from '../lib/supabaseClient';
import { hashPassword } from '../utils/security';

// === CHANGE HERE: Set to false to use Real Data (Supabase) ===
const USE_MOCK = false;

const initialUI: UIState = {
  activeModule: 'dashboard', activeSettingsSection: null, selectedPatientId: null,
  quickAction: null, toasts: [], debugMode: false, editingItem: null
};

const initialState: BrainState = {
  ui: initialUI,
  session: { isAuthenticated: false, user: null, clinicId: null, permissions: null },
  clinic: null,
  organization: { name: '', unit: '', cnpj: '', logo: '' },
  patients: [],
  records: [],
  occurrences: [],
  assessments: [],
  agenda: [],
  documents: [],
  medications: [],
  transactions: [],
  finances: { transactions: [] },
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
  navigate: (module: ModuleType, section?: SettingsSectionType) => void;
  setQuickAction: (action: QuickActionType) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  refreshData: () => Promise<void>;
  push: (table: string, data: any) => Promise<any>;
  update: (table: string, id: string, data: any) => Promise<void>;
  remove: (table: string, id: string) => Promise<void>;
  logout: () => void;
  login: (username: string, passwordRaw: string) => Promise<{ success: boolean; errorCode?: string }>;
  edit: (type: any, data: any) => void;
  cancelEdit: () => void;
  selectPatient: (id: string | null) => void;
}

const BrainContext = createContext<BrainContextType | undefined>(undefined);

export const BrainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brain, setBrain] = useState<BrainState>(initialState);

  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    // ANTI-SPAM: Prevent duplicate messages
    setBrain(prev => {
      const isDuplicate = prev.ui.toasts.some(t => t.message === message);
      if (isDuplicate) return prev;

      const id = Math.random().toString(36).substring(7);

      // Auto-remove after 5s
      setTimeout(() => {
        setBrain(current => ({ ...current, ui: { ...current.ui, toasts: current.ui.toasts.filter(t => t.id !== id) } }));
      }, 5000);

      return { ...prev, ui: { ...prev.ui, toasts: [...prev.ui.toasts, { id, message, type }] } };
    });
  };

  const push = async (table: string, data: any) => {
    try {
      // Safety Check
      if (data.clinic_id === undefined && brain.session.clinicId) {
        data.clinic_id = brain.session.clinicId;
      }

      if (!data.clinic_id) {
        console.error('🚨 ERRO: TENTATIVA DE SALVAR SEM CLINIC_ID', data);
        addToast('Erro: Sessão inválida (Clinic ID faltando). Faça login novamente.', 'error');
        throw new Error('Clinic ID Missing');
      }

      const { data: saved, error } = await supabase.from(table).insert(data).select().single();
      if (error) throw error;
      await initialize();
      return saved;
    } catch (err: any) {
      addToast(`Erro: ${err.message}`, 'error');
      throw err;
    }
  };

  const update = async (table: string, id: string, data: any) => {
    try {
      const { error } = await supabase.from(table).update(data).eq('id', id);
      if (error) throw error;
      addToast('Atualizado!', 'success');
      await initialize();
    } catch (err: any) { addToast('Erro ao editar', 'error'); throw err; }
  };

  const remove = async (table: string, id: string) => {
    try {
      // CASCADE DELETE (Manual)
      if (table === 'patients') {
        const { error: transError } = await supabase.from('transactions').delete().eq('patient_id', id);
        if (transError) console.warn('Erro ao excluir transações vinculadas:', transError);
      }

      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      addToast('Removido.', 'success');
      await initialize();
    } catch (err: any) { addToast('Erro ao excluir', 'error'); throw err; }
  };

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

  const selectPatient = (id: string | null) => {
    setBrain(prev => ({
      ...prev,
      ui: { ...prev.ui, selectedPatientId: id }
    }));
  };

  const login = async (username: string, passwordRaw: string) => {
    // MOCK LOGIN LOGIC (Only runs if USE_MOCK is true)
    if (USE_MOCK) {
      console.log("⚠️ MOCK MODE: Login Bypass");
      const mockUser = {
        id: 'mock_admin',
        username,
        role: 'ADMIN',
        clinic_id: '12345678-1234-1234-1234-123456789abc',
        permissions: { dashboard: true, patients: true, finance: true }
      };
      localStorage.setItem('vp_user_id', mockUser.id);
      await loadSystemData(mockUser);
      return { success: true };
    }

    // REAL SUPABASE LOGIN LOGIC
    try {
      const { data: user, error } = await supabase.from('app_users').select('*').eq('username', username).maybeSingle();

      if (error || !user) return { success: false, errorCode: 'USER_NOT_FOUND' };

      // Simple hash check (In production, use bcrypt/argon2 on backend or Supabase Auth)
      const hashedPassword = await hashPassword(passwordRaw);
      if (user.password_hash !== hashedPassword) return { success: false, errorCode: 'PASSWORD_MISMATCH' };

      localStorage.setItem('vp_user_id', user.id);
      await loadSystemData(user);
      return { success: true };
    } catch (err) { return { success: false, errorCode: 'UNKNOWN' }; }
  };

  const logout = () => { localStorage.removeItem('vp_user_id'); setBrain(initialState); };

  const loadSystemData = async (userData: any) => {
    try {
      const repo = USE_MOCK ? MockRepository : Repository;
      const data = await repo.fetchInitialData(userData.clinic_id);

      setBrain(prev => ({
        ...prev,
        session: {
          isAuthenticated: true,
          user: userData,
          clinicId: userData.clinic_id,
          permissions: userData.permissions || { dashboard: true, patients: true, finance: true }
        },
        patients: data.patients,
        transactions: data.transactions,
        finances: { transactions: data.transactions },
        agenda: data.agenda,
        occurrences: data.occurrences,
        assessments: data.assessments || [],
        documents: data.documents,
        medications: data.medications,
        users: data.users,
        inventory: data.inventory || [],
        pti: data.pti || [],
        healthRecords: data.healthRecords || [],
        loading: false
      }));
    } catch (error) { setBrain(prev => ({ ...prev, loading: false })); }
  };

  const initialize = async () => {
    const id = localStorage.getItem('vp_user_id');

    // MOCK INITIALIZATION
    if (USE_MOCK && id === 'mock_admin') {
      const mockUser = {
        id: 'mock_admin',
        username: 'admin',
        role: 'ADMIN',
        clinic_id: '12345678-1234-1234-1234-123456789abc',
        permissions: { dashboard: true, patients: true, finance: true }
      };
      await loadSystemData(mockUser);
      return;
    }

    // REAL INITIALIZATION
    if (id) {
      const { data } = await supabase.from('app_users').select('*').eq('id', id).single();
      if (data) await loadSystemData(data);
      else setBrain(prev => ({ ...prev, loading: false }));
    } else setBrain(prev => ({ ...prev, loading: false }));
  };

  useEffect(() => { initialize(); }, []);

  return (
    <BrainContext.Provider value={{ brain, navigate, setQuickAction: (a) => setBrain(p => ({ ...p, ui: { ...p.ui, quickAction: a } })), addToast, removeToast: (id) => { }, refreshData: initialize, push, update, remove, logout, login, edit: (t, d) => setBrain(p => ({ ...p, ui: { ...p.ui, editingItem: { type: t, data: d } } })), cancelEdit: () => setBrain(p => ({ ...p, ui: { ...p.ui, editingItem: null } })), selectPatient }}>
      {children}
    </BrainContext.Provider>
  );
};

export const useBrain = () => {
  const context = useContext(BrainContext);
  if (!context) throw new Error("useBrain error");
  return context;
};
