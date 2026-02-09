import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBrain } from '../context/BrainContext';
import PasswordInput from './common/PasswordInput';
import { LogIn, AlertTriangle, Database, ShieldCheck, User as UserIcon, Lock } from 'lucide-react';

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const { brain } = useBrain();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [diagnosticCode, setDiagnosticCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDiagnosticCode('');
    
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    const result = await login(cleanUsername, cleanPassword);
    
    if (!result.success) {
      if (result.errorCode === 'ENV_INVALID') {
        setError('Configuração do servidor (ENV) ausente ou inválida.');
      } else if (result.errorCode === 'SUPABASE_CONN_ERROR') {
        setError('Erro de conexão com o banco. Verifique o console.');
      } else {
        setError('Credenciais inválidas ou acesso desativado.');
      }
      
      if (result.errorCode) {
        setDiagnosticCode(result.errorCode);
      }
    }
    setLoading(false);
  };

  const renderDiagnosticMap = () => {
    if (!diagnosticCode) return null;

    const messages: Record<string, { title: string; hint: string; icon: any }> = {
      'ENV_INVALID': {
        title: 'Variáveis de Ambiente',
        hint: 'O app não encontrou VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY no Vercel.',
        icon: AlertTriangle
      },
      'USER_NOT_FOUND': { 
        title: 'Usuário Inexistente', 
        hint: 'O nome de usuário não foi encontrado na tabela app_users.',
        icon: UserIcon
      },
      'PASSWORD_MISMATCH': { 
        title: 'Senha Incorreta', 
        hint: 'A senha não coincide com o valor armazenado no banco.',
        icon: Database
      },
      'NO_CLINIC_MEMBERSHIP': { 
        title: 'Sem Vínculo', 
        hint: 'Usuário ok, mas falta registro na tabela clinic_users.',
        icon: ShieldCheck
      },
      'SUPABASE_CONN_ERROR': {
        title: 'Falha de Hostname',
        hint: 'A URL do Supabase não pôde ser resolvida por erro de DNS ou caracteres ocultos.',
        icon: AlertTriangle
      }
    };

    const info = messages[diagnosticCode] || { title: 'Erro Operacional', hint: 'Verifique os logs do console para detalhes técnicos.', icon: AlertTriangle };
    const Icon = info.icon;

    return (
      <div className="mt-8 p-6 bg-amber-500/10 border border-amber-500/20 rounded-[28px] animate-in slide-in-from-top-4 duration-500 backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
            <Icon size={20} />
          </div>
          <div>
            <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-widest mb-1">Mapeamento: {diagnosticCode}</h4>
            <p className="text-white text-xs font-bold leading-tight mb-2">{info.title}</p>
            <p className="text-white/60 text-[10px] leading-relaxed italic">{info.hint}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#020817] flex items-center justify-center p-4 overflow-y-auto overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#1e293b]/20 rotate-45 transform translate-x-[-20%]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#1e293b]/20 rotate-45 transform translate-x-[20%]"></div>
      </div>

      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
        <div className="glass bg-white/[0.03] rounded-[40px] p-8 lg:p-12 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          
          <div className="text-center mb-10 relative z-10">
            {/* ÍCONE Z */}
            <div className="w-20 h-20 bg-emerald-600 rounded-[30px] flex items-center justify-center text-white font-black text-4xl shadow-lg mx-auto mb-6 border border-white/10">
              Z
            </div>
            
            {/* NOME NOVO */}
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-1">Vida Plena</h1>
            <p className="text-emerald-500 font-bold uppercase tracking-[0.25em] text-[10px] opacity-90">
              SISTEMA OPERACIONAL
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-5">
                USUÁRIO
              </label>
              <div className="relative">
                <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Seu identificador"
                  className="w-full pl-14 pr-8 py-4 bg-white/[0.04] border border-white/10 rounded-full text-white text-sm focus:outline-none focus:bg-white/[0.08] focus:border-emerald-500/50 transition-all font-medium placeholder:text-white/20 shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-5">
                SENHA
              </label>
              <PasswordInput 
                value={password} 
                onChange={setPassword} 
                placeholder="••••••••" 
                className="bg-white/[0.04] border-white/10 text-white rounded-full py-4 px-8 text-sm focus:bg-white/[0.08] placeholder:text-white/20 focus:border-emerald-500/50"
              />
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-rose-400 text-[10px] font-bold uppercase tracking-widest text-center animate-in slide-in-from-top-2 backdrop-blur-md flex items-center justify-center gap-2">
                <AlertTriangle size={14} />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-full font-black text-sm uppercase tracking-widest interactive shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-3 mt-4 transition-all duration-300 active:scale-[0.98]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>ACESSAR SISTEMA</span>
                    <LogIn size={18} />
                  </>
                )}
              </button>

              {brain.ui.debugMode && renderDiagnosticMap()}
            </div>
          </form>
          
          <div className="mt-8 text-center opacity-30 hover:opacity-50 transition-opacity">
             <p className="text-[9px] font-bold text-white uppercase tracking-widest">© 2025 Vida Plena S.O.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
