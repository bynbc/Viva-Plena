import React, { useState, useRef } from 'react';
import { UserPlus, Save, User, Camera } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import MobileModal from './common/MobileModal';

const NewPatientModal: React.FC = () => {
  const { setQuickAction, push, addToast, refreshData, brain } = useBrain();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pessoal' | 'clinico' | 'endereco' | 'financeiro'>('pessoal');
  
  // FOTO
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '', cpf: '', rg: '', sus_number: '', birthDate: '', phone: '',
    address_street: '', address_city: '', familyResponsible: '', familyContact: '',
    dependence_history: '', diagnosis: '', entry_date: new Date().toISOString().split('T')[0],
    exit_forecast_date: '', paymentType: 'particular', insuranceName: '', monthly_fee: ''
  });

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if(file) {
        const reader = new FileReader();
        reader.onloadend = () => setPhotoUrl(reader.result as string);
        reader.readAsDataURL(file);
     }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return addToast("Nome obrigatório.", "warning");

    setLoading(true);
    try {
      await push('patients', {
        clinic_id: brain.session.clinicId,
        name: formData.name,
        photo_url: photoUrl, // <--- SALVA A FOTO
        cpf: formData.cpf,
        rg: formData.rg,
        sus_number: formData.sus_number,
        birthdate: formData.birthDate || null,
        phone: formData.phone,
        status: 'active',
        address_street: formData.address_street,
        address_city: formData.address_city,
        familyresponsible: formData.familyResponsible,
        familycontact: formData.familyContact,
        dependence_history: formData.dependence_history,
        diagnosis: formData.diagnosis,
        entry_date: formData.entry_date || null,
        exit_forecast_date: formData.exit_forecast_date || null,
        paymenttype: formData.paymentType,
        insurancename: formData.insuranceName,
        monthly_fee: Number(formData.monthly_fee) || 0,
        created_by: brain.session.user?.username,
        created_at: new Date().toISOString()
      });

      addToast("Acolhido salvo com sucesso!", "success");
      setQuickAction(null);
      refreshData();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ... (O JSX é igual ao anterior, SÓ MUDA O INICIO DO FORM COM A FOTO) ...
  const footer = (
      <div className="flex gap-3 w-full">
        <button type="button" onClick={() => setQuickAction(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-[10px] uppercase text-slate-500">Cancelar</button>
        <button onClick={handleSave} disabled={loading} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-[10px] uppercase shadow-lg hover:bg-indigo-700 flex items-center justify-center gap-2">
          {loading ? 'Salvando...' : <><Save size={16} /> Confirmar</>}
        </button>
      </div>
  );

  return (
    <MobileModal title="Novo Acolhido" subtitle="Ficha de Admissão" icon={UserPlus} iconColor="bg-indigo-600" onClose={() => setQuickAction(null)} footer={footer}>
      <div className="space-y-6">
        <div className="flex bg-slate-100 p-1 rounded-xl">
           {['pessoal', 'clinico', 'endereco', 'financeiro'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>{tab}</button>
           ))}
        </div>

        <form className="space-y-4 min-h-[300px]">
          {/* FOTO E NOME (Aparece sempre na aba pessoal) */}
          {activeTab === 'pessoal' && (
             <div className="space-y-4 animate-in fade-in">
                <div className="flex justify-center mb-4">
                   <div onClick={() => fileRef.current?.click()} className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-lg flex items-center justify-center cursor-pointer overflow-hidden relative group">
                      {photoUrl ? <img src={photoUrl} className="w-full h-full object-cover" /> : <Camera className="text-slate-400" size={30} />}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-[9px] text-white font-bold">ALTERAR</span></div>
                   </div>
                   <input type="file" ref={fileRef} onChange={handlePhoto} className="hidden" accept="image/*" />
                </div>
                {/* ... RESTO DOS CAMPOS IGUAIS AO ANTERIOR ... */}
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo *</label>
                   <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none" placeholder="Nome"/>
                </div>
                {/* Adicione os outros campos aqui igual ao arquivo anterior */}
             </div>
          )}
          {/* ... OUTRAS ABAS IGUAIS AO ANTERIOR ... */}
          {activeTab !== 'pessoal' && <div className="p-4 text-center text-slate-400 text-xs">Preencha os campos das outras abas conforme necessário...</div>}
        </form>
      </div>
    </MobileModal>
  );
};
export default NewPatientModal;
