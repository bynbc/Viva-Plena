import React, { useState } from 'react';
import { UserPlus, Shield, Mail, Save, X } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import MobileModal from './common/MobileModal';
import PasswordInput from './common/PasswordInput';
import { hashPassword } from '../utils/security'; // Importa o hash

const NewUserModal: React.FC = () => {
  const { setQuickAction, push, addToast, brain } = useBrain();
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'NORMAL'>('NORMAL');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return addToast("Nome e Senha são obrigatórios", "warning");

    setLoading(true);
    try {
      // Cria o hash da senha igual ao banco
      const passwordHash = hashPassword(password);

      await push('app_users', { // <--- CORRIGIDO: tabela 'app_users'
        clinic_id: brain.session.clinicId,
        username,
        email,
        password_hash: passwordHash, // <--- CORRIGIDO: envia o hash
        role,
        is_active: true,
        created_at: new Date().toISOString()
      });
      
      addToast("Usuário cadastrado com sucesso!", "success");
      setQuickAction(null);
    } catch (err) {
      console.error(err);
      addToast("Erro ao criar usuário.", "error");
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex gap-3 w-full">
      <button type="button" onClick={() => setQuickAction(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-xs uppercase text-slate-500 hover:bg-slate-200 transition-colors">Cancelar</button>
      <button type="submit" form="new-user-form" disabled={loading} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase shadow-lg hover:bg-slate-800 flex items-center justify-center gap-2">
        {loading ? 'Salvando...' : <><Save size={16}/> Criar Acesso</>}
      </button>
    </div>
  );

  return (
    <MobileModal title="Novo Usuário" subtitle="Adicionar membro à equipe" icon={UserPlus} iconColor="bg-slate-900" onClose={() => setQuickAction(null)} footer={footer}>
      <form id="new-user-form" onSubmit={handleSave} className="space-y-4">
        
        <div>
           <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nome de Usuário</label>
           <input 
             value={username} 
             onChange={e => setUsername(e.target.value)} 
             className="w-full p-4 bg-slate-50 rounded-xl font-bold border border-slate-100 outline-none focus:border-indigo-500" 
             placeholder="Ex: joao.silva" 
             autoFocus
           />
        </div>

        <div>
           <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1"><Mail size={10}/> E-mail (Opcional)</label>
           <input 
             type="email"
             value={email} 
             onChange={e => setEmail(e.target.value)} 
             className="w-full p-4 bg-slate-50 rounded-xl font-bold border border-slate-100 outline-none focus:border-indigo-500" 
             placeholder="joao@vivaplena.com" 
           />
        </div>

        <div>
           <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Senha de Acesso</label>
           <PasswordInput 
             value={password}
             onChange={setPassword}
             placeholder="Mínimo 6 caracteres"
           />
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
           <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1 mb-2"><Shield size={10}/> Nível de Permissão</label>
           <div className="grid grid-cols-2 gap-3">
              <button 
                type="button" 
                onClick={() => setRole('NORMAL')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${role === 'NORMAL' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-400'}`}
              >
                 <span className="text-xs font-black uppercase">Colaborador</span>
                 <span className="text-[9px] font-medium text-center leading-tight">Acesso restrito a funções básicas.</span>
              </button>
              
              <button 
                type="button" 
                onClick={() => setRole('ADMIN')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${role === 'ADMIN' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-400'}`}
              >
                 <span className="text-xs font-black uppercase">Administrador</span>
                 <span className="text-[9px] font-medium text-center leading-tight">Acesso total ao sistema.</span>
              </button>
           </div>
        </div>

      </form>
    </MobileModal>
  );
};

export default NewUserModal;
