import React, { useState } from 'react';
import { User, Search, Plus, Calendar, MoreHorizontal, UserSquare2, X } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import EmptyState from './common/EmptyState';

interface PatientsProps {
  onSelectPatient?: (id: string) => void;
}

const Patients: React.FC<PatientsProps> = ({ onSelectPatient }) => {
  const { brain, navigate, setQuickAction, selectPatient } = useBrain();
  const [searchTerm, setSearchTerm] = useState('');

  const activePatients = brain.patients.filter(p => p.status === 'active');

  const filteredPatients = activePatients.filter(p => {
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.cpf && p.cpf.includes(term)) ||
      (p.address_city && p.address_city.toLowerCase().includes(term))
    );
  });

  const handlePatientClick = (id: string) => {
    selectPatient(id);
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-md">Acolhidos</h2>
          <p className="text-sm font-bold text-indigo-200 mt-1">
            Gestão dos {activePatients.length} pacientes ativos na unidade.
          </p>
        </div>
        <button
          onClick={() => setQuickAction('new_patient')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-3 border border-indigo-400/20"
        >
          <Plus size={18} />
          Novo Registro
        </button>
      </div>

      {/* Busca */}
      <div className="bg-white/5 p-2 rounded-2xl shadow-lg border border-white/10 flex items-center backdrop-blur-md group focus-within:bg-white/10 transition-colors">
        <Search className="text-indigo-300 ml-4" size={20} />
        <input
          placeholder="Buscar por nome, CPF ou cidade..."
          className="w-full p-4 font-bold text-white outline-none bg-transparent placeholder:text-slate-500"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="p-2 text-slate-400 hover:text-white transition-colors mr-2">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Lista */}
      {filteredPatients.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-[32px] p-12 text-center">
          <EmptyState title="Nenhum Acolhido Encontrado" description="Tente outro termo ou cadastre um novo." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPatients.map(patient => (
            <div
              key={patient.id}
              onClick={() => handlePatientClick(patient.id)}
              className="glass p-5 rounded-[28px] border border-white/10 hover:border-indigo-500/50 hover:bg-white/10 transition-all cursor-pointer group relative overflow-hidden bg-white/5 shadow-xl"
            >
              <div className="flex items-center gap-5">
                {/* Avatar / Foto */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 shadow-inner overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {patient.photo_url ? (
                    <img src={patient.photo_url} alt={patient.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="text-indigo-300" size={24} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-white text-lg truncate leading-tight group-hover:text-indigo-300 transition-colors">{patient.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 truncate tracking-wide">
                    {patient.diagnosis || 'Sem Diagnóstico'}
                  </p>
                </div>

                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <MoreHorizontal size={16} />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2">
                  <Calendar size={12} className="text-indigo-400" />
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                    Entrada: {patient.entry_date ? new Date(patient.entry_date).toLocaleDateString('pt-BR') : '-'}
                  </span>
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
