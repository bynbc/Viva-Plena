import React, { useState } from 'react';
import { useBrain } from '../context/BrainContext';
import { UserPlus, User as UserIcon, Trash2, X, ShieldCheck, XCircle, ChevronRight, Key, Save, Eye, EyeOff } from 'lucide-react';
import { hashPassword } from '../utils/security';
import { Permissions, AppUser } from '../types';

const Users: React.FC = () => {
  const { brain, push, remove, update, addToast } = useBrain();
  
  // MODAL STATES
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // FORM DATA
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'NORMAL' as 'ADMIN' | 'NORMAL'
  });
  
  // VISUALIZAR SENHA
  const [showPassword, setShowPassword] = useState(false);

  // PERMISSÕES PADRÃO
  const defaultPermissions: Permissions = {
    dashboard: true, patients: true, records: true, occurrences: true, 
    agenda: true, medication: true, finance: false, documents: true, 
    reports: true, settings: false, users: false
  };

  const adminPermissions: Permissions = {
    dashboard: true, patients: true, records: true, occurrences: true, 
    agenda: true, medication: true, finance: true, documents: true, 
    reports: true, settings: true, users: true
  };

  // --- AÇÕES ---

  const openCreate = () => {
    setFormData({ username: '', password: '', role: 'NORMAL' });
    setModalMode('create');
    setEditingId(null);
  };

  const openEdit = (user: AppUser) => {
    setFormData({ username: user.username, password: '', role: user.role });
    setEditingId(user.id);
    setModalMode('edit');
  };

  const handleSave = async () => {
    // VALIDAÇÃO BÁSICA
    if (!formData.username) return addToast('O nome de usuário é obrigatório.', 'error');
    if (modalMode === 'create' && !formData.password) return addToast('Defina uma senha inicial.', 'error');

    try {
      if (modalMode === 'create') {
        await push('users', {
          id: Date.now().toString(),
          username: formData.username,
          password_hash: hashPassword(formData.password),
          role: formData.role,
          permissions: formData.role === 'ADMIN' ? adminPermissions : defaultPermissions
        });
        addToast('Usuário criado com sucesso!', 'success');
      } else if (modalMode === 'edit' && editingId) {
        // Atualiza Cargo
        await update('users', editingId, { role: formData.role });
        
        // Atualiza Senha (se digitou algo)
        if (formData.password) {
           await update('users', editingId, { password_hash: hashPassword(formData.password) });
           addToast('Senha e dados atualizados!', 'success');
        } else {
           addToast('Dados atualizados (senha mantida).', 'success');
        }
      }
      setModalMode(null);
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Erro ao salvar.', 'error');
    }
  };

  const handleDelete = (id: string, username: string) => {
    if (confirm(`ATENÇÃO: Excluir permanentemente "${username}"?`)) {
      remove('users', id);
    }
  };

  const handleUpdatePermissions = (userId: string, key: keyof Permissions, value: boolean) => {
    const userIndex = brain.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return;
    update(`users.${userIndex}.permissions.${String(key)}`, userId, value);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-full overflow-hidden pb-20">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-1 lg:px-0">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Equipe VivaPlena</h2>
          <p className="text-xs lg:text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">
            Gestão de Acessos e Permissões
          </p>
        </div>
        <button 
          onClick={openCreate}
          className="flex items-center justify-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/10 w-full sm:w-auto transition-all hover:scale-[1.02]"
        >
          <UserPlus size={16} />
          Adicionar Membro
        </button>
      </header>

      {/* --- MODAL UNIFICADO (CRIAR / EDITAR) --- */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg p-8 rounded-[32px] shadow-2xl animate-in zoom-in-95 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
            
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {modalMode === 'create' ? 'Novo Colaborador' : 'Editar Acesso'}
                </h3>
                {modalMode === 'edit' && <p className="text-xs text-slate-400 font-bold mt-1">Alterando: {formData.username}</p>}
              </div>
              <button onClick={() => setModalMode(null)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors bg-slate-50 rounded-full"><X size={20} /></button>
            </div>

            <div className="space-y-6">
              {/* CAMPO: USUÁRIO (Apenas leitura na edição para evitar bugs de ID, mas pode mudar se quiser) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Login (Username)</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    disabled={modalMode === 'edit'} // Bloqueia mudança de nome na edição pra não perder histórico
                    type="text" 
                    value={formData.username} 
                    onChange={(e) => setFormData({...formData, username: e.target.value})} 
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:bg-white focus:border-emerald-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed" 
                    placeholder="nome.sobrenome" 
                  />
                </div>
              </div>

              {/* CAMPO: SENHA COM OLHO */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
                  {modalMode === 'create' ? 'Definir Senha *' : 'Nova Senha (Opcional)'}
                </label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:bg-white focus:border-emerald-500 transition-all placeholder:font-normal" 
                    placeholder={modalMode === 'edit' ? "Deixe em branco para manter a atual" : "••••••••"} 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {modalMode === 'edit' && <p className="text-[10px] text-slate-400 pl-2">Preencha apenas se quiser trocar a senha dele.</p>}
              </div>

              {/* CAMPO: CARGO */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Nível de Acesso</label>
                <select 
                  value={formData.role} 
                  onChange={(e) => setFormData({...formData, role: e.target.value as any})} 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none cursor-pointer focus:border-emerald-500"
                >
                  <option value="NORMAL">Colaborador (Restrito)</option>
                  <option value="ADMIN">Administrador (Total)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button onClick={handleSave} className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 transition-all active:scale-95">
                {modalMode === 'create' ? 'Criar Acesso' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- LISTA DE USUÁRIOS --- */}
      <div className="grid grid-cols-1 gap-4 px-1 lg:px-0">
        {brain.users.map((user) => (
          <div key={user.id} className="p-6 lg:p-8 bg-white/40 hover:bg-white border border-white/80 rounded-[32px] shadow-sm transition-all group min-w-0 relative overflow-hidden">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 min-w-0 relative z-10">
              {/* Info do Usuário */}
              <div className="flex items-center gap-5 min-w-0 cursor-pointer" onClick={() => openEdit(user)}>
                <div className={`w-14 h-14 border rounded-2xl flex items-center justify-center shadow-sm shrink-0 transition-colors ${
                  user.role === 'ADMIN' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-white border-slate-100 text-slate-400'
                }`}>
                  <UserIcon size={24} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight truncate group-hover:text-emerald-800 transition-colors">
                    {user.username}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                      user.role === 'ADMIN' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {user.role === 'ADMIN' ? 'Administrador' : 'Colaborador'}
                    </span>
                    <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">ID: {user.id.slice(0, 4)}...</span>
                  </div>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0">
                {!user.username.includes('.adm') && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(user.id, user.username); }}
                    className="p-3 text-slate-400 hover:text-rose-600 bg-white border border-slate-100 hover:border-rose-200 rounded-xl transition-all shadow-sm"
                    title="Excluir Usuário"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                
                {/* SETA AGORA É UM BOTÃO DE EDITAR */}
                <button 
                  onClick={() => openEdit(user)}
                  className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>

            {/* Permissões (Visuais apenas, edição via modal se quiser expandir no futuro) */}
            <div className="mt-6 pt-6 border-t border-slate-50 space-y-3">
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest opacity-60">Permissões Ativas</p>
               <div className="flex flex-wrap gap-2">
                {Object.entries(user.permissions).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => handleUpdatePermissions(user.id, key as keyof Permissions, !value)}
                    className={`px-3 py-1.5 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer ${
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
