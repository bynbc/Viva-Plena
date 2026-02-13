import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBrain } from '../context/BrainContext';
import PasswordInput from './common/PasswordInput';
import { LogIn, AlertTriangle, User as UserIcon, Hexagon, Zap } from 'lucide-react';

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const { brain } = useBrain();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Preencha todos os campos.');
      return;
    }

    setLoading(true);
    // O login agora usa hashPassword async internamente no BrainContext
    const result = await login(username.trim(), password.trim());

    if (!result.success) {
      setError('Acesso negado. Verifique suas credenciais.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#000000] flex items-center justify-center p-4 overflow-hidden font-inter selection:bg-indigo-500/30">

      {/* --- BACKGROUND ANIMADO (LIQUID) --- */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Gradientes Fluídos */}
        <div className="absolute top-[-10%] left-[-20%] w-[70vw] h-[70vw] bg-violet-600/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-20%] w-[70vw] h-[70vw] bg-indigo-600/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[70vw] h-[70vw] bg-fuchsia-600/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>

        {/* Noise Texture (Opcional para textura de vidro) */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      {/* --- GLASS CARD --- */}
      <div className="relative w-full max-w-[400px] z-10 perspective-1000">
        <div className="relative group">
          {/* Glow Effect atrás do card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 rounded-[35px] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

          <div className="relative glass bg-black/40 rounded-[32px] p-8 md:p-10 border border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="text-center mb-10 flex flex-col items-center">
              <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 rotate-3 transition-transform group-hover:rotate-6">
                <Hexagon className="text-white fill-white/20" size={32} strokeWidth={2.5} />
              </div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">Viva Plena</h1>
              <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 flex items-center gap-1 opacity-80">
                <Zap size={10} className="fill-indigo-300" /> Sistema Operacional
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Usuário</label>
                <div className="relative group/input">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-indigo-400 transition-colors" size={18} />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium text-white placeholder-slate-500 outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all shadow-inner"
                    placeholder="Seu ID de acesso"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Senha</label>
                <div className="relative group/input">
                  <PasswordInput
                    value={password}
                    onChange={setPassword}
                    className="pl-11 bg-white/5 border-white/10 text-white rounded-2xl py-3.5 focus:border-indigo-500/50 focus:bg-white/10 placeholder-slate-500"
                    placeholder="••••••••"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="w-4 h-4 border-2 border-slate-500 rounded-[4px] group-focus-within/input:border-indigo-400 transition-colors"></div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-rose-300 text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
                  <AlertTriangle size={14} /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden group/btn"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? 'Acessando...' : <>Entrar <LogIn size={16} /></>}
                </span>
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-[10px] text-slate-500 font-medium">
                Problemas de acesso? <span className="text-indigo-400 cursor-pointer hover:underline">Contate o suporte</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
