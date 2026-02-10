import { supabase } from '../lib/supabaseClient';

export const Repository = {
  /**
   * Busca todos os dados iniciais da clínica de uma vez só.
   * Agora inclui Estoque, PTI e Prontuários avançados.
   */
  async fetchInitialData(clinicId: string) {
    console.log(`🔄 [Repository] Iniciando sincronização para clínica: ${clinicId}`);

    try {
      // 1. PACIENTES (Trazendo campos novos: RG, SUS, etc automaticamente pelo *)
      const { data: patients, error: errPatients } = await supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', clinicId)
        .neq('status', 'deleted'); // Exemplo de filtro de segurança

      if (errPatients) throw new Error(`Erro Pacientes: ${errPatients.message}`);

      // 2. FINANCEIRO
      const { data: transactions, error: errTrans } = await supabase
        .from('transactions')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('date', { ascending: false });

      // 3. AGENDA (Visitas e Compromissos)
      const { data: agenda, error: errAgenda } = await supabase
        .from('agenda')
        .select('*')
        .eq('clinic_id', clinicId);

      // 4. OCORRÊNCIAS
      const { data: occurrences, error: errOcc } = await supabase
        .from('occurrences')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      // 5. DOCUMENTOS
      const { data: documents, error: errDocs } = await supabase
        .from('documents')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      // 6. ESTOQUE (Novo Módulo)
      const { data: inventory, error: errInv } = await supabase
        .from('inventory')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('name', { ascending: true });

      // 7. PTI - Plano Terapêutico (Novo Módulo)
      const { data: pti, error: errPti } = await supabase
        .from('pti') // Nome da tabela criada no SQL
        .select('*')
        .eq('clinic_id', clinicId);

      // 8. PRONTUÁRIO MULTIDISCIPLINAR (Novo Módulo)
      const { data: healthRecords, error: errHealth } = await supabase
        .from('health_records')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      // 9. MEDICAÇÕES
      const { data: medications, error: errMeds } = await supabase
        .from('medications')
        .select('*')
        .eq('clinic_id', clinicId);
        
      // 10. USUÁRIOS (RH)
      // Nota: Em produção, filtrar apenas usuários desta clínica se tiver tabela de vínculo
      const { data: users, error: errUsers } = await supabase
        .from('app_users')
        .select('*')
        .eq('is_active', true);

      // Log de Sucesso
      console.log('✅ [Repository] Dados carregados:', {
        pacientes: patients?.length,
        estoque: inventory?.length || 0,
        pti: pti?.length || 0
      });

      return {
        patients: patients || [],
        transactions: transactions || [],
        agenda: agenda || [],
        occurrences: occurrences || [],
        documents: documents || [],
        inventory: inventory || [], // Novo
        pti: pti || [], // Novo
        healthRecords: healthRecords || [], // Novo
        medications: medications || [],
        users: users || [],
        dailyRecords: [] // Mantido para compatibilidade legacy se necessário
      };

    } catch (error: any) {
      console.error('❌ [Repository] Falha Crítica:', error);
      throw error;
    }
  }
};
