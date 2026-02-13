import React, { useState } from 'react';
import { User, DollarSign, MapPin, Users, ClipboardList, Activity, CheckCircle2 } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import MobileModal from './common/MobileModal';

// Componentes Reutilizáveis (Movidos para fora para evitar re-render/perda de foco)
const Input = ({ label, field, type = 'text', placeholder, required = false, value, onChange, error }: any) => (
  <div className="space-y-1">
    <label className="text-xs font-black text-slate-400 uppercase ml-1">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className={`w-full p-3 bg-slate-50 text-slate-900 rounded-xl font-bold border outline-none transition-colors ${error ? 'border-rose-400 focus:border-rose-500 bg-rose-50' : 'border-slate-100 focus:border-indigo-500'
        }`}
      placeholder={placeholder}
    />
    {error && <span className="text-[10px] font-bold text-rose-500 ml-1">{error}</span>}
  </div>
);

const Select = ({ label, field, options, value, onChange }: any) => (
  <div className="space-y-1">
    <label className="text-xs font-black text-slate-400 uppercase ml-1">{label}</label>
    <select
      value={value}
      onChange={onChange}
      className="w-full p-3 bg-slate-50 text-slate-900 rounded-xl font-bold border border-slate-100 outline-none focus:border-indigo-500 transition-colors"
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const NewPatientModal: React.FC = () => {
  // SCHEMA V2 COMPLIANCE: snake_case fields enforced
  const { setQuickAction, push, addToast, brain } = useBrain();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    // DADOS PESSOAIS
    name: '',
    photo_url: '',
    date_of_birth: '',
    cpf: '',
    rg: '',
    sex: 'Masculino',
    gender: '',
    profession: '',
    education_level: '',
    marital_status: '',
    has_children: false,
    mother_name: '',
    father_name: '',
    place_of_birth: '',
    religion: '',

    // ENDEREÇO
    address_street: '',
    address_neighborhood: '',
    address_city: '',
    address_zip: '',

    // SAÚDE / TRIAGEM
    sus_number: '',
    has_previous_admissions: false,
    caps_treatment: false,
    hospital_detox: false,
    detox_time: '',
    hospital_discharge_forecast: '',
    health_professional_phone: '',
    diagnosis: '',
    dependence_history: '',

    // RESPONSÁVEL
    family_responsible: '',
    family_responsible_rg: '',
    family_responsible_cpf: '',
    family_bond: '',
    family_contact: '',

    // REFERENCIA
    origin_city: '',
    reference_service: '',
    therapeutic_accompaniment: '',
    medication_responsible_name: '',
    medication_responsible_contact: '',
    mental_health_recommendations: '',

    // INTERNO / FINANCEIRO
    entry_date: new Date().toISOString().split('T')[0],
    payment_type: 'particular',
    monthly_fee: '',
    insurance_name: ''
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpa erro ao digitar
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!formData.date_of_birth) newErrors.date_of_birth = "Data de nascimento é obrigatória";
    if (!formData.cpf.trim()) newErrors.cpf = "CPF é obrigatório";
    if (!formData.mother_name.trim()) newErrors.mother_name = "Nome da mãe é obrigatório";
    if (!formData.entry_date) newErrors.entry_date = "Data de admissão é obrigatória";

    setErrors(newErrors);
    return newErrors;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentErrors = validate();
    if (Object.keys(currentErrors).length > 0) {
      addToast("Preencha os campos obrigatórios assinalados.", "warning");

      if (currentErrors.name || currentErrors.date_of_birth || currentErrors.cpf || currentErrors.mother_name) {
        setActiveTab('personal');
      } else if (currentErrors.entry_date) {
        setActiveTab('finance');
      }
      return;
    }

    setLoading(true);
    try {
      const fee = Number(formData.monthly_fee) || 0;
      const cId = brain.session.clinicId;
      console.log('Tentando salvar paciente. ClinicID:', cId);

      if (!cId) {
        addToast("Erro de Sessão: ID da clínica não encontrado. Faça login novamente.", "error");
        setLoading(false);
        return;
      }

      // Validação de UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(cId)) {
        console.error('INVALID CLINIC ID:', cId);
        addToast(`Erro Crítico: ID da clínica inválido (${cId}). Contate o suporte.`, "error");
        setLoading(false);
        return;
      }

      // 1. SALVA O PACIENTE
      await push('patients', {
        clinic_id: cId,
        ...formData,
        monthly_fee: fee,
        status: 'active',
        created_at: new Date().toISOString(),
        created_by: brain.session.user?.username || 'system'
      });

      // 2. GERAÇÃO AUTOMÁTICA DE RECEITA FINANCEIRA
      if (formData.payment_type === 'particular' && fee > 0) {
        await push('transactions', {
          clinic_id: cId,
          description: `Mensalidade (1ª): ${formData.name}`,
          amount: fee,
          type: 'income',
          category: 'Mensalidade',
          status: 'pending',
          date: new Date().toISOString()
        });
        addToast("Cobrança financeira gerada!", "info");
      }

      addToast("Acolhido cadastrado com sucesso!", "success");
      setQuickAction(null);
    } catch (err) {
      console.error(err);
      addToast("Erro ao salvar.", "error");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Pessoal', icon: User },
    { id: 'address', label: 'Endereço', icon: MapPin },
    { id: 'family', label: 'Responsável', icon: Users },
    { id: 'health', label: 'Triagem/Saúde', icon: Activity },
    { id: 'finance', label: 'Admin/Fin', icon: DollarSign },
  ];

  return (
    <MobileModal
      title="Admissão Completa"
      subtitle="Ficha Cadastral AVIPAE"
      icon={User}
      iconColor="bg-indigo-600"
      onClose={() => setQuickAction(null)}
      footer={
        <div className="flex gap-2 w-full">
          <button type="button" onClick={() => setQuickAction(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase">Cancelar</button>
          <button type="button" onClick={handleSave} disabled={loading} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase flex items-center justify-center gap-2">
            {loading ? 'Salvando...' : <><CheckCircle2 size={20} /> Concluir Cadastro</>}
          </button>
        </div>
      }
    >
      {/* TABS DE NAVEGAÇÃO */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase whitespace-nowrap transition-all flex-shrink-0 ${activeTab === tab.id
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-50 text-slate-400 border border-slate-100'
              }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <form className="space-y-6 pb-4">
        {activeTab === 'personal' && (
          <div className="space-y-4 animate-in slide-in-from-right-4">
            {/* FOTO DO ACOLHIDO */}
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${formData.photo_url ? 'border-indigo-500' : 'border-slate-100'} bg-slate-100 flex items-center justify-center relative`}>
                  {formData.photo_url ? (
                    <img src={formData.photo_url} alt="Foto" className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-slate-300" />
                  )}

                  <label htmlFor="photo-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="text-xs font-bold">Alterar Foto</span>
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Limite de tamanho (ex: 5MB)
                        if (file.size > 5 * 1024 * 1024) {
                          addToast("A imagem deve ter no máximo 5MB", "warning");
                          return;
                        }

                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const img = new Image();
                          img.onload = () => {
                            const canvas = document.createElement('canvas');
                            let width = img.width;
                            let height = img.height;

                            // Redimensionar se for muito grande
                            const MAX_WIDTH = 500;
                            const MAX_HEIGHT = 500;

                            if (width > height) {
                              if (width > MAX_WIDTH) {
                                height *= MAX_WIDTH / width;
                                width = MAX_WIDTH;
                              }
                            } else {
                              if (height > MAX_HEIGHT) {
                                width *= MAX_HEIGHT / height;
                                height = MAX_HEIGHT;
                              }
                            }

                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx?.drawImage(img, 0, 0, width, height);

                            // Converter para Base64 otimizado (JPEG 70%)
                            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                            handleChange('photo_url', dataUrl);
                            addToast("Foto processada com sucesso!", "success");
                          };
                          img.src = event.target?.result as string;
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <Input
              label="Nome Completo"
              field="name"
              required
              placeholder="Ex: João da Silva"
              value={formData.name}
              onChange={(e: any) => handleChange('name', e.target.value)}
              error={errors.name}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Data de Nascimento"
                field="date_of_birth"
                type="date"
                required
                value={formData.date_of_birth}
                onChange={(e: any) => handleChange('date_of_birth', e.target.value)}
                error={errors.date_of_birth}
              />
              <Select
                label="Sexo"
                field="sex"
                options={[{ value: 'Masculino', label: 'Masculino' }, { value: 'Feminino', label: 'Feminino' }]}
                value={formData.sex}
                onChange={(e: any) => handleChange('sex', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="CPF"
                field="cpf"
                placeholder="000.000.000-00"
                required
                value={formData.cpf}
                onChange={(e: any) => handleChange('cpf', e.target.value)}
                error={errors.cpf}
              />
              <Input
                label="RG"
                field="rg"
                placeholder="0000000"
                value={formData.rg}
                onChange={(e: any) => handleChange('rg', e.target.value)}
              />
            </div>
            <Input
              label="Gênero (Identidade)"
              field="gender"
              placeholder="Ex: Cisgênero, Trans..."
              value={formData.gender}
              onChange={(e: any) => handleChange('gender', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Estado Civil"
                field="marital_status"
                placeholder="Ex: Solteiro"
                value={formData.marital_status}
                onChange={(e: any) => handleChange('marital_status', e.target.value)}
              />
              <Input
                label="Profissão"
                field="profession"
                placeholder="Ex: Pedreiro"
                value={formData.profession}
                onChange={(e: any) => handleChange('profession', e.target.value)}
              />
            </div>
            <Input
              label="Escolaridade"
              field="education_level"
              placeholder="Ex: Ensino Médio Completo"
              value={formData.education_level}
              onChange={(e: any) => handleChange('education_level', e.target.value)}
            />
            <Input
              label="Nome da Mãe"
              field="mother_name"
              required
              value={formData.mother_name}
              onChange={(e: any) => handleChange('mother_name', e.target.value)}
              error={errors.mother_name}
            />
            <Input
              label="Nome do Pai"
              field="father_name"
              value={formData.father_name}
              onChange={(e: any) => handleChange('father_name', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Naturalidade/UF"
                field="place_of_birth"
                placeholder="Ex: São Paulo - SP"
                value={formData.place_of_birth}
                onChange={(e: any) => handleChange('place_of_birth', e.target.value)}
              />
              <Input
                label="Religião"
                field="religion"
                value={formData.religion}
                onChange={(e: any) => handleChange('religion', e.target.value)}
              />
            </div>
          </div>
        )}

        {activeTab === 'address' && (
          <div className="space-y-4 animate-in slide-in-from-right-4">
            <Input
              label="Rua / Número / Comp."
              field="address_street"
              placeholder="Rua das Flores, 123"
              value={formData.address_street}
              onChange={(e: any) => handleChange('address_street', e.target.value)}
            />
            <Input
              label="Bairro"
              field="address_neighborhood"
              value={formData.address_neighborhood}
              onChange={(e: any) => handleChange('address_neighborhood', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Cidade"
                field="address_city"
                value={formData.address_city}
                onChange={(e: any) => handleChange('address_city', e.target.value)}
              />
              <Input
                label="CEP"
                field="address_zip"
                placeholder="00000-000"
                value={formData.address_zip}
                onChange={(e: any) => handleChange('address_zip', e.target.value)}
              />
            </div>
          </div>
        )}

        {activeTab === 'family' && (
          <div className="space-y-4 animate-in slide-in-from-right-4">
            <Input
              label="Nome do Responsável"
              field="family_responsible"
              placeholder="Quem assina o contrato?"
              value={formData.family_responsible}
              onChange={(e: any) => handleChange('family_responsible', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="CPF Resp."
                field="family_responsible_cpf"
                value={formData.family_responsible_cpf}
                onChange={(e: any) => handleChange('family_responsible_cpf', e.target.value)}
              />
              <Input
                label="RG Resp."
                field="family_responsible_rg"
                value={formData.family_responsible_rg}
                onChange={(e: any) => handleChange('family_responsible_rg', e.target.value)}
              />
            </div>
            <Input
              label="Vínculo / Parentesco"
              field="family_bond"
              placeholder="Ex: Mãe, Esposa..."
              value={formData.family_bond}
              onChange={(e: any) => handleChange('family_bond', e.target.value)}
            />
            <Input
              label="Contato (Tel/WhatsApp)"
              field="family_contact"
              placeholder="(00) 00000-0000"
              value={formData.family_contact}
              onChange={(e: any) => handleChange('family_contact', e.target.value)}
            />
          </div>
        )}

        {activeTab === 'health' && (
          <div className="space-y-4 animate-in slide-in-from-right-4">
            <Input
              label="Cartão SUS"
              field="sus_number"
              value={formData.sus_number}
              onChange={(e: any) => handleChange('sus_number', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Tratamento CAPS?"
                field="caps_treatment"
                options={[{ value: false, label: 'Não' }, { value: true, label: 'Sim' }]}
                value={formData.caps_treatment}
                onChange={(e: any) => handleChange('caps_treatment', e.target.value === 'true')}
              />
              <Select
                label="Internações Anteriores?"
                field="has_previous_admissions"
                options={[{ value: false, label: 'Não' }, { value: true, label: 'Sim' }]}
                value={formData.has_previous_admissions}
                onChange={(e: any) => handleChange('has_previous_admissions', e.target.value === 'true')}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Histórico de Dependência</label>
              <textarea
                value={formData.dependence_history}
                onChange={e => handleChange('dependence_history', e.target.value)}
                className="w-full p-3 bg-slate-50 text-slate-900 rounded-xl font-bold border border-slate-100 outline-none focus:border-indigo-500"
                placeholder="Quais substâncias, tempo de uso..."
                rows={3}
              />
            </div>
            <Input
              label="Diagnóstico (CID)"
              field="diagnosis"
              placeholder="F19.2..."
              value={formData.diagnosis}
              onChange={(e: any) => handleChange('diagnosis', e.target.value)}
            />
            <Input
              label="Município de Origem"
              field="origin_city"
              value={formData.origin_city}
              onChange={(e: any) => handleChange('origin_city', e.target.value)}
            />
            <Input
              label="Serviço de Referência"
              field="reference_service"
              value={formData.reference_service}
              onChange={(e: any) => handleChange('reference_service', e.target.value)}
            />
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="space-y-4 animate-in slide-in-from-right-4">
            <Input
              label="Data de Admissão"
              field="entry_date"
              type="date"
              required
              value={formData.entry_date}
              onChange={(e: any) => handleChange('entry_date', e.target.value)}
              error={errors.entry_date}
            />
            <Select
              label="Tipo de Pagamento"
              field="payment_type"
              options={[
                { value: 'particular', label: 'Particular (Mensalidade)' },
                { value: 'social', label: 'Vaga Social (Gratuita)' },
                { value: 'convenio', label: 'Convênio' }
              ]}
              value={formData.payment_type}
              onChange={(e: any) => handleChange('payment_type', e.target.value)}
            />

            {formData.payment_type === 'particular' && (
              <Input
                label="Valor da Mensalidade (R$)"
                field="monthly_fee"
                type="number"
                placeholder="0.00"
                value={formData.monthly_fee}
                onChange={(e: any) => handleChange('monthly_fee', e.target.value)}
              />
            )}

            {formData.payment_type === 'convenio' && (
              <Input
                label="Nome do Convênio"
                field="insurance_name"
                value={formData.insurance_name}
                onChange={(e: any) => handleChange('insurance_name', e.target.value)}
              />
            )}

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-700 text-xs font-bold">
              Ao cadastrar, será gerada automaticamente uma pendência financeira para admissões particulares.
            </div>
          </div>
        )}
      </form>
    </MobileModal>
  );
};

export default NewPatientModal;
