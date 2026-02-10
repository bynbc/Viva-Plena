import React, { useState } from 'react';
import { Save, Lock, Bell, Building } from 'lucide-react';
import { useBrain } from '../context/BrainContext';

const Settings: React.FC = () => {
  const { brain, addToast } = useBrain();
  const [activeTab, setActiveTab] = useState<'organization' | 'security'>('organization');

  const handleSave = () => {
    addToast("Configurações salvas com sucesso!", "success");
  };

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Configurações</h1>
        <p className="text-lg text-slate-500 font-medium">Ajustes do sistema.</p>
      </header>

      <div className="flex gap-4 border-b border-slate-200 pb-1">
        <button 
          onClick={() => setActiveTab('organization')}
          className={`pb-3 px-2 font-bold text-sm ${activeTab === 'organization' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}
        >
          Organização
        </button>
        <button 
           onClick={() => setActiveTab('security')}
           className={`pb-3 px-2 font-bold text-sm ${activeTab === 'security' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}
        >
          Segurança
        </button>
      </div>

      <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm max-w-2xl">
        {activeTab === 'organization' ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Nome da Unidade</label>
              <input disabled value="Unidade Principal - Vida Plena" className="w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 font-bold" />
            </div>
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase">CNPJ</label>
               <input disabled value="00.000.000/0001-00" className="w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 font-bold" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                   <Lock size={20} className="text-slate-400" />
                   <span className="font-bold text-slate-700">Autenticação de Dois Fatores</span>
                </div>
                <div className="w-10 h-5 bg-slate-200 rounded-full relative"><div className="w-5 h-5 bg-white rounded-full shadow-sm absolute left-0" /></div>
             </div>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
          <button onClick={handleSave} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700">
            <Save size={18} /> Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
