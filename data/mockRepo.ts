import { Patient, Transaction, InventoryItem, DailyRecord, Occurrence, AgendaEvent } from '../types';

export const MockRepository = {
    async fetchInitialData(clinicId: string) {
        console.log(`⚡ [MockRepository] Carregando dados MOCKADOS para clínica: ${clinicId}`);

        // Simulação de delay de rede
        await new Promise(resolve => setTimeout(resolve, 800));

        const patients: Patient[] = [
            {
                id: 'p1',
                clinic_id: clinicId,
                name: 'Carlos Mendes',
                status: 'active',
                date_of_birth: '1985-05-15',
                cpf: '123.456.789-00',
                sex: 'Masculino',
                diagnosis: 'F19.2 - Transtornos mentais e comportamentais devidos ao uso de múltiplas drogas',
                entry_date: '2025-11-20',
                mother_name: 'Maria Mendes',
                paymenttype: 'particular',
                monthly_fee: 2500,
                address_city: 'São Paulo - SP',
                created_at: new Date().toISOString(),
                created_by: 'mock_admin'
            },
            {
                id: 'p2',
                clinic_id: clinicId,
                name: 'Ana Souza',
                status: 'active',
                date_of_birth: '1992-08-10',
                cpf: '987.654.321-11',
                sex: 'Feminino',
                diagnosis: 'F31 - Transtorno afetivo bipolar',
                entry_date: '2026-01-05',
                mother_name: 'Joana Souza',
                paymenttype: 'convenio',
                insurancename: 'Unimed',
                address_city: 'Campinas - SP',
                created_at: new Date().toISOString(),
                created_by: 'mock_admin'
            },
            {
                id: 'p3',
                clinic_id: clinicId,
                name: 'Roberto Silva',
                status: 'waiting',
                date_of_birth: '1980-03-22',
                cpf: '456.789.123-22',
                sex: 'Masculino',
                diagnosis: 'F10.2 - Síndrome de dependência do álcool',
                entry_date: '2026-02-01',
                mother_name: 'Clara Silva',
                paymenttype: 'social',
                address_city: 'Santos - SP',
                created_at: new Date().toISOString(),
                created_by: 'mock_admin'
            }
        ];

        const transactions: Transaction[] = [
            {
                id: 't1',
                clinic_id: clinicId,
                description: 'Mensalidade: Carlos Mendes',
                amount: 2500,
                type: 'income',
                category: 'Mensalidade',
                status: 'paid',
                date: '2026-02-05',
                created_at: new Date().toISOString()
            },
            {
                id: 't2',
                clinic_id: clinicId,
                description: 'Compra de Mantimentos',
                amount: 850.50,
                type: 'expense',
                category: 'Alimentação',
                status: 'paid',
                date: '2026-02-02',
                created_at: new Date().toISOString()
            },
            {
                id: 't3',
                clinic_id: clinicId,
                description: 'Conta de Luz (Jan)',
                amount: 1200,
                type: 'expense',
                category: 'Utilidades',
                status: 'pending',
                date: '2026-02-15',
                created_at: new Date().toISOString()
            }
        ];

        const inventory: InventoryItem[] = [
            { id: 'i1', clinic_id: clinicId, name: 'Arroz 5kg', quantity: 10, unit: 'pct', category: 'Alimentos' },
            { id: 'i2', clinic_id: clinicId, name: 'Feijão 1kg', quantity: 20, unit: 'pct', category: 'Alimentos' },
            { id: 'i3', clinic_id: clinicId, name: 'Detergente', quantity: 15, unit: 'frasco', category: 'Limpeza' },
            { id: 'i4', clinic_id: clinicId, name: 'Paracetamol 750mg', quantity: 5, unit: 'cx', category: 'Medicamentos' }
        ];

        const occurrences: Occurrence[] = [
            {
                id: 'o1',
                clinic_id: clinicId,
                patient_id: 'p1',
                patient_name: 'Carlos Mendes',
                title: 'Desentendimento no almoço',
                description: 'Paciente se exaltou com colega por causa de lugar na mesa.',
                severity: 'media',
                status: 'resolved',
                created_by: 'Enfermeira Chefe',
                created_at: '2026-02-08T12:30:00'
            }
        ];

        return {
            patients,
            transactions,
            agenda: [],
            occurrences,
            documents: [],
            inventory,
            pti: [],
            healthRecords: [],
            medications: [],
            users: [{ id: 'u1', username: 'admin', role: 'ADMIN', is_active: true }],
            assessments: [],
            dailyRecords: []
        };
    }
};
