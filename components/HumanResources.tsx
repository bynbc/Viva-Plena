import React, { useState } from 'react';
import { 
  Briefcase, Users, UserPlus, Shield, Clock, 
  CheckCircle2, AlertCircle, Search, Trash2 
} from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import { AppUser } from '../types';
import MobileModal from './common/MobileModal';

const HumanResources: React.FC = () => {
  const { brain, push, addToast, refreshData } = useBrain();
  
  // Estado
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Formulário
  const [formData, setFormData] = useState({
    username: '',
    email: '', // Nota: Em produção, isso vincularia ao Supabase Auth
    password: '',
    job_title: 'Monitor',
    shift: 'Diurno',
    role: 'NORMAL' as 'ADMIN' | 'NORMAL'
  });

  // 1. FILTRO DE USUÁRIOS
  const filteredUsers = brain.users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.job_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. AÇÕES
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      addToast("Preencha nome e senha.", "warning");
      return;
    }

    setLoading(true);
    try {
      // NOTA: Em um sistema real Supabase, aqui criaríamos o usuário no Auth.
      // Como estamos no frontend, vamos criar o registro na tabela `app_users`.
      // A senha aqui é salva apenas como referência visual/hash simples (NÃO SEGURO para produção real bancária).
      
      const payload = {
        clinic_id: brain.session.clinicId,
        username: formData.username,
        role: formData.role,
        job_title: formData.job_title,
        shift: formData.shift,
        is_active: true,
        // password_hash: btoa(formData.password) // Simulação de hash
      };

      await push('app_users', payload);
      
      addToast("Colaborador cadastrado!", "success");
      setIsModalOpen(false);
      setFormData({ 
        username: '', email: '', password: '', 
        job_title: 'Monitor', shift: 'Diurno', role: 'NORMAL' 
      });
      refreshData();
    } catch (error) {
      console.error(error);
      addToast("Erro ao cadastrar equipe.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* CABEÇALHO */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Briefcase className="text-indigo-600" size={32} />
            Recursos Humanos
          </h1>
          <p className="text-lg text-slate-500 font-medium">Gestão de equipe, turnos e acessos.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all"
        >
          <UserPlus size={20} />
          Novo Colaborador
        </button>
      </header>

      {/* BUSCA */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar colaborador por nome ou cargo..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl font-medium focus:border-indigo-500 outline-none"
        />
      </div>

      {/* LISTA DE EQUIPE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map(user => (
          <div key={user.id} className="bg-white p-5 rounded-[24px] border border-slate-100 hover:border-indigo-200 transition-all shadow-sm group relative">
            
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-md
                  ${user.role === 'ADMIN' ? 'bg-slate-900' : 'bg-indigo-500'}
                `}>
                  {user.username.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">{user.username}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md
                      ${user.role === 'ADMIN' ? 'bg-slate-100 text-slate-600' : 'bg-indigo-50 text-indigo-600'}
                    `}>
                      {user.role === 'ADMIN' ? 'Administrador' : 'Acesso Padrão'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Status Indicator */}
              <div className={`w-3 h-3 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} title={user.is_active ? "Ativo" : "Inativo"} />
            </div>

            <div className="space-y-2 mt-4 pt-4 border-t border-slate-50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 font-medium flex items-center gap-2"><Briefcase size={14} /> Cargo</span>
                <span className="font-bold text-slate-700">{user.job_title || 'Não definido'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 font-medium flex items-center gap-2"><Clock size={14} /> Turno</span>
                <span className="font-bold text-slate-700">{user.shift || 'Geral'}</span>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* MODAL NOVO COLABORADOR */}
      {isModalOpen && (
        <MobileModal
          title="Novo Colaborador"
          subtitle="Cadastro de Equipe"
          icon={UserPlus}
          iconColor="bg-indigo-600"
          onClose={() => setIsModalOpen(false)}
          footer={
            <div className="flex gap-3 w-full">
               <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold text-xs uppercase">Cancelar</button>
               <button onClick={handleSave} disabled={loading} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase hover:bg-indigo-700 shadow-lg">
                 {loading ? 'Cadastrando...' : 'Criar Acesso'}
               </button>
            </div>
          }
        >
          <div className="space-y-4">
            
            {/* Nome e Senha */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Nome de Usuário</label>
              <input 
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
                className="w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 focus:border-indigo-500 outline-none"
                placeholder="Ex: Dr. Silva, Monitor João..."
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Senha Temporária</label>
              <input 
                type="password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 focus:border-indigo-500 outline-none"
                placeholder="******"
              />
            </div>

            {/* Cargo e Turno */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Cargo / Função</label>
                <select 
                  value={formData.job_title}
                  onChange={e => setFormData({...formData, job_title: e.target.value})}
                  className="w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none"
                >
                  <option>Monitor</option>
                  <option>Psicólogo(a)</option>
                  <option>Médico(a)</option>
                  <option>Enfermeiro(a)</option>
                  <option>Assistente Social</option>
                  <option>Administrativo</option>
                  <option>Cozinha/Limpeza</option>
                </select>
              </div>
              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase">Turno</label>
                 <select 
                  value={formData.shift}
                  onChange={e => setFormData({...formData, shift: e.target.value})}
                  className="w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none"
                >
                  <option>Diurno</option>
                  <option>Noturno</option>
                  <option>Plantão 12x36</option>
                  <option>Integral</option>
                </select>
              </div>
            </div>

            {/* Permissão */}
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
              <label className="text-xs font-bold text-amber-700 uppercase flex items-center gap-2 mb-2">
                <Shield size={14} /> Nível de Permissão
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="role" 
                    checked={formData.role === 'NORMAL'} 
                    onChange={() => setFormData({...formData, role: 'NORMAL'})}
                    className="accent-amber-600 w-4 h-4"
                  />
                  <span className="text-sm font-bold text-slate-700">Padrão</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="role" 
                    checked={formData.role === 'ADMIN'} 
                    onChange={() => setFormData({...formData, role: 'ADMIN'})}
                    className="accent-amber-600 w-4 h-4"
                  />
                  <span className="text-sm font-bold text-slate-700">Administrador (Total)</span>
                </label>
              </div>
              <p className="text-[10px] text-amber-600/80 mt-2 leading-tight">
                * Administradores podem excluir dados e gerenciar financeiro. Padrão apenas registra evoluções e ocorrências.
              </p>
            </div>

          </div>
        </MobileModal>
      )}

    </div>
  );
};

export default HumanResources;
