// TIPAGEM GLOBAL DO PROJETO VIVA PLENA (SCHEMA V2 - SNAKE_CASE)

export interface InventoryItem {
  id: string;
  clinic_id: string;
  name: string;
  category: 'Alimentos' | 'Limpeza' | 'Equipamentos' | 'Medicamentos' | 'Outros';
  quantity: number;
  unit: string;
  min_threshold?: number;
  created_at?: string;
}

export type ModuleType = 'dashboard' | 'patients' | 'patient-profile' | 'daily-records' | 'occurrences' | 'agenda' | 'medication' | 'finance' | 'documents' | 'reports' | 'government-report' | 'settings' | 'users' | 'inventory' | 'pti' | 'health-records' | 'human-resources' | 'debug';

export type SettingsSectionType = 'organization' | 'operational' | 'notifications' | 'plan' | 'users' | null;

export type QuickActionType = 'new_patient' | 'new_record' | 'new_occurrence' | 'new_agenda' | 'new_document' | 'new_medication' | 'new_income' | 'new_expense' | 'new_stock' | 'new_user' | null;

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
  inventory?: boolean;
  pti?: boolean;
  health_records?: boolean;
}

export type Permissions = UserPermissions;

export interface AppUser {
  id: string;
  username: string;
  role: 'ADMIN' | 'NORMAL';
  is_active: boolean;
  password_hash?: string;
  job_title?: string;
  shift?: string;
  document_cpf?: string;
  email?: string;
  permissions?: UserPermissions;
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
  patient_limit?: number;
}

export interface Patient {
  id: string;
  clinic_id: string;
  name: string;
  photo_url?: string;

  // DADOS PESSOAIS (Baseado no PDF)
  origin_city?: string; // Município de Origem
  profession?: string;
  date_of_birth?: string;
  sex?: 'Masculino' | 'Feminino';
  gender?: string; // Gênero
  cpf?: string;
  rg?: string;
  father_name?: string;
  mother_name?: string;
  education_level?: string; // Escolaridade
  marital_status?: string; // Estado Civil
  has_children?: boolean;

  // ENDEREÇO COMPLETO
  address_street?: string;
  address_neighborhood?: string; // Bairro
  address_city?: string;
  address_zip?: string; // CEP

  // HISTÓRICO / SAÚDE (Baseado no PDF)
  sus_number?: string;
  has_previous_admissions?: boolean; // Outras internações
  caps_treatment?: boolean; // Tratamento no CAPS
  hospital_detox?: boolean; // Desintoxicação Hospitalar
  detox_time?: string;
  hospital_discharge_forecast?: string;
  health_professional_phone?: string; // Telefone Profissional Saúde

  // DADOS DO RESPONSÁVEL (Baseado no PDF)
  family_responsible?: string; // Nome Completo
  family_responsible_rg?: string; // C.I.
  family_responsible_issuer?: string; // Órgão Expedidor
  family_responsible_cpf?: string;
  family_contact?: string; // Telefone

  // REFERÊNCIA / TRIAGEM (Baseado no PDF)
  therapeutic_accompaniment?: string; // Acompanhamento Terapêutico (CAPS, Hospital...)
  reference_service?: string; // Serviço de referência no município
  medication_responsible_name?: string; // Quem envia remédio
  medication_responsible_contact?: string; // Tel/Email do resp. remédio
  mental_health_recommendations?: string; // Recomendações equipe
  filling_technician_name?: string; // Técnico que preencheu
  filling_technician_role?: string; // Função do técnico

  // CLINICO INTERNO (Sistema)
  entry_date?: string;
  exit_forecast_date?: string;
  exit_date?: string;
  exit_reason?: string;
  diagnosis?: string;
  dependence_history?: string;

  // FINANCEIRO
  payment_type?: 'particular' | 'convenio' | 'social';
  insurance_name?: string;
  monthly_fee?: number;

  // CONTATO DIRETO
  email?: string;
  phone?: string;

  // STATUS DO SISTEMA
  status: 'active' | 'discharged' | 'evaded' | 'deceased' | 'waiting';
  created_by: string;
  created_at: string;
}

export interface PTIGoal {
  id: string;
  clinic_id: string;
  patient_id: string;
  patient_name?: string;
  goals: any;
  created_at: string;
}

export interface HealthRecord {
  id: string;
  clinic_id: string;
  patient_id: string;
  type?: string;
  content: string;
  professional_name?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  clinic_id: string;
  patient_id?: string; // Vinculo com o paciente
  description: string;
  amount: number;
  type: 'income' | 'expense';
  status: 'paid' | 'pending' | 'overdue';
  category: string;
  date: string;
  created_at?: string;
}

export interface DailyRecord {
  id: string;
  clinic_id: string;
  patient_id: string;
  patient_name?: string;
  content: string;
  created_by: string;
  created_at: string;
}


export interface Occurrence {
  id: string;
  clinic_id: string;
  patient_id: string;
  patient_name?: string;
  type?: string; // Adicionado para suportar 'VISIT' e outros tipos
  title: string;
  description: string;
  severity: string;
  status: 'open' | 'resolved';
  created_by: string;
  created_at: string;
}

export interface Assessment {
  id: string;
  clinic_id: string;
  patient_id: string;
  professional_id: string;
  type: 'ASSIST' | 'AUDIT' | 'NURSING' | 'OTHER';
  data: any;
  total_score?: number;
  created_at: string;
}

export interface AgendaEvent {
  id: string;
  clinic_id: string;
  patient_id?: string;
  patient_name?: string;
  title: string;
  description?: string;
  start_at: string;
  visitor_name?: string;
  created_by: string;
  created_at: string;
}

export interface DocumentRecord {
  id: string;
  clinic_id: string;
  title: string;
  type: string;
  file_url?: string;
  created_at: string;
}

export interface UIState {
  activeModule: ModuleType;
  activeSettingsSection: SettingsSectionType;
  selectedPatientId: string | null;
  quickAction: QuickActionType;
  toasts: Toast[];
  debugMode: boolean;
  editingItem: EditingItem | null;
}

export interface BrainState {
  ui: UIState;
  session: ClinicSession;
  clinic: Clinic | null;
  organization: { name: string; unit: string; cnpj: string; logo: string };
  patients: Patient[];
  records: DailyRecord[];
  occurrences: Occurrence[];
  assessments: Assessment[];
  agenda: AgendaEvent[];
  documents: DocumentRecord[];
  medications: any[];
  transactions: Transaction[];
  finances: { transactions: Transaction[] };
  inventory: InventoryItem[];
  pti: PTIGoal[];
  healthRecords: HealthRecord[];
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
