import React, { useState } from 'react';
import { 
  UserPlus, X, Save, User, FileText, MapPin, 
  CreditCard, Calendar, Activity, AlertCircle 
} from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import MobileModal from './common/MobileModal';

const NewPatientModal: React.FC = () => {
  const { setQuickAction, push, addToast, refreshData, brain } = useBrain();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pessoal' | 'clinico' | 'endereco' | 'financeiro'>('pessoal');

  // Estado do Formulário Completo
  const [formData, setFormData] = useState({
    // Pessoal
    name: '',
    cpf: '',
    rg: '',
    sus_number: '',
    birthDate: '',
    phone: '',
    
    // Endereço & Família
    address_street: '',
    address_city: '',
    familyResponsible: '',
    familyContact: '',

    // Clínico
    dependence_history: '', // Histórico de uso
    diagnosis: '', // CID ou descrição
    entry_date: new Date().toISOString().split('T')[0],
    exit_forecast_date: '',
    
    // Financeiro
    paymentType: 'particular', // particular, convenio, social
    insuranceName: '',
    monthly_fee: ''
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      addToast("O nome do acolhido é obrigatório.", "warning");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        clinic_id: brain.session.clinicId,
        name: formData.name,
        cpf: formData.cpf,
        rg: formData.rg,
        sus_number: formData.sus_number,
        birthDate: formData.birthDate,
        phone: formData.phone,
        status: 'active', // Padrão ao criar
        
        address: formData.address_street, // Compatibilidade
        address_street: formData.address_street,
        address_city: formData.address_city,
        familyResponsible: formData.familyResponsible,
        familyContact: formData.familyContact,
        
        dependence_history: formData.dependence_history,
        diagnosis: formData.diagnosis,
        admissionDate: formData.entry_date, // Compatibilidade
        entry_date: formData.entry_date,
        exitForecast: formData.exit_forecast_date, // Compatibilidade
        exit_forecast_date: formData.exit_forecast_date,
        
        paymentType: formData.paymentType,
        insuranceName: formData.insuranceName,
        monthly_fee: Number(formData.monthly_fee) || 0,
        
        created_by: brain.session.user?.username || 'Sistema',
        created_at: new Date().toISOString()
      };

      await push('patients', payload);

      addToast("Acolhido cadastrado com sucesso!", "success");
      setQuickAction(null);
      refreshData();
    } catch (error) {
      console.error(error);
      addToast("Erro ao cadastrar. Verifique os dados.", "error");
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex gap-3 w-full">
      <button 
        type="button" 
        onClick={() => setQuickAction(null)} 
        className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-[10px] uppercase text-slate-500"
      >
        Cancelar
      </button>
      <button 
        onClick={handleSave}
        disabled={loading} 
        className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-[10px] uppercase shadow-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
      >
        {loading ? 'Salvando...' : <><Save size={16} /> Confirmar Cadastro</>}
      </button>
    </div>
  );

  return (
    <MobileModal 
      title="Novo Acolhido" 
      subtitle="Ficha de Admissão" 
      icon={UserPlus} 
      iconColor="bg-indigo-600" 
      onClose={() => setQuickAction(null)} 
      footer={footer}
    >
      <div className="space-y-6">
        
        {/* ABAS DE NAVEGAÇÃO */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('pessoal')}
            className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'pessoal' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
          >
            Pessoal
          </button>
          <button 
            onClick={() => setActiveTab('clinico')}
            className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'clinico' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
          >
            Clínico
          </button>
          <button 
            onClick={() => setActiveTab('endereco')}
            className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'endereco' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
          >
            Família
          </button>
          <button 
            onClick={() => setActiveTab('financeiro')}
            className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'financeiro' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
          >
            Financ.
          </button>
        </div>

        {/* CONTEÚDO DO FORMULÁRIO */}
        <form className="space-y-4 min-h-[300px]">
          
          {/* ABA PESSOAL */}
          {activeTab === 'pessoal' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none focus:border-indigo-500"
                    placeholder="Nome do Acolhido"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">CPF</label>
                  <input 
                    value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none"
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">RG (Novo)</label>
                  <input 
                    value={formData.rg} onChange={e => setFormData({...formData, rg: e.target.value})}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none"
                    placeholder="Registro Geral"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Cartão SUS</label>
                  <input 
                    value={formData.sus_number} onChange={e => setFormData({...formData, sus_number: e.target.value})}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none"
                    placeholder="Número SUS"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Nascimento</label>
                  <input 
                    type="date"
                    value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ABA CLÍNICO */}
          {activeTab === 'clinico' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
               <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Histórico de Dependência</label>
                <textarea 
                  value={formData.dependence_history} onChange={e => setFormData({...formData, dependence_history: e.target.value})}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-700 outline-none min-h-[80px]"
                  placeholder="Substâncias utilizadas, tempo de uso, internações anteriores..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Diagnóstico / CID</label>
                <input 
                  value={formData.diagnosis} onChange={e => setFormData({...formData, diagnosis: e.target.value})}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none"
                  placeholder="Ex: F19.2 - Transtornos mentais..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Data Entrada</label>
                  <input 
                    type="date"
                    value={formData.entry_date} onChange={e => setFormData({...formData, entry_date: e.target.value})}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Previsão Saída</label>
                  <input 
                    type="date"
                    value={formData.exit_forecast_date} onChange={e => setFormData({...formData, exit_forecast_date: e.target.value})}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ABA ENDEREÇO & FAMÍLIA */}
          {activeTab === 'endereco' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Endereço Completo</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    value={formData.address_street} onChange={e => setFormData({...formData, address_street: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none"
                    placeholder="Rua, Número, Bairro"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Cidade / Estado</label>
                <input 
                  value={formData.address_city} onChange={e => setFormData({...formData, address_city: e.target.value})}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none"
                  placeholder="Ex: São Paulo - SP"
                />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-500 uppercase">Responsável Familiar</label>
                <input 
                  value={formData.familyResponsible} onChange={e => setFormData({...formData, familyResponsible: e.target.value})}
                  className="w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none"
                  placeholder="Nome do Responsável"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Contato (Telefone/Zap)</label>
                <input 
                  value={formData.familyContact} onChange={e => setFormData({...formData, familyContact: e.target.value})}
                  className="w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          )}

          {/* ABA FINANCEIRO */}
          {activeTab === 'financeiro' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase">Tipo de Pagamento</label>
                 <select 
                    value={formData.paymentType} onChange={e => setFormData({...formData, paymentType: e.target.value as any})}
                    className="w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none"
                 >
                   <option value="particular">Particular (Mensalidade)</option>
                   <option value="convenio">Convênio Médico</option>
                   <option value="social">Vaga Social / Governo</option>
                 </select>
               </div>

               {formData.paymentType === 'convenio' && (
                 <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Nome do Convênio</label>
                    <input 
                      value={formData.insuranceName} onChange={e => setFormData({...formData, insuranceName: e.target.value})}
                      className="w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none"
                      placeholder="Ex: Unimed, Bradesco..."
                    />
                 </div>
               )}

               {formData.paymentType === 'particular' && (
                 <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Valor Mensalidade (R$)</label>
                    <div className="relative">
                       <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                       <input 
                          type="number"
                          value={formData.monthly_fee} onChange={e => setFormData({...formData, monthly_fee: e.target.value})}
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none"
                          placeholder="0,00"
                        />
                    </div>
                 </div>
               )}
            </div>
          )}

        </form>
      </div>
    </MobileModal>
  );
};

export default NewPatientModal;
