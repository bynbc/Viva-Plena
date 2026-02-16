import React, { useState } from 'react';
import { Shield, Mail, Trash2, Edit2, UserPlus, Lock, CheckCircle2 } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import PasswordInput from './common/PasswordInput';
import { hashPassword } from '../utils/security'; // Importa hash

const Users: React.FC = () => {
  const { brain, update, remove, addToast, setQuickAction } = useBrain();
  const [editingUser, setEditingUser] = useState<any>(null);

  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'ADMIN' | 'NORMAL'>('NORMAL');
  const [newPassword, setNewPassword] = useState('');

  const handleDelete = async (id: string, username: string) => {
    if (confirm(`Tem certeza que deseja remover o acesso de ${username}?`)) {
      try {
        await remove('app_users', id); // <--- CORRIGIDO: tabela 'app_users'
        addToast('Usuário removido com sucesso.', 'success');
      } catch (error) {
        addToast('Erro ao remover usuário.', 'error');
      }
    }
  };

  const startEdit = (user: any) => {
    setEditingUser(user);
    setEditName(user.username);
    setEditEmail(user.email || '');
    setEditRole(user.role === 'ADMIN' ? 'ADMIN' : 'NORMAL');
    setNewPassword('');
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    try {
      const payload: any = {
        username: editName,
        email: editEmail,
        role: editRole
      };

      // Só atualiza a senha se foi digitada
      if (newPassword.trim()) {
        payload.password_hash = await hashPassword(newPassword);
      }

      await update('app_users', editingUser.id, payload); // <--- CORRIGIDO: tabela 'app_users'

      addToast('Dados do usuário atualizados!', 'success');
      setEditingUser(null);
    } catch (error) {
      addToast('Erro ao atualizar.', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md">Equipe & Acessos</h1>
          <p className="text-indigo-200 font-medium">Gerencie quem pode acessar o sistema.</p>
        </div>
        <button
          onClick={() => setQuickAction('new_user')}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95"
        >
          <UserPlus size={20} />
          Novo Usuário
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brain.users.map(user => (
          <div key={user.id} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className={`absolute top-0 right-0 p-4 opacity-10 ${user.role === 'ADMIN' ? 'text-indigo-600' : 'text-slate-400'}`}>
              <Shield size={60} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black uppercase shadow-sm ${user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                  {user.username.substring(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg leading-tight">{user.username}</h3>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md inline-block mt-1 ${user.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500'
                    }`}>
                    {user.role === 'ADMIN' ? 'Administrador' : 'Colaborador'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mt-4 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Mail size={14} className="text-slate-300" />
                  <span className="truncate">{user.email || 'Sem e-mail cadastrado'}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => startEdit(user)}
                  className="flex-1 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold uppercase hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 size={14} /> Editar
                </button>
                <button
                  onClick={() => handleDelete(user.id, user.username)}
                  className="flex-1 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold uppercase hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} /> Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE EDIÇÃO */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500"></div>

            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Edit2 size={24} className="text-indigo-600" /> Editar Acesso
            </h2>

            <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Nome de Usuário</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-4 bg-slate-50 text-slate-900 rounded-2xl font-bold border border-slate-200 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">E-mail Corporativo</label>
                <input
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-4 bg-slate-50 text-slate-900 rounded-2xl font-bold border border-slate-200 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  placeholder="exemplo@vivaplena.com"
                />
              </div>

              <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100">
                <label className="text-[10px] font-black text-amber-600 uppercase ml-1 flex items-center gap-1 mb-2">
                  <Lock size={12} /> Redefinir Senha
                </label>
                <PasswordInput
                  value={newPassword}
                  onChange={setNewPassword}
                  placeholder="Nova senha (opcional)"
                />
                <p className="text-[10px] text-amber-700/60 mt-2 font-bold leading-tight">
                  Deixe em branco para manter a senha atual.
                </p>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Nível de Permissão</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditRole('NORMAL')}
                    className={`p-3 rounded-xl border-2 text-xs font-black uppercase transition-all ${editRole === 'NORMAL' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-400'}`}
                  >
                    Colaborador
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditRole('ADMIN')}
                    className={`p-3 rounded-xl border-2 text-xs font-black uppercase transition-all ${editRole === 'ADMIN' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-400'}`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100">
                <button onClick={() => setEditingUser(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-500 text-xs uppercase hover:bg-slate-200 transition-colors">Cancelar</button>
                <button onClick={handleSaveEdit} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg text-xs uppercase hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} /> Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
