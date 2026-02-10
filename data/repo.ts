import { supabase } from '../lib/supabaseClient';

export const Repository = {
  /**
   * Busca todos os dados iniciais da clínica EM PARALELO.
   * Muito mais rápido do que buscar um por um.
   */
  async fetchInitialData(clinicId: string) {
    // console.log(`⚡ [Repository] Disparando carregamento turbo para: ${clinicId}`);

    try {
      // Dispara todas as requisições ao mesmo tempo usando Promise.all
      const [
        patientsRes,
        transactionsRes,
        agendaRes,
        occurrencesRes,
        documentsRes,
        inventoryRes,
        ptiRes,
        healthRes,
        medicationsRes,
        usersRes
      ] = await Promise.all([
        supabase.from('patients').select('*').eq('clinic_id', clinicId).neq('status', 'deleted'),
        supabase.from('transactions').select('*').eq('clinic_id', clinicId).order('date', { ascending: false }),
        supabase.from('agenda').select('*').eq('clinic_id', clinicId),
        supabase.from('occurrences').select('*').eq('clinic_id', clinicId).order('created_at', { ascending: false }),
        supabase.from('documents').select('*').eq('clinic_id', clinicId).order('created_at', { ascending: false }),
        supabase.from('inventory').select('*').eq('clinic_id', clinicId).order('name', { ascending: true }),
        supabase.from('pti').select('*').eq('clinic_id', clinicId),
        supabase.from('health_records').select('*').eq('clinic_id', clinicId).order('created_at', { ascending: false }),
        supabase.from('medications').select('*').eq('clinic_id', clinicId),
        supabase.from('app_users').select('*').eq('clinic_id', clinicId).eq('is_active', true)
      ]);

      // Verifica se houve erro em alguma das requisições críticas
      if (patientsRes.error) throw new Error(`Erro Pacientes: ${patientsRes.error.message}`);
      // (Outros erros podem ser tratados de forma silenciosa ou logados se desejar)

      return {
        patients: patientsRes.data || [],
        transactions: transactionsRes.data || [],
        agenda: agendaRes.data || [],
        occurrences: occurrencesRes.data || [],
        documents: documentsRes.data || [],
        inventory: inventoryRes.data || [],
        pti: ptiRes.data || [],
        healthRecords: healthRes.data || [],
        medications: medicationsRes.data || [],
        users: usersRes.data || [],
        dailyRecords: [] 
      };

    } catch (error: any) {
      console.error('❌ [Repository] Falha no carregamento:', error);
      throw error;
    }
  }
};
