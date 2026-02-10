import React, { useMemo, useRef, useState } from 'react';
import { Camera, Save, User, UserPlus } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import MobileModal from './common/MobileModal';

type Tab = 'pessoal' | 'clinico' | 'endereco' | 'financeiro';

const NewPatientModal: React.FC = () => {
  const { setQuickAction, push, addToast, refreshData, brain } = useBrain();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('pessoal');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    rg: '',
    sus_number: '',
    birthDate: '',
    phone: '',
    email: '',
    room: '',
    address_street: '',
    address_city: '',
    familyResponsible: '',
    familyContact: '',
    dependence_history: '',
    diagnosis: '',
    notes: '',
    entry_date: new Date().toISOString().split('T')[0],
    exit_forecast_date: '',
    paymentType: 'particular',
    insuranceName: '',
    monthly_fee: ''
  });

  const requiredMissing = useMemo(() => {
    const missing: string[] = [];
    if (!formData.name.trim()) missing.push('Nome');
    if (!formData.phone.trim()) missing.push('Telefone');
    if (!formData.familyResponsible.trim()) missing.push('Responsável');
    return missing;
  }, [formData]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPhotoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (requiredMissing.length > 0) {
      addToast(`Preencha os campos obrigatórios: ${requiredMissing.join(', ')}`, 'warning');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        clinic_id: brain.session.clinicId,
        name: formData.name,
        cpf: formData.cpf || null,
        rg: formData.rg || null,
        sus_number: formData.sus_number || null,
        birthdate: formData.birthDate || null,
        phone: formData.phone || null,
        email: formData.email || null,
        room: formData.room || null,
        photo_url: photoUrl,
        status: 'active',
        address_street: formData.address_street || null,
        address_city: formData.address_city || null,
        familyresponsible: formData.familyResponsible || null,
        familycontact: formData.familyContact || null,
        dependence_history: formData.dependence_history || null,
        diagnosis: formData.diagnosis || null,
        notes: formData.notes || null,
        entry_date: formData.entry_date || null,
        exit_forecast_date: formData.exit_forecast_date || null,
        paymenttype: formData.paymentType,
        insurancename: formData.insuranceName || null,
        monthly_fee: Number(formData.monthly_fee) || 0,
        created_by: brain.session.user?.username || 'Sistema',
        created_at: new Date().toISOString()
      };

      await push('patients', payload);
      addToast('Acolhido cadastrado com sucesso!', 'success');
      setQuickAction(null);
      refreshData();
    } catch (error) {
      console.error(error);
      addToast('Erro ao cadastrar. Verifique os dados.', 'error');
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
      <form className="space-y-6" onSubmit={handleSave}>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {(['pessoal', 'clinico', 'endereco', 'financeiro'] as Tab[]).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
            >
              {tab === 'endereco' ? 'Família' : tab === 'financeiro' ? 'Financ.' : tab}
            </button>
          ))}
        </div>

        {activeTab === 'pessoal' && (
          <section className="space-y-4 animate-in fade-in slide-in-from-left-4">
            <div className="flex justify-center py-2">
              <button type="button" onClick={() => photoRef.current?.click()} className="w-28 h-28 rounded-full border-4 border-white shadow-lg bg-slate-100 text-slate-400 flex items-center justify-center overflow-hidden">
                {photoUrl ? <img src={photoUrl} alt="Foto do paciente" className="w-full h-full object-cover" /> : <Camera size={32} />}
              </button>
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo *</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none focus:border-indigo-500" placeholder="Nome" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none" placeholder="Telefone *" />
              <input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none" placeholder="E-mail" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none" placeholder="CPF" />
              <input value={formData.rg} onChange={e => setFormData({ ...formData, rg: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none" placeholder="RG" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={formData.sus_number} onChange={e => setFormData({ ...formData, sus_number: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none" placeholder="Cartão SUS" />
              <input type="date" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none" />
            </div>
          </section>
        )}

        {activeTab === 'clinico' && (
          <section className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <textarea value={formData.dependence_history} onChange={e => setFormData({ ...formData, dependence_history: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-700 outline-none min-h-[90px]" placeholder="Histórico de Dependência" />
            <input value={formData.diagnosis} onChange={e => setFormData({ ...formData, diagnosis: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none" placeholder="Diagnóstico / CID" />
            <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-700 outline-none min-h-[90px]" placeholder="Observações" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-xs font-bold text-slate-500 uppercase">Entrada</label><input type="date" value={formData.entry_date} onChange={e => setFormData({ ...formData, entry_date: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none" /></div>
              <div><label className="text-xs font-bold text-slate-500 uppercase">Prev. Saída</label><input type="date" value={formData.exit_forecast_date} onChange={e => setFormData({ ...formData, exit_forecast_date: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none" /></div>
            </div>
          </section>
        )}

        {activeTab === 'endereco' && (
          <section className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <input value={formData.address_street} onChange={e => setFormData({ ...formData, address_street: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none" placeholder="Endereço Completo" />
            <input value={formData.address_city} onChange={e => setFormData({ ...formData, address_city: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none" placeholder="Cidade - UF" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={formData.familyResponsible} onChange={e => setFormData({ ...formData, familyResponsible: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none" placeholder="Nome Responsável *" />
              <input value={formData.familyContact} onChange={e => setFormData({ ...formData, familyContact: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none" placeholder="Contato (Tel/Zap)" />
            </div>
            <input value={formData.room} onChange={e => setFormData({ ...formData, room: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none" placeholder="Quarto / Acomodação" />
          </section>
        )}

        {activeTab === 'financeiro' && (
          <section className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <select value={formData.paymentType} onChange={e => setFormData({ ...formData, paymentType: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none">
              <option value="particular">Particular</option>
              <option value="convenio">Convênio</option>
              <option value="social">Social</option>
            </select>
            {formData.paymentType === 'convenio' && <input value={formData.insuranceName} onChange={e => setFormData({ ...formData, insuranceName: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none" placeholder="Nome do Convênio" />}
            {formData.paymentType === 'particular' && <input type="number" value={formData.monthly_fee} onChange={e => setFormData({ ...formData, monthly_fee: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none" placeholder="Valor Mensalidade (R$)" />}
          </section>
        )}
      </form>
    </MobileModal>
  );
};

export default NewPatientModal;
