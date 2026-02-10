export type ModuleType = 'dashboard' | 'patients' | 'agenda' | ... (outros módulos)
export type SettingsSectionType = 'organization' | 'operational' | 'notifications' | 'plan' | 'users' | null;
export type QuickActionType = 'new_patient' | 'new_record' | 'new_occurrence' | 'new_agenda' | 'new_document' | 'new_medication' | 'new_income' | 'new_expense' | 'new_stock' | null;
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export interface EditingItem {
  type: 'patients' | 'medications' | 'transactions' | 'records' | 'occurrences' | 'agenda' | 'inventory' | 'pti';
  data: any;
}

export interface UserPermissions {
  dashboard: boolean;
  patients: boolean;
  records: boolean;
  occurrences: boolean;
  agenda: boolean;
  medication: boolean;
  finance: boolean;
  documents: boolean;
  reports: boolean;
  settings: boolean;
  users: boolean;
  inventory?: boolean; // Novo
  pti?: boolean; // Novo
  health_records?: boolean; // Novo
}

export type Permissions = UserPermissions;

export interface AppUser {
  id: string;
  username: string;
  role: 'ADMIN' | 'NORMAL';
  is_active: boolean;
  password_hash?: string;
  // Campos de RH
  job_title?: string; // Psicólogo, Monitor, etc.
  shift?: string; // Matutino, Noturno
  document_cpf?: string;
}

export type User = AppUser;

export interface ClinicSession {
  isAuthenticated: boolean;
  user: AppUser | null;
  clinicId: string | null;
  permissions: UserPermissions | null;
}

export interface Clinic {
  id: string;
  name: string;
  plan: 'ESSENCIAL' | 'PROFISSIONAL' | 'ENTERPRISE';
  is_active: boolean;
}

export interface Patient {
  id: string;
  clinic_id: string;
  name: string;
  cpf?: string;
  rg?: string; // Novo
  sus_number?: string; // Novo
  birthDate?: string;
  status: 'active' | 'discharged' | 'evaded' | 'deceased' | 'waiting'; // Atualizado
  
  // Contato e Endereço
  phone?: string;
  email?: string;
  address?: string;
  address_street?: string; // Novo
  address_city?: string; // Novo
  zip_code?: string;
  city?: string;
  state?: string;

  // Responsável / Emergência
  emergencyContact?: string;
  emergencyPhone?: string;
  familyResponsible?: string; // Financeiro/Legal
  familyContact?: string;
  
  // Clínico e Tratamento
  admissionDate?: string; // Data de entrada
  entry_date?: string; // Compatibilidade com SQL novo
  
  exitForecast?: string; // Previsão
  exit_forecast_date?: string; // Compatibilidade SQL
  
  exitDate?: string; // Data real da saída
  exit_date?: string; // Compatibilidade SQL
  
  exitReason?: string; // Motivo
  exit_reason?: string; // Compatibilidade SQL
  
  treatmentType?: 'Internação' | 'Hospital Dia' | 'Ambulatorial';
  cid_main?: string; 
  diagnosis?: string; // Diagnóstico descritivo
  reason?: string; // Motivo da internação (legacy)
  dependence_history?: string; // Histórico de uso
  
  prescriptions?: string[];
  
  // Financeiro
  paymentType?: 'particular' | 'convenio' | 'social';
  insuranceName?: string;
  insuranceNumber?: string;
  insurance_details?: any; // JSON do convênio
  monthly_fee?: number;
  
  // Auditoria
  created_by: string;
  created_at: string;
  
  notes?: string;
  room?: string;
  metrics?: { label: string; value: string; trend: string }[];
}

export interface InventoryItem {
  id: string;
  clinic_id: string;
  name: string;
  category: 'Alimentos' | 'Limpeza' | 'Equipamentos' | 'Medicamentos' | 'Outros';
  quantity: number;
  unit: string; // kg, un, l
  min_stock: number;
  updated_at: string;
}

export interface PTIGoal {
  id: string;
  clinic_id: string;
  patient_id: string;
  patient_name?: string; // Join
  goals: string; // Metas
  therapies: string; // Terapias
  frequency: string;
  evolution_notes: string;
  created_at: string;
  updated_at: string;
}

export interface HealthRecord {
  id: string;
  clinic_id: string;
  patient_id: string;
  patient_name?: string;
  professional_id: string;
  professional_name?: string;
  specialty: 'Psicologia' | 'Medicina' | 'Enfermagem' | 'Assistência Social';
  content: string;
  confidential_notes?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  clinic_id: string;
  patient_id?: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  status: 'paid' | 'pending' | 'overdue';
  category: string;
  due_date: string;
  date: string;
  created_at?: string;
}

export interface DailyRecord {
  id: string;
  clinic_id: string;
  patient_id: string;
  patient_name?: string;
  content: string;
  category?: string;
  tags: string[];
  created_by: string;
  created_at: string;
  type?: string; // Mantido para compatibilidade
}

export interface Occurrence {
  id: string;
  clinic_id: string;
  patient_id: string;
  patient_name?: string;
  title: string; // Geralmente o Tipo
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'Leve' | 'Média' | 'Grave' | 'Crítica'; // Unificado
  status: 'open' | 'resolved' | 'archived';
  created_by: string;
  occurred_at: string;
  created_at: string;
  type?: string;
  date?: string;
}

export interface AgendaEvent {
  id: string;
  clinic_id: string;
  patient_id?: string;
  patient_name?: string;
  title: string;
  description?: string;
  start_at: string;
  end_at?: string;
  visitor_name?: string; // Novo
  visit_status?: string; // Novo
  created_by: string;
  created_at: string;
}

export interface DocumentRecord {
  id: string;
  clinic_id: string;
  patient_id?: string;
  patient_name?: string;
  name: string;
  type: string;
  notes?: string;
  file_name: string;
  file_mime: string;
  file_size: number;
  file_data_url: string;
  created_by: string;
  created_at: string;
}

export interface UIState {
  activeModule: ModuleType;
  activeSettingsSection: SettingsSectionType;
  selectedPatientId: string | null;
  activeTab?: string;
  quickAction: QuickActionType;
  toasts: Toast[];
  debugMode: boolean;
  isNewModalOpen?: boolean;
  editingItem: EditingItem | null;
}

export interface BrainState {
  ui: UIState;
  session: ClinicSession;
  clinic: Clinic | null;
  organization: {
    name: string;
    unit: string;
    cnpj: string;
    logo: string;
  };
  patients: Patient[];
  records: DailyRecord[];
  occurrences: Occurrence[];
  agenda: AgendaEvent[];
  documents: DocumentRecord[];
  medications: any[];
  transactions: Transaction[]; 
  finances: { 
    transactions: Transaction[] 
  };
  // Novos Estados
  inventory: InventoryItem[]; // Estoque
  pti: PTIGoal[]; // Planos Terapêuticos
  healthRecords: HealthRecord[]; // Prontuário Detalhado
  
  settings: Record<string, any>;
  users: (AppUser & { permissions: UserPermissions })[];
  logs: any[];
  plan: {
    name: string;
    status: string;
    limits: { patients: number; users: number };
    usage: { patients: number; users: number };
  };
  chartData: { name: string; valor: number }[];
  loading: boolean;
  lastError: string | null;
}
