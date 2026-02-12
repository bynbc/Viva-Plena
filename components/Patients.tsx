import React, { useState } from 'react';
import { User, Search, Plus, Calendar, MapPin, MoreHorizontal } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import EmptyState from './common/EmptyState';

interface PatientsProps {
  onSelectPatient?: (id: string) => void;
}

const Patients: React.FC<PatientsProps> = ({ onSelectPatient }) => {
  const { brain, navigate, setQuickAction, selectPatient } = useBrain();
  const [searchTerm, setSearchTerm] = useState('');

  const activePatients = brain.patients.filter(p => p.status === 'active');
  const filteredPatients = activePatients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePatientClick = (id: string) => {
    selectPatient(id);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Acolhidos</h2>
          <p className="text-sm font-bold text-slate-400">
            {activePatients.length} ativos na casa
          </p>
        </div>
        <button
          onClick={() => setQuickAction('new_patient')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Acolhido
        </button>
      </div>

      {/* Busca */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center">
        <Search className="text-slate-400 ml-3" size={20} />
        <input
          placeholder="Buscar acolhido..."
          className="w-full p-3 font-bold text-slate-700 outline-none bg-transparent placeholder:text-slate-300"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Lista */}
      {filteredPatients.length === 0 ? (
        <EmptyState title="Nenhum Acolhido" description="Use o botão acima para cadastrar." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPatients.map(patient => (
            <div
              key={patient.id}
              onClick={() => handlePatientClick(patient.id)}
              className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="flex items-center gap-4">
                {/* Avatar / Foto */}
                <div className="w-16 h-16 rounded-2xl bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                  {patient.photo_url ? (
                    <img src={patient.photo_url} alt={patient.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <User size={24} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-800 text-lg truncate">{patient.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase mt-0.5 truncate">
                    {patient.diagnosis || 'Sem Diagnóstico'}
                  </p>
                </div>

                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <MoreHorizontal size={18} />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-600">
                    {patient.entry_date ? new Date(patient.entry_date).toLocaleDateString('pt-BR') : '-'}
                  </span>
                </div>
                {/* Removemos o Quarto (Room) pois não existe mais no banco */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Patients;
