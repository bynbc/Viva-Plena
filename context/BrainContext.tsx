import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { BrainState, UIState, QuickActionType, ModuleType, SettingsSectionType } from '../types';
import { Repository } from '../data/repo';
import { MockRepository } from '../data/mockRepo';
import { supabase } from '../lib/supabaseClient';
import { hashPassword } from '../utils/security';
import toast from 'react-hot-toast';

const USE_MOCK = false;
const LOCAL_DB_KEY = 'vp_local_db_v1';

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

const mergeById = (remote: any[] = [], local: any[] = []) => {
  const map = new Map<string, any>();
  [...remote, ...local].forEach((item) => {
    if (!item?.id) return;
    map.set(item.id, { ...map.get(item.id), ...item });
  });
  return Array.from(map.values());
};

const readLocalDb = (): Record<string, any[]> => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_DB_KEY) || '{}');
  } catch {
    return {};
  }
};

const writeLocalDb = (db: Record<string, any[]>) => {
  localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(db));
};

const localTableKey = (table: string, clinicId: string) => `${clinicId}:${table}`;

const localGetTable = (table: string, clinicId: string) => {
  const db = readLocalDb();
  return db[localTableKey(table, clinicId)] || [];
};

const localSetTable = (table: string, clinicId: string, rows: any[]) => {
  const db = readLocalDb();
  db[localTableKey(table, clinicId)] = rows;
  writeLocalDb(db);
};

const localUpsert = (table: string, clinicId: string, row: any) => {
  const rows = localGetTable(table, clinicId);
  const idx = rows.findIndex((r: any) => r.id === row.id);
  if (idx >= 0) rows[idx] = { ...rows[idx], ...row };
  else rows.unshift(row);
  localSetTable(table, clinicId, rows);
};

const localDelete = (table: string, clinicId: string, id: string) => {
  const rows = localGetTable(table, clinicId).filter((r: any) => r.id !== id);
  localSetTable(table, clinicId, rows);
};

const resolveClinicId = (userData: any, fallback?: string | null) =>
  userData?.clinic_id || userData?.clinicId || fallback || null;

