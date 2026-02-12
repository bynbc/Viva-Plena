import { supabase } from '../lib/supabaseClient';

export const Repository = {
  /**
   * Busca todos os dados iniciais da clínica EM PARALELO.
   * Versão Corrigida e Otimizada.
   */
  async fetchInitialData(clinicId: string) {
    console.log(`⚡ [Repository] Carregando dados para clínica: ${clinicId}`);

    try {
      // Dispara todas as requisições ao mesmo tempo
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
        usersRes,
        assessmentsRes
      ] = await Promise.all([
        supabase.from('patients').select('*').eq('clinic_id', clinicId),

        // CORREÇÃO: Garante a busca das transações financeiras
        supabase.from('transactions').select('*').eq('clinic_id', clinicId).order('date', { ascending: false }),

        supabase.from('agenda').select('*').eq('clinic_id', clinicId),
        supabase.from('occurrences').select('*').eq('clinic_id', clinicId),
        supabase.from('documents').select('*').eq('clinic_id', clinicId),
        supabase.from('inventory').select('*').eq('clinic_id', clinicId),
        supabase.from('pti_goals').select('*').eq('clinic_id', clinicId), // Nome da tabela corrigido para pti_goals
        supabase.from('health_records').select('*').eq('clinic_id', clinicId),
        supabase.from('medications').select('*').eq('clinic_id', clinicId),
        supabase.from('app_users').select('*').eq('clinic_id', clinicId),
        supabase.from('assessments').select('*').eq('clinic_id', clinicId)
      ]);

      // Log para depuração (Abra o console com F12 para ver)
      console.log("💰 Transações Encontradas:", transactionsRes.data?.length || 0);

      if (transactionsRes.error) console.error("Erro Financeiro:", transactionsRes.error);

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
        assessments: assessmentsRes.data || [],
        dailyRecords: []
      };

    } catch (error: any) {
      console.error('❌ [Repository] Erro Geral:', error);
      throw error;
    }
  }
};
