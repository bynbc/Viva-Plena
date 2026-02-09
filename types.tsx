// ATUALIZAR INTERFACE DE PACIENTE
export interface Patient {
  id: string;
  clinic_id: string;
  name: string;
  cpf?: string;
  rg?: string; // NOVO
  sus_number?: string; // NOVO
  birthDate?: string;
  status: 'active' | 'discharged' | 'evaded' | 'deceased' | 'waiting'; // NOVO STATUS
  
  // Dados Clínicos e Sociais
  dependence_history?: string; // NOVO
  treatmentType?: 'Internação' | 'Hospital Dia' | 'Ambulatorial';
  cid_main?: string;
  
  // Datas
  admissionDate?: string;
  exitForecast?: string; // NOVO
  exitDate?: string; // NOVO
  exitReason?: string; // NOVO

  // Financeiro / Convênio
  paymentType?: 'particular' | 'convenio' | 'social';
  insuranceName?: string;
  
  // Endereço e Família
  address?: string;
  familyResponsible?: string;
  familyContact?: string;
  
  created_by: string;
  created_at: string;
  room?: string;
}

// NOVA INTERFACE: ESTOQUE
export interface InventoryItem {
  id: string;
  clinic_id: string;
  name: string;
  category: 'Alimentos' | 'Limpeza' | 'Equipamentos' | 'Medicamentos' | 'Outros';
  quantity: number;
  unit: string;
  min_stock: number;
}

// NOVA INTERFACE: PTI (Plano Terapêutico)
export interface PTIGoal {
  id: string;
  patient_id: string;
  goal: string;
  strategy: string;
  deadline: string;
  status: 'pending' | 'achieved' | 'failed';
}

// ATUALIZAR INTERFACE DE USUÁRIO (RH)
export interface AppUser {
  id: string;
  username: string;
  role: 'ADMIN' | 'NORMAL';
  job_title?: 'Psicólogo' | 'Médico' | 'Monitor' | 'Administrativo'; // NOVO
  shift?: string; // NOVO
  is_active: boolean;
  password_hash?: string;
}
