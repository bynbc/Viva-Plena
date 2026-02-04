export type ModuleType = 'dashboard' | 'patients' | 'patient-profile' | 'daily-records' | 'occurrences' | 'calendar' | 'medication' | 'finance' | 'documents' | 'reports' | 'settings' | 'users';
export type SettingsSectionType = 'organization' | 'operational' | 'notifications' | 'plan' | 'users' | null;
export type QuickActionType = 'new_patient' | 'new_record' | 'new_occurrence' | 'new_agenda' | 'new_document' | 'new_medication' | 'new_income' | 'new_expense' | null;
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

// NOVO: Define o que está sendo editado
export interface EditingItem {
  type: 'patients' | 'medications' | 'transactions' | 'records' | 'occurrences' | 'agenda';
  data: any; // O objeto completo (ex: o Paciente com ID, nome, etc)
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
}

export type Permissions = UserPermissions;

export interface AppUser {
  id: string;
  username: string;
  role: 'ADMIN' | 'NORMAL';
  is_active: boolean;
  password_hash?: string;
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
  status: 'active' | 'discharged' | 'waiting' | 'inactive';
  notes?: string;
  created_by: string;
  created_at: string;
  age?: number;
  room?: string;
  admissionDate?: string;
  exitForecast?: string;
  emergencyContact?: string;
  familyResponsible?: string;
  treatmentType?: string;
  paymentType?: string;
  monthly_fee?: number;
  reason?: string;
  prescriptions?: string[];
  metrics?: { label: string; value: string; trend: string }[];
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
  date: string; // Adicionado para consistência
  created_at?: string;
}

export interface DailyRecord {
  id: string;
  clinic_id: string;
  patient_id: string;
  patient_name?: string;
  content: string;
  tags: string[];
  created_by: string;
  created_at: string;
}

export interface Occurrence {
  id: string;
  clinic_id: string;
  patient_id: string;
  patient_name?: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
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
  // NOVO: O item sendo editado
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
  settings: Record<string, any>;
  users: (AppUser & { permissions: UserPermissions })[];
  // NOVO: Logs agora tipado corretamente
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