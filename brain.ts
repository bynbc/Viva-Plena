import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { 
  BrainState, UIState, ModuleType, SettingsSectionType, 
  Toast, ToastType, QuickActionType, EditingItem, AppUser
} from '../types';
import { repo, fetchTransactions } from '../data/repo'; 
import { supabase } from '../lib/supabaseClient';

interface BrainContextType {
  brain: BrainState;
  loading: boolean;
  login: (username: string, passwordRaw: string) => Promise<{ success: boolean, errorCode?: string }>;
  logout: () => void;
  update: (table: string, id: string, data: any) => Promise<void>;
  push: (table: string, item: any) => Promise<void>;
  remove: (table: string, id: string) => Promise<void>;
  navigate: (module: ModuleType, section?: SettingsSectionType) => void;
  setUI: (updates: Partial<UIState>) => void;
  setQuickAction: (action: QuickActionType) => void;
  edit: (table: EditingItem['type'], data: any) => void;
  cancelEdit: () => void;
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const BrainContext = createContext<BrainContextType | undefined>(undefined);

const INITIAL_UI_STATE: UIState = {
  activeModule: 'dashboard',
  activeSettingsSection: null,
  selectedPatientId: null,
  quickAction: null,
  toasts: [],
  debugMode: true,
  isNewModalOpen: false,
  editingItem: null
};

const INITIAL_BRAIN_STATE: BrainState = {
  ui: INITIAL_UI_STATE,
  session: { isAuthenticated: false, user: null, clinicId: null, permissions: null },
  clinic: null,
  organization: { name: 'VivaPlena', unit: 'Unidade Principal', cnpj: '', logo: 'V' },
  patients: [], records: [], occurrences: [], agenda: [], documents: [], medications: [], 
  transactions: [], finances: { transactions: [] }, settings: {}, users: [], logs: [],
  plan: { name: 'ESSENCIAL', status: 'Ativo', limits: { patients: 20, users: 5 }, usage: { patients: 0, users: 0 } },
  chartData: [], loading: true, lastError: null
};

export const BrainProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [brain, setBrain] = useState<BrainState>(INITIAL_BRAIN_STATE);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = crypto.randomUUID();
    setBrain(prev => ({
      ...prev,
      ui: { ...prev.ui, toasts: [...prev.ui.toasts, { id, message, type }] }
    }));
    setTimeout(() => removeToast(id), 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setBrain(prev => ({
      ...prev,
      ui: { ...prev.ui, toasts: prev.ui.toasts.filter(t => t.id !== id) }
    }));
  }, []);

  // --- AQUI ESTÁ O SEGREDO DA PRIVACIDADE ---
  const loadClinicData = useCallback(async (clinicId: string, currentUser?: AppUser) => {
    setBrain(prev => ({ ...prev, loading: true }));
    try {
      const [
        { data: patients }, { data: records }, { data: occurrences }, { data: agenda },
        { data: documents }, { data: settings }, users, transactions, { data: medications },
        { data: logs }
      ] = await Promise.all([
        repo.listPatients(clinicId), repo.listRecords(clinicId), repo.listOccurrences(clinicId),
        repo.listAgenda(clinicId), repo.listDocuments(clinicId), repo.listSettings(clinicId),
        repo.listClinicUsers(clinicId), fetchTransactions(clinicId).catch(() => []),
        repo.listMedications(clinicId), repo.listLogs(clinicId).catch(() => ({ data: [] }))
      ]);

      // FILTRO DE PRIVACIDADE: Se não for ADMIN, vê apenas o que criou.
      // Observação: 'transactions' não tem created_by, então depende da permissão de módulo.
      let finalPatients = patients || [];
      let finalRecords = records || [];
      let finalOccurrences = occurrences || [];
      let finalAgenda = agenda || [];
      let finalDocuments = documents || [];
      let finalMedications = medications || [];

      if (currentUser && currentUser.role !== 'ADMIN') {
        const myUser = currentUser.username;
        finalPatients = finalPatients.filter(p => p.created_by === myUser);
        finalRecords = finalRecords.filter(r => r.created_by === myUser);
        finalOccurrences = finalOccurrences.filter(o => o.created_by === myUser);
        finalAgenda = finalAgenda.filter(a => a.created_by === myUser);
        finalDocuments = finalDocuments.filter(d => d.created_by === myUser);
        // Medicações geralmente são compartilhadas, mas se quiser filtrar:
        // finalMedications = finalMedications.filter(m => m.created_by === myUser);
      }

      setBrain(prev => ({
        ...prev,
        patients: finalPatients,
        records: (finalRecords).map((r: any) => ({ ...r, patient_name: r.patient?.name })),
        occurrences: (finalOccurrences).map((o: any) => ({ ...o, patient_name: o.patient?.name })),
        agenda: (finalAgenda).map((a: any) => ({ ...a, patient_name: a.patient?.name })),
        documents: (finalDocuments).map((d: any) => ({ ...d, patient_name: d.patient?.name })),
        settings: (settings || []).reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {}),
        users: users as any,
        transactions: transactions || [],
        finances: { transactions: transactions || [] },
        medications: finalMedications || [],
        logs: (logs || []).map((l: any) => ({ ...l, user: l.user?.username || 'Sistema' })),
        loading: false
      }));
    } catch (err: any) {
      setBrain(prev => ({ ...prev, loading: false, lastError: err.message }));
      addToast(err.message, 'error');
    }
  }, [addToast]);

  const setupSubscriptions = useCallback((clinicId: string, user: AppUser) => {
    const channel = supabase.channel(`clinic-${clinicId}`)
      .on('postgres_changes', { event: '*', schema: 'public', filter: `clinic_id=eq.${clinicId}` }, () => loadClinicData(clinicId, user))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadClinicData]);

  useEffect(() => {
    const syncFinance = async () => {
      if (brain.ui.activeModule === 'finance' && brain.session.clinicId) {
        try {
          const data = await fetchTransactions(brain.session.clinicId);
          setBrain(prev => ({ ...prev, transactions: data, finances: { transactions: data } }));
        } catch (error) { console.error("Erro finanças:", error); }
      }
    };
    syncFinance();
  }, [brain.ui.activeModule, brain.session.clinicId]);

  const login = async (username: string, passwordRaw: string) => {
    setBrain(prev => ({ ...prev, loading: true }));
    try {
      const result = await repo.loginInternal(username, passwordRaw);
      if (!result.success || !result.data) {
        setBrain(prev => ({ ...prev, loading: false }));
        if (result.errorCode === 'DB_ERROR' || result.errorCode === 'ENV_INVALID') addToast("Erro DB", 'error');
        return { success: false, errorCode: result.errorCode };
      }
      const { user, clinicId, permissions } = result.data;
      localStorage.setItem('session_user_id', user.id);
      localStorage.setItem('session_username', user.username);
      localStorage.setItem('session_clinic_id', clinicId);
      
      const { data: clinic } = await repo.getClinic(clinicId);
      
      setBrain(prev => ({
        ...prev, session: { isAuthenticated: true, user, clinicId, permissions }, clinic, loading: false
      }));
      
      await loadClinicData(clinicId, user);
      setupSubscriptions(clinicId, user);
      
      repo.createLog(clinicId, user.id, 'LOGIN', 'Login realizado');
      return { success: true };
    } catch (err: any) {
      setBrain(prev => ({ ...prev, loading: false }));
      return { success: false, errorCode: 'DB_ERROR' };
    }
  };

  const logout = () => {
    localStorage.clear();
    setBrain(INITIAL_BRAIN_STATE);
  };

  useEffect(() => {
    const uid = localStorage.getItem('session_user_id');
    const cid = localStorage.getItem('session_clinic_id');
    if (uid && cid) {
       (async () => {
         try {
           const { data: clinicUser } = await supabase.from('clinic_users').select('permissions').eq('user_id', uid).eq('clinic_id', cid).maybeSingle();
           const { data: appUser } = await supabase.from('app_users').select('id, username, role, is_active').eq('id', uid).maybeSingle();
           
           if (clinicUser && appUser && appUser.is_active) {
             const { data: clinic } = await repo.getClinic(cid);
             // Casting manual para garantir tipagem
             const fullUser = appUser as AppUser;
             
             setBrain(prev => ({
               ...prev, session: { isAuthenticated: true, user: fullUser, clinicId: cid, permissions: clinicUser.permissions as any }, clinic, loading: false
             }));
             await loadClinicData(cid, fullUser);
             setupSubscriptions(cid, fullUser);
           } else { logout(); }
         } catch (e) { logout(); }
       })();
    } else { setBrain(prev => ({ ...prev, loading: false })); }
  }, []);

  const navigate = (module: ModuleType, section?: SettingsSectionType) => {
    setBrain(prev => ({ ...prev, ui: { ...prev.ui, activeModule: module, activeSettingsSection: section || null, selectedPatientId: module === 'patient-profile' ? prev.ui.selectedPatientId : null } }));
  };

  const setUI = (updates: Partial<UIState>) => {
    setBrain(prev => ({ ...prev, ui: { ...prev.ui, ...updates } }));
  };

  const setQuickAction = (action: QuickActionType) => {
    setBrain(prev => ({ ...prev, ui: { ...prev.ui, quickAction: action } }));
  };

  const edit = (table: EditingItem['type'], data: any) => {
    setBrain(prev => ({ ...prev, ui: { ...prev.ui, editingItem: { type: table, data } } }));
  };

  const cancelEdit = () => {
    setBrain(prev => ({ ...prev, ui: { ...prev.ui, editingItem: null } }));
  };

  const push = async (table: string, item: any) => {
      const { clinicId, user } = brain.session;
      if (!clinicId || !user) return;
      try {
        let res; let logAction = '';
        if (table === 'patients') { res = await repo.createPatient(clinicId, user.id, item); logAction = 'Criou Paciente'; }
        else if (table === 'records') { res = await repo.createRecord(clinicId, user.id, item); logAction = 'Criou Evolução'; }
        else if (table === 'occurrences') { res = await repo.createOccurrence(clinicId, user.id, item); logAction = 'Criou Ocorrência'; }
        else if (table === 'agenda') { res = await repo.createAgendaEvent(clinicId, user.id, item); logAction = 'Criou Agenda'; }
        else if (table === 'documents') { res = await repo.createDocument(clinicId, user.id, item); logAction = 'Criou Documento'; }
        else if (table === 'users') { res = await repo.createAppUser(clinicId, user.id, item); logAction = 'Criou Usuário'; }
        else if (table === 'medications') { res = await repo.createMedication(clinicId, user.id, item); logAction = 'Criou Medicação'; }
        else if (table === 'transactions') { res = await repo.createTransaction(clinicId, item); logAction = 'Criou Transação'; }
  
        if (res?.error) throw res.error;
        repo.createLog(clinicId, user.id, logAction, `Novo item em ${table}`);
        addToast('Salvo com sucesso.', 'success');
        
        // Recarrega os dados aplicando o filtro do usuário atual
        loadClinicData(clinicId, user);
      } catch (err: any) { addToast(err.message || 'Erro ao salvar.', 'error'); throw err; }
  };

  const update = async (table: string, id: string, data: any) => {
    const { clinicId, user } = brain.session;
    if (!clinicId || !user) return;
    try {
      let res;
      if (table === 'patients') res = await repo.updatePatient(clinicId, id, data);
      else if (table === 'settings') res = await repo.updateSetting(clinicId, id, data);
      else if (table === 'transactions') res = await repo.updateTransaction(clinicId, id, data);
      else if (table === 'medications') res = await repo.updateMedication(clinicId, id, data);
      else if (table === 'users') res = await repo.updateClinicUser(clinicId, id, data);

      if (res?.error) throw res.error;
      repo.createLog(clinicId, user.id, 'Edição', `Alterou ${table}`);
      addToast('Atualizado com sucesso.', 'success');
      
      cancelEdit(); 
      
      if (table === 'transactions') {
         const newData = await fetchTransactions(clinicId);
         setBrain(prev => ({ ...prev, transactions: newData, finances: { transactions: newData } }));
      }
      if (['medications', 'users', 'patients'].includes(table)) loadClinicData(clinicId, user);
    } catch (err: any) { addToast(err.message || 'Erro ao atualizar.', 'error'); throw err; }
  };

  const remove = async (table: string, id: string) => {
    const { clinicId, user } = brain.session;
    if (!clinicId || !user) return;
    try {
      let res;
      if (table === 'patients') res = await repo.deletePatient(clinicId, id);
      else if (table === 'records') res = await repo.deleteRecord(clinicId, id);
      else if (table === 'occurrences') res = await repo.deleteOccurrence(clinicId, id);
      else if (table === 'agenda') res = await repo.deleteAgendaEvent(clinicId, id);
      else if (table === 'documents') res = await repo.deleteDocument(clinicId, id);
      else if (table === 'medications') res = await repo.deleteMedication(clinicId, id);
      else if (table === 'transactions') res = await repo.deleteTransaction(clinicId, id);
      else if (table === 'users') res = await repo.deleteClinicUser(clinicId, id);

      if (res?.error) throw res.error;
      repo.createLog(clinicId, user.id, 'Exclusão', `Removeu de ${table}`);
      addToast('Removido com sucesso.', 'success');
      loadClinicData(clinicId, user);
    } catch (err: any) { addToast(err.message || 'Erro ao remover.', 'error'); throw err; }
  };

  return (
    <BrainContext.Provider value={{ 
      brain, loading: brain.loading, login, logout, update, push, remove, 
      navigate, setUI, setQuickAction, addToast, removeToast, edit, cancelEdit 
    }}>
      {children}
    </BrainContext.Provider>
  );
};

export const useBrain = () => {
  const context = useContext(BrainContext);
  if (!context) throw new Error('useBrain must be used within a BrainProvider');
  return context;
};

export const usePatients = () => { const { brain } = useBrain(); return { patients: brain.patients }; };
export const useOccurrences = () => { const { brain } = useBrain(); return { occurrences: brain.occurrences }; };
export const useRecords = () => { const { brain } = useBrain(); return { records: brain.records }; };
export const useAgenda = () => { const { brain } = useBrain(); return { agenda: brain.agenda }; };
export const usePlan = () => { const { brain } = useBrain(); return { plan: brain.plan }; };
