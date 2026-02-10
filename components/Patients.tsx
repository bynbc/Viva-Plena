import React, { useState } from 'react';
import { Search, Plus, User, Trash2, Edit2, MapPin } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import EmptyState from './common/EmptyState';

const Patients: React.FC = () => {
  const { brain, setQuickAction, remove, selectPatient } = useBrain();
  const [searchTerm, setSearchTerm] = useState('');

  const patients = (brain.patients || []).filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.cpf?.includes(searchTerm)
  );

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation(); // Impede que abra o perfil ao clicar na lixeira

    if (!confirm(`Tem certeza que deseja excluir o paciente ${name}? Todos os dados serão apagados.`)) return;

    await remove('patients', id);
  };

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    selectPatient(id);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Pacientes</h1>
          <p className="text-slate-500 font-medium">Gestão de acolhidos.</p>
        </div>
        <button onClick={() => setQuickAction('new_patient')} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 w-full md:w-auto justify-center">
          <Plus size={20} />
          <span className="text-xs uppercase tracking-widest">Novo Paciente</span>
        </button>
      </header>

      {/* Barra de Busca */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nome ou CPF..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all shadow-sm"
        />
      </div>

      {patients.length === 0 ? (
        <EmptyState icon={User} title="Nenhum paciente" description="Cadastre o primeiro acolhido." action={{ label: 'Cadastrar', onClick: () => setQuickAction('new_patient') }} />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {patients.map(patient => (
            <div 
              key={patient.id} 
              onClick={() => selectPatient(patient.id)}
              className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-lg md:text-xl shrink-0">
                    {patient.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    {/* Truncate garante que o texto não atropele o botão */}
                    <h3 className="text-base md:text-lg font-black text-slate-900 truncate pr-2">{patient.name}</h3>
                    <div className="flex flex-wrap gap-2 md:gap-4 text-slate-500 mt-1">
                      <div className="flex items-center gap-1 text-[10px] md:text-xs font-bold uppercase tracking-wide">
                         <div className={`w-2 h-2 rounded-full ${patient.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                         {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                      </div>
                      {patient.room && (
                        <div className="flex items-center gap-1 text-[10px] md:text-xs font-bold uppercase tracking-wide truncate">
                          <MapPin size={12} /> {patient.room}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* BOTÕES DE AÇÃO VISÍVEIS */}
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={(e) => handleEdit(e, patient.id)} className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={(e) => handleDelete(e, patient.id, patient.name)} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Patients;
