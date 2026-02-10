import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, User, Calendar, MapPin, Phone, Activity, 
  FileText, AlertTriangle, Pill, Clock, Edit2, Shield 
} from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import { Patient } from '../types';

const PatientProfile: React.FC = () => {
  const { brain, navigate, setQuickAction } = useBrain(); // Correção: navigate no lugar de setUI
  const [activeTab, setActiveTab] = useState<'overview' | 'records' | 'history'>('overview');

  const patient = brain.patients.find(p => p.id === brain.ui.selectedPatientId);

  // Se não achar paciente (ex: refresh), volta pra lista
  if (!patient) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 mb-4">Paciente não encontrado.</p>
        <button onClick={() => navigate('patients')} className="text-indigo-600 font-bold">Voltar</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4">
      
      {/* HEADER NAVEGAÇÃO */}
      <button 
        onClick={() => navigate('patients')} // Correção aqui
        className="flex items-center gap-2 text-slate-400 hover:text-slate-800 transition-colors font-bold text-sm"
      >
        <ArrowLeft size={18} /> Voltar para Lista
      </button>

      {/* CARTÃO PRINCIPAL */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] -mr-10 -mt-10 z-0" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-24 h-24 bg-indigo-100 rounded-[24px] flex items-center justify-center text-indigo-600 shadow-inner shrink-0">
             <User size={40} />
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{patient.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                    patient.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {patient.status === 'active' ? 'Em Acolhimento' : 'Inativo'}
                  </span>
                  {patient.paymentType && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600">
                      {patient.paymentType}
                    </span>
                  )}
                </div>
              </div>
              <button className="bg-slate-50 text-slate-600 px-4 py-2 rounded-xl font-bold text-xs uppercase hover:bg-slate-100 transition-colors flex items-center gap-2">
                <Edit2 size={14} /> Editar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
               <div className="flex items-center gap-3 text-slate-600">
                 <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center"><Calendar size={14} /></div>
                 <div>
                   <p className="text-[10px] font-black uppercase text-slate-400">Admissão</p>
                   <p className="font-bold text-sm">{patient.admissionDate ? new Date(patient.admissionDate).toLocaleDateString('pt-BR') : '-'}</p>
                 </div>
               </div>
               <div className="flex items-center gap-3 text-slate-600">
                 <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center"><Phone size={14} /></div>
                 <div>
                   <p className="text-[10px] font-black uppercase text-slate-400">Contato Família</p>
                   <p className="font-bold text-sm">{patient.familyContact || '-'}</p>
                 </div>
               </div>
               <div className="flex items-center gap-3 text-slate-600">
                 <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center"><Shield size={14} /></div>
                 <div>
                   <p className="text-[10px] font-black uppercase text-slate-400">Convênio/SUS</p>
                   <p className="font-bold text-sm">{patient.insuranceName || patient.sus_number || 'Particular'}</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTEÚDO TABS (Simplificado para o exemplo) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Últimas Evoluções */}
         <div className="bg-white p-6 rounded-[32px] border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
               <Activity className="text-indigo-600" size={18} /> Últimas Evoluções
            </h3>
            <div className="space-y-3">
               <p className="text-slate-400 text-sm">Use o módulo "Prontuário" para ver detalhes.</p>
               <button onClick={() => navigate('health-records')} className="text-indigo-600 text-xs font-black uppercase underline">
                  Ir para Prontuário
               </button>
            </div>
         </div>

         {/* PTI Resumo */}
         <div className="bg-white p-6 rounded-[32px] border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
               <Activity className="text-emerald-600" size={18} /> Plano Terapêutico (PTI)
            </h3>
            <button onClick={() => navigate('pti')} className="w-full py-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs uppercase hover:bg-emerald-100">
               Ver Metas e Terapias
            </button>
         </div>
      </div>

    </div>
  );
};

export default PatientProfile;
