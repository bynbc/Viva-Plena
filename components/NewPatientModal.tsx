import React, { useState, useRef } from 'react';
import { UserPlus, Loader2, User, Activity, CreditCard, Camera, Upload } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import { useAuth } from '../context/AuthContext';
import MobileModal from './common/MobileModal';

const NewPatientModal: React.FC = () => {
  const context = useBrain();
  const { user, hasPermission } = useAuth();
  if (!context || !context.brain) return null;
  const { brain, setQuickAction, push, navigate, addToast } = context;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'pessoal' | 'clinico' | 'financeiro'>('pessoal');
  const [photo, setPhoto] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '', cpf: '', birthDate: '', phone: '', address: '',
    familyResponsible: '', emergencyPhone: '', admissionDate: new Date().toISOString().split('T')[0],
    treatmentType: 'Internação', cid_main: '', reason: '',
    paymentType: 'particular', insuranceName: '', monthly_fee: '4500.00', dueDay: '10'
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return addToast('Foto muito grande.', 'warning');
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  // --- FUNÇÃO DE IMPRESSÃO ---
  const printAdmission = () => {
    setTimeout(() => window.print(), 500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('patients') || formData.name.length < 3) return;
    setLoading(true);
    const newId = crypto.randomUUID();
    try {
      await push('patients', {
        id: newId, name: formData.name.trim(), photo, cpf: formData.cpf, birthDate: formData.birthDate,
        phone: formData.phone, address: formData.address, familyResponsible: formData.familyResponsible,
        emergencyPhone: formData.emergencyPhone, admissionDate: new Date(formData.admissionDate).toISOString(),
        status: 'active', treatmentType: formData.treatmentType, cid_main: formData.cid_main,
        reason: formData.reason, paymentType: formData.paymentType, insuranceName: formData.insuranceName,
        monthly_fee: parseFloat(formData.monthly_fee), created_at: new Date().toISOString(), created_by: user?.username
      });

      if (formData.paymentType === 'particular') {
        await push('transactions', {
          id: crypto.randomUUID(), patient_id: newId, clinic_id: brain.session?.clinicId || 'default',
          description: `Mensalidade Inicial - ${formData.name}`, amount: parseFloat(formData.monthly_fee),
          type: 'income', status: 'pending', category: 'Mensalidade', due_date: new Date().toISOString(), date: new Date().toISOString()
        });
      }

      addToast('Paciente cadastrado!', 'success');
      
      // CONFIRMA IMPRESSÃO
      if (confirm('Cadastro realizado! Deseja imprimir a Ficha de Admissão agora?')) {
        printAdmission();
      } else {
        setQuickAction(null);
        navigate('patients');
      }
    } catch (err) { console.error(err); addToast("Erro ao salvar.", "error"); } finally { setLoading(false); }
  };

  return (
    <>
      {/* MODELO DE IMPRESSÃO (Escondido na tela, visível no papel) */}
      <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-10 text-black font-serif">
         <div className="text-center border-b-2 border-black pb-4 mb-8">
            <h1 className="text-3xl font-bold uppercase">{brain.organization.name}</h1>
            <p className="text-lg">Ficha de Admissão Terapêutica</p>
         </div>
         <div className="grid grid-cols-2 gap-6 text-sm">
            <div className="col-span-2 flex gap-6 items-center border p-4 rounded">
               {photo ? <img src={photo} className="w-24 h-24 object-cover border" /> : <div className="w-24 h-24 border bg-gray-100"></div>}
               <div><h2 className="text-2xl font-bold">{formData.name}</h2><p>CPF: {formData.cpf}</p></div>
            </div>
            <div><strong>Nascimento:</strong> {formData.birthDate}</div>
            <div><strong>Contato:</strong> {formData.phone}</div>
            <div className="col-span-2"><strong>Endereço:</strong> {formData.address}</div>
            <div className="col-span-2 border-t border-dashed border-gray-400 my-2"></div>
            <div><strong>Responsável:</strong> {formData.familyResponsible}</div>
            <div><strong>Emergência:</strong> {formData.emergencyPhone}</div>
            <div className="col-span-2 border-t border-dashed border-gray-400 my-2"></div>
            <div><strong>Admissão:</strong> {new Date(formData.admissionDate).toLocaleDateString()}</div>
            <div><strong>Tratamento:</strong> {formData.treatmentType}</div>
            <div className="col-span-2 p-4 border border-gray-300 rounded min-h-[150px]">
               <strong className="block mb-2">Observações / Diagnóstico:</strong> {formData.reason}
            </div>
         </div>
         <div className="mt-20 grid grid-cols-2 gap-20 text-center pt-8 border-t border-black">
            <div>__________________________<br/>Assinatura do Responsável</div>
            <div>__________________________<br/>Direção Técnica</div>
         </div>
      </div>

      <MobileModal title="Admissão" subtitle="Novo Paciente" icon={UserPlus} iconColor="bg-emerald-600" onClose={() => setQuickAction(null)} 
        footer={
          <div className="flex gap-3 w-full print:hidden">
            <button type="button" onClick={() => setQuickAction(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-[10px] uppercase text-slate-500">Cancelar</button>
            <button form="new-patient-form" type="submit" disabled={loading} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-[10px] uppercase shadow-lg">{loading ? <Loader2 className="animate-spin mx-auto"/> : 'Finalizar'}</button>
          </div>
        }>
        <div className="flex p-1 bg-slate-100 rounded-xl mb-6 print:hidden">
          <TabButton active={tab === 'pessoal'} onClick={() => setTab('pessoal')} icon={User} label="Pessoal" />
          <TabButton active={tab === 'clinico'} onClick={() => setTab('clinico')} icon={Activity} label="Clínico" />
          <TabButton active={tab === 'financeiro'} onClick={() => setTab('financeiro')} icon={CreditCard} label="Financeiro" />
        </div>
        <form id="new-patient-form" onSubmit={handleSave} className="space-y-6 print:hidden">
          {tab === 'pessoal' && <div className="space-y-4 animate-in slide-in-from-left-4"><div className="flex justify-center"><div onClick={() => fileInputRef.current?.click()} className="w-28 h-28 rounded-full border-4 border-slate-100 bg-slate-50 flex items-center justify-center cursor-pointer overflow-hidden">{photo ? <img src={photo} className="w-full h-full object-cover"/> : <Camera className="text-slate-300"/>}</div><input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*"/></div><Input label="Nome *" value={formData.name} onChange={v => handleChange('name', v)} required /><div className="grid grid-cols-2 gap-4"><Input label="CPF" value={formData.cpf} onChange={v => handleChange('cpf', v)} /><Input label="Nascimento" type="date" value={formData.birthDate} onChange={v => handleChange('birthDate', v)} /></div><Input label="Endereço" value={formData.address} onChange={v => handleChange('address', v)} /><div className="grid grid-cols-2 gap-4"><Input label="Responsável" value={formData.familyResponsible} onChange={v => handleChange('familyResponsible', v)} /><Input label="Emergência" value={formData.emergencyPhone} onChange={v => handleChange('emergencyPhone', v)} /></div></div>}
          {tab === 'clinico' && <div className="space-y-4 animate-in slide-in-from-right-4"><div className="grid grid-cols-2 gap-4"><Input label="Data Entrada" type="date" value={formData.admissionDate} onChange={v => handleChange('admissionDate', v)} /><Select label="Tratamento" value={formData.treatmentType} onChange={v => handleChange('treatmentType', v)}><option value="Internação">Internação Involuntária</option><option value="Voluntária">Voluntária</option><option value="Convênio">Convênio</option></Select></div><Input label="CID" value={formData.cid_main} onChange={v => handleChange('cid_main', v)} /><div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase pl-2">Observações</label><textarea rows={4} value={formData.reason} onChange={e => handleChange('reason', e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none resize-none"/></div></div>}
          {tab === 'financeiro' && <div className="space-y-4 animate-in slide-in-from-right-4"><Select label="Tipo" value={formData.paymentType} onChange={v => handleChange('paymentType', v)}><option value="particular">Particular</option><option value="convenio">Convênio</option><option value="social">Social</option></Select>{formData.paymentType === 'particular' && <><Input label="Mensalidade" type="number" value={formData.monthly_fee} onChange={v => handleChange('monthly_fee', v)} /><Select label="Vencimento" value={formData.dueDay} onChange={v => handleChange('dueDay', v)}><option value="05">Dia 05</option><option value="10">Dia 10</option><option value="15">Dia 15</option></Select></>}</div>}
        </form>
      </MobileModal>
    </>
  );
};
const Input = ({ label, value, onChange, type = "text", required }: any) => (<div className="space-y-1 w-full"><label className="text-[10px] font-black text-slate-400 uppercase pl-2">{label}</label><input required={required} type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500" /></div>);
const Select = ({ label, value, onChange, children }: any) => (<div className="space-y-1 w-full"><label className="text-[10px] font-black text-slate-400 uppercase pl-2">{label}</label><select value={value} onChange={e => onChange(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500">{children}</select></div>);
const TabButton = ({ active, onClick, icon: Icon, label }: any) => (<button type="button" onClick={onClick} className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase ${active ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}><Icon size={14} /> {label}</button>);
export default NewPatientModal;
