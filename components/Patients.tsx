import React, { useState } from 'react';
import { User, Search, Plus, Calendar, MoreHorizontal, X } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import EmptyState from './common/EmptyState';

const Patients: React.FC = () => {
  const { brain, setQuickAction, selectPatient } = useBrain();
  const [searchTerm, setSearchTerm] = useState('');

  const activePatients = brain.patients.filter(p => p.status === 'active');

  const normalizedTerm = searchTerm.trim().toLowerCase();
  const filteredPatients = activePatients.filter((p) => {
    if (!normalizedTerm) return true;

    return [p.name, p.diagnosis, p.cpf, p.origin_city]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(normalizedTerm));
  });

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
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

      <div className="bg-white/5 p-2 rounded-2xl shadow-lg border border-white/10 flex items-center backdrop-blur-md group focus-within:bg-white/10 transition-colors">
        <Search className="text-indigo-300 ml-4" size={20} />
        <input
          placeholder="Buscar por nome, diagnóstico, CPF ou cidade..."
          className="w-full p-4 font-bold text-white outline-none bg-transparent placeholder:text-slate-500"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="mr-2 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Limpar busca"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {filteredPatients.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-[32px] p-12 text-center">
          <EmptyState
            title="Nenhum acolhido encontrado"
            description="Tente outro termo de busca ou cadastre um novo paciente."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPatients.map(patient => (
            <div
              key={patient.id}
              onClick={() => selectPatient(patient.id)}
              className="glass p-5 rounded-[28px] border border-white/10 hover:border-indigo-500/50 hover:bg-white/10 transition-all cursor-pointer group relative overflow-hidden bg-white/5 shadow-xl"
            >
              <div className="flex items-center gap-5">
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
                    {patient.diagnosis || 'Sem diagnóstico'}
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