export const BrainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brain, setBrain] = useState<BrainState>(initialState);
  const failedTablesRef = useRef<Set<string>>(new Set());

  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substring(7);
    const show = { success: toast.success, error: toast.error, info: toast, warning: toast };

    show[type](message, {
      id,
      duration: type === 'warning' ? 6000 : 4000,
      icon: type === 'warning' ? '⚠️' : undefined,
    });

    setBrain(prev => ({ ...prev, ui: { ...prev.ui, toasts: [...prev.ui.toasts, { id, message, type }] } }));
    setTimeout(() => setBrain(prev => ({ ...prev, ui: { ...prev.ui, toasts: prev.ui.toasts.filter(t => t.id !== id) } })), 5000);
  };

  const removeToast = (id: string) => {
    toast.dismiss(id);
    setBrain(prev => ({ ...prev, ui: { ...prev.ui, toasts: prev.ui.toasts.filter(t => t.id !== id) } }));
  };

  const hydrateFromLocal = (clinicId: string, remote: any) => ({
    patients: mergeById(remote.patients, localGetTable('patients', clinicId)),
    transactions: mergeById(remote.transactions, localGetTable('transactions', clinicId)),
    agenda: mergeById(remote.agenda, localGetTable('agenda', clinicId)),
    occurrences: mergeById(remote.occurrences, localGetTable('occurrences', clinicId)),
    documents: mergeById(remote.documents, localGetTable('documents', clinicId)),
    inventory: mergeById(remote.inventory, localGetTable('inventory', clinicId)),
    pti: mergeById(remote.pti, localGetTable('pti_goals', clinicId)),
    healthRecords: mergeById(remote.healthRecords, localGetTable('health_records', clinicId)),
    medications: mergeById(remote.medications, localGetTable('medications', clinicId)),
    users: mergeById(remote.users, localGetTable('app_users', clinicId)),
    assessments: mergeById(remote.assessments, localGetTable('assessments', clinicId)),
  });

  const loadSystemData = async (userData: any) => {
    const clinicId = resolveClinicId(userData, brain.session.clinicId);

    if (!clinicId) {
      addToast('Usuário sem clinic_id. Operando em modo local temporário.', 'warning');
      setBrain(prev => ({
        ...prev,
        session: { ...prev.session, isAuthenticated: true, user: userData, clinicId: 'local-clinic' },
        loading: false
      }));
      return;
    }

    try {
      const repo = USE_MOCK ? MockRepository : Repository;
      const remote = await repo.fetchInitialData(clinicId);
      const data = hydrateFromLocal(clinicId, remote);

      setBrain(prev => ({
        ...prev,
        session: {
          isAuthenticated: true,
          user: { ...userData, clinic_id: clinicId },
          clinicId,
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
    } catch {
      const local = hydrateFromLocal(clinicId, {} as any);
      setBrain(prev => ({
        ...prev,
        session: {
          isAuthenticated: true,
          user: { ...userData, clinic_id: clinicId },
          clinicId,
          permissions: userData.permissions || { dashboard: true, patients: true, finance: true }
        },
        patients: local.patients,
        transactions: local.transactions,
        finances: { transactions: local.transactions },
        agenda: local.agenda,
        occurrences: local.occurrences,
        assessments: local.assessments,
        documents: local.documents,
        medications: local.medications,
        users: local.users,
        inventory: local.inventory,
        pti: local.pti,
        healthRecords: local.healthRecords,
        loading: false
      }));
      addToast('Sem conexão com banco. Dados salvos localmente.', 'warning');
    }
  };

  const initialize = async () => {
    const id = localStorage.getItem('vp_user_id');

    if (USE_MOCK && id === 'mock_admin') {
      const mockUser = {
        id: 'mock_admin', username: 'admin', role: 'ADMIN', clinic_id: '12345678-1234-1234-1234-123456789abc',
        permissions: { dashboard: true, patients: true, finance: true }
      };
      await loadSystemData(mockUser);
      return;
    }

    if (id) {
      const { data } = await supabase.from('app_users').select('*').eq('id', id).maybeSingle();
      if (data) await loadSystemData(data);
      else setBrain(prev => ({ ...prev, loading: false }));
    } else setBrain(prev => ({ ...prev, loading: false }));
  };

  const push = async (table: string, data: any) => {
    const clinicId = data.clinic_id || brain.session.clinicId || resolveClinicId(brain.session.user) || 'local-clinic';

    const payload = { ...data, clinic_id: clinicId, id: data.id || crypto.randomUUID() };

    try {
      if (failedTablesRef.current.has(table)) throw new Error('TABLE_OFFLINE');
      const { data: saved, error } = await supabase.from(table).insert(payload).select().single();
      if (error) throw error;
      localUpsert(table, clinicId, saved || payload);
      await initialize();
      return saved || payload;
    } catch (err: any) {
      failedTablesRef.current.add(table);
      localUpsert(table, clinicId, payload);
      await initialize();
      addToast(`Salvo localmente (${table}). Banco indisponível.`, 'warning');
      return payload;
    }
  };

  const update = async (table: string, id: string, data: any) => {
    const clinicId = brain.session.clinicId || resolveClinicId(brain.session.user) || 'local-clinic';

    try {
      if (failedTablesRef.current.has(table)) throw new Error('TABLE_OFFLINE');
      const { error } = await supabase.from(table).update(data).eq('id', id);
      if (error) throw error;
      const old = localGetTable(table, clinicId).find((r: any) => r.id === id) || { id, clinic_id: clinicId };
      localUpsert(table, clinicId, { ...old, ...data, id });
      addToast('Atualizado!', 'success');
      await initialize();
    } catch (err) {
      failedTablesRef.current.add(table);
      const old = localGetTable(table, clinicId).find((r: any) => r.id === id) || { id, clinic_id: clinicId };
      localUpsert(table, clinicId, { ...old, ...data, id });
      addToast('Atualizado localmente.', 'warning');
      await initialize();
    }
  };

  const remove = async (table: string, id: string) => {
    const clinicId = brain.session.clinicId || resolveClinicId(brain.session.user) || 'local-clinic';

    try {
      if (failedTablesRef.current.has(table)) throw new Error('TABLE_OFFLINE');
      if (table === 'patients') {
        await supabase.from('transactions').delete().eq('patient_id', id);
      }
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      localDelete(table, clinicId, id);
      addToast('Removido.', 'success');
      await initialize();
    } catch (err) {
      failedTablesRef.current.add(table);
      localDelete(table, clinicId, id);
      addToast('Removido localmente.', 'warning');
      await initialize();
    }
  };

  const navigate = (module: ModuleType, section?: SettingsSectionType) => {
    setBrain(prev => ({
      ...prev,
      ui: { ...prev.ui, activeModule: module, activeSettingsSection: section || null, selectedPatientId: null }
    }));
  };

  const selectPatient = (id: string | null) => {
    setBrain(prev => ({ ...prev, ui: { ...prev.ui, selectedPatientId: id } }));
  };

  const login = async (username: string, passwordRaw: string) => {
    if (USE_MOCK) {
      const mockUser = {
        id: 'mock_admin', username, role: 'ADMIN', clinic_id: '12345678-1234-1234-1234-123456789abc',
        permissions: { dashboard: true, patients: true, finance: true }
      };
      localStorage.setItem('vp_user_id', mockUser.id);
      await loadSystemData(mockUser);
      return { success: true };
    }

    try {
      const { data: user, error } = await supabase.from('app_users').select('*').eq('username', username).maybeSingle();
      if (error || !user) return { success: false, errorCode: 'USER_NOT_FOUND' };

      const hashedPassword = await hashPassword(passwordRaw);
      if (user.password_hash !== hashedPassword) return { success: false, errorCode: 'PASSWORD_MISMATCH' };

      const clinicId = resolveClinicId(user);
      const normalizedUser = { ...user, clinic_id: clinicId };

      localStorage.setItem('vp_user_id', user.id);
      await loadSystemData(normalizedUser);
      return { success: true };
    } catch {
      return { success: false, errorCode: 'UNKNOWN' };
    }
  };

  const logout = () => {
    localStorage.removeItem('vp_user_id');
    setBrain(initialState);
  };

  useEffect(() => { initialize(); }, []);

  return (
    <BrainContext.Provider value={{
      brain,
      navigate,
      setQuickAction: (a) => setBrain(p => ({ ...p, ui: { ...p.ui, quickAction: a } })),
      addToast,
      removeToast,
      refreshData: initialize,
      push,
      update,
      remove,
      logout,
      login,
      edit: (t, d) => setBrain(p => ({ ...p, ui: { ...p.ui, editingItem: { type: t, data: d } } })),
      cancelEdit: () => setBrain(p => ({ ...p, ui: { ...p.ui, editingItem: null } })),
      selectPatient
    }}>
      {children}
    </BrainContext.Provider>
  );
};

export const useBrain = () => {
  const context = useContext(BrainContext);
  if (!context) throw new Error('useBrain error');
  return context;
};
