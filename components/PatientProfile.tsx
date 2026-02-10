import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Edit2, Trash2, Save, X, Phone, MapPin, 
  Calendar, CreditCard, Activity, FileText, AlertTriangle, 
  Camera, User 
} from 'lucide-react';
import { useBrain } from '../context/BrainContext';

const PatientProfile: React.FC = () => {
  const { brain, navigate, update, addToast } = useBrain();
  
  // 1. Busca o paciente selecionado
  const patient = brain.patients.find(p => p.id === brain.ui.selectedPatientId);

  // 2. Estados para Edição
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [editedAddress, setEditedAddress] = useState('');
  const [editedResponsible, setEditedResponsible] = useState('');
  const [editedDiagnosis, setEditedDiagnosis] = useState('');
  
  // 3. Foto (Edição)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Carrega os dados quando o paciente muda ou entra em modo de edição
  useEffect(() => {
    if (patient) {
      setEditedName(patient.name);
      setEditedPhone(patient.phone || '');
      setEditedAddress(patient.address_street || '');
      setEditedResponsible(patient.familyresponsible || '');
      setEditedDiagnosis(patient.diagnosis || '');
      setPhotoUrl(patient.photo_url || null);
    }
  }, [patient, isEditing]);

  // Se não tiver paciente selecionado, volta (Proteção)
  if (!patient) {
    return (
      <div className="p-10 text-center">
        <p>Paciente não encontrado.</p>
        <button onClick={() => navigate('patients')} className="mt-4 text-indigo-600 font-bold">Voltar</button>
      </div>
    );
  }

  // --- AÇÕES ---

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    if (!editedName.trim()) return addToast("O nome não pode ficar vazio.", "warning");

    try {
      await update('patients', patient.id, {
        name: editedName,
        phone: editedPhone,
        address_street: editedAddress,
        familyresponsible: editedResponsible,
        diagnosis: editedDiagnosis,
        photo_url: photoUrl // Salva a nova foto
      });
      setIsEditing(false);
      addToast("Perfil atualizado com sucesso!", "success");
    } catch (err) {
      console.error(err); // BrainContext já mostra o erro
    }
  };

  const handleDelete = async () => {
    if (confirm(`Tem certeza que deseja EXCLUIR ${patient.name}? Essa ação não pode ser desfeita.`)) {
      try {
        // Opção 1: Soft Delete (Mais seguro, apenas marca como inativo)
        await update('patients', patient.id, { status: 'deleted' });
        
        // Opção 2: Hard Delete (Se quiser apagar de vez, use remove('patients', patient.id))
        
        addToast("Paciente removido.", "info");
        navigate('patients');
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* CABEÇALHO COM FOTO E AÇÕES */}
      <div className="bg-white rounded-b-[40px] shadow-sm border-b border-slate-100 p-6 md:p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-600 to-indigo-500 opacity-10" />
        
        {/* Botão Voltar */}
        <button onClick={() => navigate('patients')} className="absolute top-6 left-6 p-2 bg-white/80 backdrop-blur rounded-full text-slate-600 hover:bg-slate-100 transition-all z-10">
          <ArrowLeft size={20} />
        </button>

        {/* Botões de Ação (Editar/Excluir/Salvar) */}
        <div className="absolute top-6 right-6 flex gap-2 z-10">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="p-3 bg-white text-slate-400 rounded-xl shadow-sm font-bold text-xs uppercase hover:bg-slate-50">
                <X size={18} />
              </button>
              <button onClick={handleUpdate} className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 font-bold text-xs uppercase hover:bg-indigo-700 flex items-center gap-2">
                <Save size={18} /> Salvar
              </button>
            </>
          ) : (
            <>
              <button onClick={handleDelete} className="p-3 bg-white text-rose-500 border border-rose-100 rounded-xl shadow-sm hover:bg-rose-50 transition-all">
                <Trash2 size={18} />
              </button>
              <button onClick={() => setIsEditing(true)} className="p-3 bg-white text-indigo-600 border border-indigo-100 rounded-xl shadow-sm hover:bg-indigo-50 transition-all">
                <Edit2 size={18} />
              </button>
            </>
          )}
        </div>

        <div className="relative z-0 mt-8 flex flex-col items-center text-center">
          
          {/* FOTO DO PACIENTE */}
          <div className="relative group">
            <div className={`w-32 h-32 rounded-[32px] border-4 border-white shadow-xl flex items-center justify-center overflow-hidden ${isEditing ? 'cursor-pointer hover:opacity-90' : ''}`} onClick={() => isEditing && fileRef.current?.click()}>
              {photoUrl ? (
                <img src={photoUrl} alt="Foto do Paciente" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                  <User size={48} />
                </div>
              )}
              
              {/* Overlay de Edição de Foto */}
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Camera className="text-white drop-shadow-md" size={32} />
                </div>
              )}
            </div>
            <input type="file" ref={fileRef} onChange={handlePhotoChange} className="hidden" accept="image/*" />
          </div>

          {/* NOME E DIAGNÓSTICO */}
          <div className="mt-6 space-y-2 w-full max-w-md">
            {isEditing ? (
              <input 
                value={editedName} 
                onChange={e => setEditedName(e.target.value)} 
                className="w-full text-center text-2xl font-black text-slate-800 bg-slate-50 border-b-2 border-indigo-500 outline-none py-1"
                placeholder="Nome do Paciente"
              />
            ) : (
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">{patient.name}</h1>
            )}

            {isEditing ? (
              <input 
                value={editedDiagnosis} 
                onChange={e => setEditedDiagnosis(e.target.value)} 
                className="w-full text-center text-sm font-bold text-slate-500 bg-slate-50 border-b border-slate-300 outline-none py-1"
                placeholder="Diagnóstico (Ex: CID F19)"
              />
            ) : (
              <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black uppercase tracking-wide">
                {patient.diagnosis || 'Sem Diagnóstico'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* DETALHES DO PERFIL */}
      <div className="px-6 mt-8 max-w-3xl mx-auto space-y-6">
        
        {/* CARTÃO DE INFORMAÇÕES */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Dados Pessoais</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Telefone */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Phone size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase">Contato</p>
                {isEditing ? (
                  <input value={editedPhone} onChange={e => setEditedPhone(e.target.value)} className="w-full font-bold text-slate-800 bg-slate-50 border-b border-slate-300 outline-none" />
                ) : (
                  <p className="font-bold text-slate-800">{patient.phone || '—'}</p>
                )}
              </div>
            </div>

            {/* Endereço */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <MapPin size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase">Endereço</p>
                {isEditing ? (
                  <input value={editedAddress} onChange={e => setEditedAddress(e.target.value)} className="w-full font-bold text-slate-800 bg-slate-50 border-b border-slate-300 outline-none" />
                ) : (
                  <p className="font-bold text-slate-800">{patient.address_street || '—'}</p>
                )}
              </div>
            </div>

            {/* Responsável */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <User size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase">Responsável</p>
                {isEditing ? (
                  <input value={editedResponsible} onChange={e => setEditedResponsible(e.target.value)} className="w-full font-bold text-slate-800 bg-slate-50 border-b border-slate-300 outline-none" />
                ) : (
                  <p className="font-bold text-slate-800">{patient.familyresponsible || '—'}</p>
                )}
              </div>
            </div>

            {/* Data de Entrada */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Calendar size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase">Entrada</p>
                <p className="font-bold text-slate-800">
                  {patient.entry_date ? new Date(patient.entry_date).toLocaleDateString('pt-BR') : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MENSAGEM SE TIVER MUITAS FALTAS DE DADOS */}
        {!patient.cpf && !patient.sus_number && !isEditing && (
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-center gap-3">
            <AlertTriangle className="text-amber-500" size={20} />
            <p className="text-xs font-bold text-amber-700">Cadastro incompleto. Clique no lápis acima para adicionar CPF, SUS e outros dados.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default PatientProfile;
