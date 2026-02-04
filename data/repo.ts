import { supabase, validateSupabaseEnv, sanitizedUrl, sanitizedKey } from '../lib/supabaseClient';
import { 
  Patient, DailyRecord, Occurrence, AgendaEvent, 
  DocumentRecord, UserPermissions, AppUser 
} from '../types';

export const PLAN_LIMITS = {
  ESSENCIAL: { patients: 20, users: 5 },
  PROFISSIONAL: { patients: 100, users: 20 },
  ENTERPRISE: { patients: 9999, users: 9999 }
};

export type LoginErrorCode = 
  | 'ENV_INVALID'
  | 'SUPABASE_CONN_ERROR'
  | 'USER_NOT_FOUND' 
  | 'USER_DISABLED' 
  | 'PASSWORD_MISMATCH' 
  | 'NO_CLINIC_MEMBERSHIP' 
  | 'DB_ERROR';

export interface LoginResult {
  success: boolean;
  errorCode?: LoginErrorCode;
  errorMessage?: string;
  data?: {
    user: AppUser;
    clinicId: string;
    permissions: UserPermissions;
  };
}

export const repo = {
  async checkConnectivity(): Promise<boolean> {
    try {
      const response = await fetch(`${sanitizedUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': sanitizedKey,
          'Authorization': `Bearer ${sanitizedKey}`
        }
      });
      return response.ok || response.status === 200;
    } catch (err) {
      console.error("[SUPABASE_CONN_FAILED]:", err);
      return false;
    }
  },

  async loginInternal(usernameInput: string, passwordInput: string): Promise<LoginResult> {
    const u = usernameInput.trim();
    const p = passwordInput.trim();

    const diag = validateSupabaseEnv();
    if (!diag.ok) {
      return { 
        success: false, 
        errorCode: 'ENV_INVALID', 
        errorMessage: `VITE_SUPABASE_URL ou KEY ausente: ${diag.errors.join(', ')}`
      };
    }

    const isOnline = await this.checkConnectivity();
    if (!isOnline) {
      return { success: false, errorCode: 'SUPABASE_CONN_ERROR' };
    }

    const { data: user, error: userError } = await supabase
      .from('app_users')
      .select('id, username, password_hash, role, is_active')
      .eq('username', u)
      .maybeSingle();

    if (userError) {
      console.error("DB_ERROR:", userError);
      return { success: false, errorCode: 'DB_ERROR' };
    }

    if (!user) return { success: false, errorCode: 'USER_NOT_FOUND' };
    if (!user.is_active) return { success: false, errorCode: 'USER_DISABLED' };
    if (p !== user.password_hash) return { success: false, errorCode: 'PASSWORD_MISMATCH' };

    const { data: clinicUser, error: cuError } = await supabase
      .from('clinic_users')
      .select('clinic_id, permissions')
      .eq('user_id', user.id)
      .maybeSingle();

    if (cuError || !clinicUser) return { success: false, errorCode: 'NO_CLINIC_MEMBERSHIP' };

    return {
      success: true,
      data: {
        user: user as AppUser,
        clinicId: clinicUser.clinic_id,
        permissions: clinicUser.permissions as UserPermissions
      }
    };
  },

  async getClinic(id: string) {
    return supabase.from('clinics').select('*').eq('id', id).single();
  },

  // --- PACIENTES ---
  async listPatients(clinicId: string) {
    return supabase.from('patients').select('*').eq('clinic_id', clinicId).order('name');
  },
  async createPatient(clinicId: string, userId: string, payload: Partial<Patient>) {
    const { data: clinic } = await repo.getClinic(clinicId);
    const { count } = await supabase.from('patients').select('*', { count: 'exact', head: true }).eq('clinic_id', clinicId).eq('status', 'active');
    const limit = PLAN_LIMITS[clinic?.plan as keyof typeof PLAN_LIMITS]?.patients || 20;
    if (payload.status === 'active' && (count || 0) >= limit) throw { code: 'PLAN_LIMIT_PATIENTS', message: `Limite atingido.` };
    return supabase.from('patients').insert([{ ...payload, clinic_id: clinicId, created_by: userId }]).select().single();
  },
  async updatePatient(clinicId: string, id: string, patch: Partial<Patient>) {
    return supabase.from('patients').update(patch).eq('id', id).eq('clinic_id', clinicId);
  },
  async deletePatient(clinicId: string, id: string) {
    return supabase.from('patients').delete().eq('id', id).eq('clinic_id', clinicId);
  },

  // --- MODULOS ---
  async listRecords(clinicId: string) { return supabase.from('records').select(`*, patient:patients(name)`).eq('clinic_id', clinicId).order('created_at', { ascending: false }); },
  async createRecord(clinicId: string, userId: string, payload: any) { return supabase.from('records').insert([{ ...payload, clinic_id: clinicId, created_by: userId }]).select().single(); },
  async deleteRecord(clinicId: string, id: string) { return supabase.from('records').delete().eq('id', id).eq('clinic_id', clinicId); },

  async listOccurrences(clinicId: string) { return supabase.from('occurrences').select(`*, patient:patients(name)`).eq('clinic_id', clinicId).order('created_at', { ascending: false }); },
  async createOccurrence(clinicId: string, userId: string, payload: any) { return supabase.from('occurrences').insert([{ ...payload, clinic_id: clinicId, created_by: userId }]).select().single(); },
  async deleteOccurrence(clinicId: string, id: string) { return supabase.from('occurrences').delete().eq('id', id).eq('clinic_id', clinicId); },

  async listAgenda(clinicId: string) { return supabase.from('agenda').select(`*, patient:patients(name)`).eq('clinic_id', clinicId).order('start_at'); },
  async createAgendaEvent(clinicId: string, userId: string, payload: any) { return supabase.from('agenda').insert([{ ...payload, clinic_id: clinicId, created_by: userId }]).select().single(); },
  async deleteAgendaEvent(clinicId: string, id: string) { return supabase.from('agenda').delete().eq('id', id).eq('clinic_id', clinicId); },

  async listDocuments(clinicId: string) { return supabase.from('documents').select(`*, patient:patients(name)`).eq('clinic_id', clinicId).order('created_at', { ascending: false }); },
  async createDocument(clinicId: string, userId: string, payload: any) { return supabase.from('documents').insert([{ ...payload, clinic_id: clinicId, created_by: userId }]).select().single(); },
  async deleteDocument(clinicId: string, id: string) { return supabase.from('documents').delete().eq('id', id).eq('clinic_id', clinicId); },

  async listSettings(clinicId: string) { return supabase.from('settings').select('*').eq('clinic_id', clinicId); },
  async updateSetting(clinicId: string, key: string, value: any) { return supabase.from('settings').upsert({ clinic_id: clinicId, key, value }, { onConflict: 'clinic_id,key' }); },

  // --- USUÁRIOS ---
  async listClinicUsers(clinicId: string) {
    const { data, error } = await supabase.from('clinic_users').select(`permissions, user:app_users(id, username, role, is_active)`).eq('clinic_id', clinicId);
    if (error) throw error;
    return data.map(item => ({ ...(item.user as any), permissions: item.permissions as UserPermissions }));
  },
  async createAppUser(clinicId: string, adminUserId: string, userData: any) {
    const { data: clinic } = await repo.getClinic(clinicId);
    const { count } = await supabase.from('clinic_users').select('*', { count: 'exact', head: true }).eq('clinic_id', clinicId);

    const limit = PLAN_LIMITS[clinic?.plan as keyof typeof PLAN_LIMITS]?.users || 5;
    if ((count || 0) >= limit) throw { code: 'PLAN_LIMIT_USERS', message: `Limite de usuários atingido (${limit}).` };

    const { data: newUser, error: userError } = await supabase.from('app_users').insert([{
      username: userData.username,
      password_hash: userData.password_hash,
      role: userData.role,
      is_active: true
    }]).select().single();

    if (userError) throw userError;

    const { error: linkError } = await supabase.from('clinic_users').insert([{
      clinic_id: clinicId,
      user_id: newUser.id,
      permissions: userData.permissions
    }]);

    if (linkError) throw linkError;
    return newUser;
  },
  async updateClinicUser(clinicId: string, userId: string, data: any) {
    if (data.permissions) {
      return supabase.from('clinic_users').update({ permissions: data.permissions }).eq('clinic_id', clinicId).eq('user_id', userId);
    }
    if (data.role) {
       return supabase.from('app_users').update({ role: data.role }).eq('id', userId);
    }
    return { error: null };
  },
  async deleteClinicUser(clinicId: string, userId: string) {
    return supabase.from('clinic_users').delete().eq('clinic_id', clinicId).eq('user_id', userId);
  },

  // --- MEDICAÇÃO ---
  async listMedications(clinicId: string) { return await supabase.from('medications').select('*').eq('clinic_id', clinicId).order('scheduled_time', { ascending: true }); },
  async createMedication(clinicId: string, userId: string, data: any) { return await supabase.from('medications').insert([{ ...data, clinic_id: clinicId }]); },
  async updateMedication(clinicId: string, id: string, data: any) { return await supabase.from('medications').update(data).eq('id', id).eq('clinic_id', clinicId); },
  async administerMedication(id: string, userId: string, username: string) { return await supabase.from('medications').update({ status: 'administered', administered_at: new Date().toISOString(), administered_by: username }).eq('id', id); },
  async deleteMedication(clinicId: string, id: string) { return supabase.from('medications').delete().eq('id', id).eq('clinic_id', clinicId); },

  // --- TRANSAÇÕES ---
  async createTransaction(clinicId: string, data: any) { return await supabase.from('transactions').insert([{ ...data, clinic_id: clinicId }]); },
  async updateTransaction(clinicId: string, id: string, data: any) { return await supabase.from('transactions').update(data).eq('id', id).eq('clinic_id', clinicId); },
  async deleteTransaction(clinicId: string, id: string) { return supabase.from('transactions').delete().eq('id', id).eq('clinic_id', clinicId); },

  // --- LOGS / AUDITORIA (NOVO) ---
  // Se a tabela 'audit_logs' não existir no seu Supabase, crie-a com: id, clinic_id, user_id, action, details, created_at
  async listLogs(clinicId: string) {
    return supabase
      .from('audit_logs')
      .select(`*, user:app_users(username)`)
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false })
      .limit(50);
  },
  
  async createLog(clinicId: string, userId: string, action: string, details: string) {
    return supabase.from('audit_logs').insert([{ 
      clinic_id: clinicId, 
      user_id: userId, 
      action, 
      details 
    }]);
  }
};

export const fetchTransactions = async (clinicId: string) => {
  const { data, error } = await supabase.from('transactions').select('*').eq('clinic_id', clinicId);
  if (error) throw error;
  return data;
};