
import React, { useState } from 'react';
import { useBrain } from '../context/BrainContext';
import { UserPlus, User as UserIcon, Trash2, X, ShieldCheck, XCircle, ChevronRight } from 'lucide-react';
import PasswordInput from './common/PasswordInput';
import { hashPassword } from '../utils/security';
import { Permissions } from '../types';

const Users: React.FC = () => {
  const { brain, push, remove, update } = useBrain();
  const [showAdd, setShowAdd] = useState(false);
  
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'ADMIN' | 'NORMAL'>('NORMAL');

  const defaultPermissions: Permissions = {
    dashboard: true, 
    patients: true, 
    records: true, 
    occurrences: true, 
    agenda: true, 
    medication: true, 
    finance: false, // <--- TRAVADO POR PADRÃO
    documents: true, 
    reports: true, 
    settings: false, 
    users: false
  };

  const adminPermissions: Permissions = {
    dashboard: true, patients: true, records: true, occurrences: true, 
    agenda: true, medication: true, finance: true, documents: true, 
    reports: true, settings: true, users: true
  };

  const handleAdd = () => {
    if (!newUsername || !newPassword) return;
    push('users', {
      id: Date.now().toString(),
      username: newUsername,
      password_hash: hashPassword(newPassword),
      role: newRole,
      permissions: newRole === 'ADMIN' ? adminPermissions : defaultPermissions
    });
    setShowAdd(false);
    setNewUsername('');
    setNewPassword('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente excluir este membro da equipe?')) {
      remove('users', id);
    }
  };

  const handleUpdatePermissions = (userId: string, key: keyof Permissions, value: boolean) => {
    const userIndex = brain.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return;
    update(`users.${userIndex}.permissions.${String(key)}`, userId, value);
  };

  const handleUpdateRole = (userId: string, role: 'ADMIN' | 'NORMAL') => {
    const userIndex = brain.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return;
    update(`users.${userIndex}.role`, userId, role);
    if (role === 'ADMIN') {
      update(`users.${userIndex}.permissions`, userId, adminPermissions);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-full overflow-hidden">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-1 lg:px-0">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Equipe VivaPlena</h2>
          <p className="text-xs lg:text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">
            {brain.plan.usage.users} de {brain.plan.limits.users} acessos ativos
          </p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center justify-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/10 w-full sm:w-auto transition-all hover:scale-[1.02]"
        >
          <UserPlus size={16} />
          Adicionar Membro
        </button>
      </header>

      {showAdd && (
        <div className="p-6 lg:p-10 bg-white border border-slate-100 rounded-[32px] animate-in zoom-in-95 duration-300 shadow-2xl relative z-20">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Novo Perfil de Acesso</h3>
            <button onClick={() => setShowAdd(false)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors"><X size={20} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">Username</label>
              <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:bg-white focus:border-emerald-500 transition-all" placeholder="nome.sobrenome" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">Senha Provisória</label>
              <PasswordInput value={newPassword} onChange={setNewPassword} className="rounded-xl py-3.5 px-5" placeholder="********" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">Papel Operacional</label>
              <select value={newRole} onChange={(e) => setNewRole(e.target.value as any)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none cursor-pointer">
                <option value="NORMAL">Colaborador</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <button onClick={handleAdd} className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-900/10">Confirmar</button>
            <button onClick={() => setShowAdd(false)} className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Desistir</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 px-1 lg:px-0">
        {brain.users.map((user) => (
          <div key={user.id} className="p-6 lg:p-8 bg-white/40 hover:bg-white border border-white/80 rounded-[32px] shadow-sm transition-all group min-w-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 min-w-0">
              <div className="flex items-center gap-5 min-w-0">
                <div className="w-14 h-14 bg-white border border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                  <UserIcon size={24} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight truncate group-hover:text-emerald-800 transition-colors">{user.username}</h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                      user.role === 'ADMIN' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                    }`}>
                      {user.role}
                    </span>
                    <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">ID: {user.id.slice(0, 4)}...</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0">
                {!user.username.includes('.adm') && (
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="p-3 text-slate-300 hover:text-rose-600 bg-white border border-slate-50 rounded-xl transition-all shadow-sm"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <div className="w-10 h-10 flex items-center justify-center text-slate-200 group-hover:text-emerald-500 transition-colors">
                  <ChevronRight size={24} />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-50 space-y-3">
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest opacity-60">Permissões de Módulo</p>
               <div className="flex flex-wrap gap-2">
                {Object.entries(user.permissions).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => handleUpdatePermissions(user.id, key as keyof Permissions, !value)}
                    className={`px-3 py-1.5 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                      value 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm' 
                        : 'bg-slate-50 border-slate-50 text-slate-300 grayscale opacity-60'
                    }`}
                  >
                    {value ? <ShieldCheck size={10} /> : <XCircle size={10} />}
                    {key}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Users;
