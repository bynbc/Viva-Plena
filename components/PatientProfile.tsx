import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Edit2, Trash2, Save, X, Phone, MapPin, Calendar, User, Camera, FileText, Activity, DollarSign, Users, ClipboardList, Pill, FolderOpen, UserPlus } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import AssessmentAssist from './assessments/AssessmentAssist';
import AssessmentAudit from './assessments/AssessmentAudit';
import AssessmentNursing from './assessments/AssessmentNursing';
import VisitsControl from './VisitsControl';
import DynamicDocs from './DynamicDocs';
import Medication from './Medication'; // Reutilizando ou criar um subcomponente específico

const PatientProfile: React.FC = () => {
  const { brain, navigate, update, addToast, remove } = useBrain();
  const patient = brain.patients.find(p => p.id === brain.ui.selectedPatientId);

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'triage' | 'family' | 'clinical' | 'meds' | 'assessments' | 'docs' | 'visits' | 'financial'>('personal');
  const fileRef = useRef<HTMLInputElement>(null);

  // Estado para edição (cópia dos dados do paciente)
  const [formData, setFormData] = useState<any>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (patient) {
      setFormData({ ...patient });
      setPhotoPreview(patient.photo_url || null);
    }
  }, [patient, isEditing]);

  if (!patient) return <div className="p-10 text-center"><button onClick={() => navigate('patients')} className="text-indigo-600 font-bold hover:underline">← Voltar para Lista</button></div>;

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    try {
      await update('patients', patient.id, {
        ...formData,
        photo_url: photoPreview
      });
      setIsEditing(false);
      addToast("Perfil atualizado com sucesso!", "success");
    } catch (err) {
      console.error(err);
      addToast("Erro ao atualizar.", "error");
    }
  };

  const handleDelete = async () => {
    if (confirm("ATENÇÃO: Deseja realmente excluir este acolhido? Esta ação não pode ser desfeita.")) {
      await remove('patients', patient.id);
      navigate('patients');
    }
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Componente auxiliar para campos de texto
  const Field = ({ label, field, placeholder, type = 'text', component = 'input' }: any) => (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">{label}</label>
      {isEditing ? (
        component === 'textarea' ? (
          <textarea
            value={formData[field] || ''}
            onChange={e => handleChange(field, e.target.value)}
            className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-200 outline-none focus:border-indigo-500 min-h-[100px]"
            placeholder={placeholder}
          />
        ) : (
          <input
            type={type}
            value={formData[field] || ''}
            onChange={e => handleChange(field, e.target.value)}
            className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-200 outline-none focus:border-indigo-500"
            placeholder={placeholder}
          />
        )
      ) : (
        <div className="p-3 bg-slate-50 rounded-xl font-bold text-slate-700 min-h-[48px] flex items-center">
          {formData[field] || <span className="text-slate-300 italic">Não informado</span>}
        </div>
      )}
    </div>
  );

  return (
    <div className="pb-24 animate-in fade-in">
      {/* CABEÇALHO */}
      {/* CABEÇALHO */}
      <div className="bg-white rounded-b-[40px] shadow-sm border-b border-slate-100 p-6 relative flex flex-col items-center">

        {/* Navegação e Ações (Topo) */}
        <div className="w-full flex justify-between items-start mb-6">
          <button onClick={() => navigate('patients')} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><ArrowLeft size={20} /></button>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"><X size={18} /></button>
                <button onClick={handleUpdate} className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-colors flex gap-2 items-center font-bold text-xs uppercase"><Save size={18} /> <span className="hidden md:inline">Salvar</span></button>
              </>
            ) : (
              <>
                <button onClick={handleDelete} className="p-3 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-xl transition-colors"><Trash2 size={18} /></button>
                <button onClick={() => setIsEditing(true)} className="p-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-colors flex items-center gap-2 font-bold text-xs uppercase"><Edit2 size={18} /> <span className="hidden md:inline">Editar</span></button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div onClick={() => isEditing && fileRef.current?.click()} className={`w-24 h-24 md:w-32 md:h-32 rounded-full bg-slate-200 border-4 border-white shadow-xl overflow-hidden relative ${isEditing ? 'cursor-pointer hover:opacity-80' : ''}`}>
            {photoPreview ? <img src={photoPreview} className="w-full h-full object-cover" /> : <User className="w-full h-full p-6 text-slate-400" />}
            {isEditing && <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><Camera className="text-white" /></div>}
          </div>
          <input type="file" ref={fileRef} className="hidden" onChange={handlePhoto} accept="image/*" />

          <div className="mt-4 text-center w-full max-w-md px-4">
            {isEditing ? (
              <input value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} className="text-xl md:text-2xl font-black text-center bg-slate-50 border border-slate-200 w-full p-2 rounded-lg outline-none focus:border-indigo-500" placeholder="Nome Completo" />
            ) : (
              <>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 text-center leading-tight">{patient.name}</h1>
                <p className="text-slate-400 font-bold uppercase text-[10px] md:text-xs mt-2">
                  {patient.status === 'active' ? <span className="text-emerald-500">Acolhimento Ativo</span> : <span className="text-rose-500">Desligado</span>} • ID: {patient.id.slice(0, 6)}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO ENTRE ABAS */}
      <div className="flex gap-2 overflow-x-auto px-6 mt-6 pb-2 scrollbar-hide">
        {[
          { id: 'personal', label: 'Pessoal', icon: User },
          { id: 'triage', label: 'Triagem', icon: ClipboardList },
          { id: 'family', label: 'Família', icon: Users },
          { id: 'clinical', label: 'Clínico', icon: Activity },
          { id: 'meds', label: 'Medicamentos', icon: Pill },
          { id: 'assessments', label: 'Avaliações', icon: FileText },
          { id: 'docs', label: 'Documentos', icon: FolderOpen },
          { id: 'visits', label: 'Visitas', icon: UserPlus },
          { id: 'financial', label: 'Financeiro', icon: DollarSign },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-black uppercase whitespace-nowrap transition-all ${activeTab === tab.id
              ? 'bg-slate-900 text-white shadow-lg'
              : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'
              }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="p-6 max-w-4xl mx-auto space-y-6">

        {/* PESSOAL */}
        {activeTab === 'personal' && (
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4 animate-in slide-in-from-bottom-4">
            <h3 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2"><User size={14} /> Dados Pessoais</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="CPF" field="cpf" />
              <Field label="RG" field="rg" />
              <Field label="Data de Nascimento" field="date_of_birth" type="date" />
              <Field label="Sexo" field="sex" />
              <Field label="Profissão" field="profession" />
              <Field label="Escolaridade" field="education_level" />
              <Field label="Estado Civil" field="marital_status" />
              <Field label="Nome da Mãe" field="mother_name" />
              <Field label="Nome do Pai" field="father_name" />
              <Field label="Naturalidade/UF" field="place_of_birth" />
              <Field label="Religião" field="religion" />
            </div>
          </div>
        )}

        {/* TRIAGEM / ORIGEM */}
        {activeTab === 'triage' && (
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4 animate-in slide-in-from-bottom-4">
            <h3 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2"><ClipboardList size={14} /> Dados de Triagem (PDF)</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Município de Origem" field="origin_city" />
              <Field label="Serviço de Referência" field="reference_service" />
              <Field label="Acomp. Terapêutico Anterior" field="therapeutic_accompaniment" />
              <Field label="Resp. Envio Medicação" field="medication_responsible_name" />
              <Field label="Contato Resp. Medicação" field="medication_responsible_contact" />
              <Field label="Técnico Responsável" field="filling_technician_name" />
            </div>
            <Field label="Recomendações da Equipe (Intercorrências)" field="mental_health_recommendations" component="textarea" />
          </div>
        )}

        {/* FAMÍLIA / ENDEREÇO */}
        {activeTab === 'family' && (
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6 animate-in slide-in-from-bottom-4">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2"><MapPin size={14} /> Endereço</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Rua / Número" field="address_street" />
                <Field label="Bairro" field="address_neighborhood" />
                <Field label="Cidade / UF" field="address_city" />
                <Field label="CEP" field="address_zip" />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2"><Users size={14} /> Responsável Legal</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Nome do Responsável" field="family_responsible" />
                <Field label="Telefone / Contato" field="family_contact" />
                <Field label="CPF do Responsável" field="family_responsible_cpf" />
                <Field label="RG do Responsável" field="family_responsible_rg" />
                <Field label="Vínculo/Parentesco" field="family_bond" />
              </div>
            </div>
          </div>
        )}

        {/* CLÍNICO */}
        {activeTab === 'clinical' && (
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4 animate-in slide-in-from-bottom-4">
            <h3 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2"><Activity size={14} /> Dados Clínicos</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Data de Admissão" field="entry_date" type="date" />
              <Field label="Cartão SUS" field="sus_number" />
            </div>
            <Field label="Diagnóstico (CID)" field="diagnosis" component="textarea" />
            <Field label="Histórico de Dependência" field="dependence_history" component="textarea" />

            <div className="grid md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="text-center">
                <label className="text-[10px] font-black text-slate-400 uppercase">Tratamento CAPS</label>
                {isEditing ? (
                  <select value={formData.caps_treatment ? 'sim' : 'nao'} onChange={e => handleChange('caps_treatment', e.target.value === 'sim')} className="w-full mt-1 p-2 bg-white rounded-lg font-bold border border-slate-200 text-sm">
                    <option value="nao">Não</option>
                    <option value="sim">Sim</option>
                  </select>
                ) : <p className="font-bold text-slate-700 mt-1">{formData.caps_treatment ? 'Sim' : 'Não'}</p>}
              </div>
              <div className="text-center">
                <label className="text-[10px] font-black text-slate-400 uppercase">Internações Anteriores</label>
                {isEditing ? (
                  <select value={formData.has_previous_admissions ? 'sim' : 'nao'} onChange={e => handleChange('has_previous_admissions', e.target.value === 'sim')} className="w-full mt-1 p-2 bg-white rounded-lg font-bold border border-slate-200 text-sm">
                    <option value="nao">Não</option>
                    <option value="sim">Sim</option>
                  </select>
                ) : <p className="font-bold text-slate-700 mt-1">{formData.has_previous_admissions ? 'Sim' : 'Não'}</p>}
              </div>
            </div>
          </div>
        )}

        {/* MEDICAMENTOS */}
        {activeTab === 'meds' && (
          <div className="animate-in slide-in-from-bottom-4">
            {/* 
                     Mostra a lista geral de medicamentos filtrando visualmente 
                     (Idealmente refatorar Medication.tsx para receber patientId filter, 
                     mas por enquanto renderizamos o módulo geral com contexto) 
                 */}
            <div className="bg-indigo-50 p-4 rounded-2xl mb-4 border border-indigo-100 text-indigo-700 text-sm font-bold text-center">
              Visualizando prescrições apenas de {patient.name.split(' ')[0]}
            </div>
            {/* TODO: Criar subcomponente filtrado. Por hora, placeholder */}
            <div className="opacity-50 pointer-events-none filter blur-[1px]">
              <Medication />
            </div>
            <button className="w-full mt-4 py-3 bg-white border border-indigo-200 text-indigo-600 rounded-xl font-black uppercase hover:bg-indigo-50" onClick={() => addToast('Funcionalidade de filtro específico em desenvolvimento', 'info')}>
              Gerenciar Prescrições Deste Paciente
            </button>
          </div>
        )}

        {/* AVALIAÇÕES */}
        {activeTab === 'assessments' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4">
            <AssessmentNursing patientId={patient.id} />
            <AssessmentAssist patientId={patient.id} />
            <AssessmentAudit patientId={patient.id} />
          </div>
        )}

        {/* VISITAS */}
        {activeTab === 'visits' && (
          <div className="animate-in slide-in-from-bottom-4">
            <VisitsControl patientId={patient.id} />
          </div>
        )}

        {/* DOCUMENTOS */}
        {activeTab === 'docs' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4">
            <DynamicDocs patientId={patient.id} />
          </div>
        )}

        {/* FINANCEIRO */}
        {activeTab === 'financial' && (
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4 animate-in slide-in-from-bottom-4">
            <h3 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2"><DollarSign size={14} /> Dados Financeiros</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Tipo de Pagamento</label>
                {isEditing ? (
                  <select value={formData.payment_type || 'particular'} onChange={e => handleChange('payment_type', e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-200 outline-none focus:border-indigo-500">
                    <option value="particular">Particular</option>
                    <option value="convenio">Convênio</option>
                    <option value="social">Social</option>
                  </select>
                ) : <div className="p-3 bg-slate-50 rounded-xl font-bold text-slate-700 uppercase">{formData.payment_type}</div>}
              </div>

              {formData.payment_type === 'convenio' && <Field label="Nome do Convênio" field="insurance_name" />}
              {formData.payment_type === 'particular' && <Field label="Mensalidade (R$)" field="monthly_fee" />}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
export default PatientProfile;
