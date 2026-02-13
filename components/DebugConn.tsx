import React, { useState } from 'react';
import { useBrain } from '../context/BrainContext';
import { supabase } from '../lib/supabaseClient';
import { AlertCircle, CheckCircle, Database, Shield, Server, Play, Copy } from 'lucide-react';

const DebugConn: React.FC = () => {
    const { brain, addToast } = useBrain();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const addLog = (step: string, status: 'success' | 'error' | 'info', message: string, data?: any) => {
        setLogs(prev => [...prev, { id: Math.random(), time: new Date().toLocaleTimeString(), step, status, message, data }]);
    };

    const copyLogs = () => {
        const text = logs.map(l => `[${l.time}] ${l.step} (${l.status}): ${l.message} ${l.data ? JSON.stringify(l.data) : ''}`).join('\n');
        navigator.clipboard.writeText(text);
        addToast("Logs copiados!", 'success');
    };

    const runDiagnostics = async () => {
        setLogs([]);
        setLoading(true);
        addLog('INIT', 'info', 'Iniciando diagnóstico...');

        try {
            // 1. CHECAR ENV
            const sbUrl = import.meta.env.VITE_SUPABASE_URL;
            const sbKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            if (!sbUrl) addLog('ENV', 'error', 'VITE_SUPABASE_URL não definido!');
            else addLog('ENV', 'success', `VITE_SUPABASE_URL detectado: ${sbUrl.substring(0, 15)}...`);

            if (!sbKey) addLog('ENV', 'error', 'VITE_SUPABASE_ANON_KEY não definido!');
            else addLog('ENV', 'success', 'VITE_SUPABASE_ANON_KEY está preenchido.');

            // 2. CHECAR SESSÃO
            const cId = brain.session.clinicId;
            addLog('SESSION', 'info', `ClinicID na sessão: ${cId}`);

            if (!cId) {
                addLog('SESSION', 'error', 'ERRO CRÍTICO: Não há ClinicID na sessão. Faça logout e login novamente.');
                setLoading(false);
                return;
            }

            // 3. CONSULTA SIMPLES (CLINICS)
            addLog('DB_READ', 'info', 'Testando leitura na tabela Clinics...');
            const { data: clinicData, error: clinicError } = await supabase
                .from('clinics')
                .select('id, name')
                .eq('id', cId)
                .maybeSingle();

            if (clinicError) {
                addLog('DB_READ', 'error', `Falha ao ler Clinics: ${clinicError.message}`, clinicError);
            } else if (!clinicData) {
                addLog('DB_READ', 'error', `Clínica não encontrada no Banco! ID: ${cId}. Isso causa erro 400 (FK Violation).`);
            } else {
                addLog('DB_READ', 'success', `Clínica encontrada: ${clinicData.name}`);
            }

            // 4. TESTE DE INSERÇÃO (PATIENTS)
            addLog('DB_WRITE', 'info', 'Testando inserção na tabela Patients...');

            const dummyPatient = {
                clinic_id: cId,
                name: `TESTE DIAGNOSTICO ${new Date().toLocaleTimeString()}`,
                monthly_fee: 100,
                status: 'active',
                created_at: new Date().toISOString(),
                created_by: 'debug_tool',
                // Campos estritos
                date_of_birth: '2000-01-01',
                entry_date: '2024-01-01',
                has_previous_admissions: false,
                caps_treatment: false,
                hospital_detox: false,
                payment_type: 'particular'
            };

            addLog('DB_WRITE', 'info', 'Enviando payload...', dummyPatient);

            const { data: insertData, error: insertError } = await supabase
                .from('patients')
                .insert(dummyPatient)
                .select()
                .single();

            if (insertError) {
                addLog('DB_WRITE', 'error', `ERRO AO SALVAR: ${insertError.message}`, {
                    details: insertError.details,
                    hint: insertError.hint,
                    code: insertError.code
                });
            } else {
                addLog('DB_WRITE', 'success', 'PACIENTE SALVO COM SUCESSO! O sistema está funcionando.', insertData);
                // Opcional: deletar o teste
                await supabase.from('patients').delete().eq('id', insertData.id);
                addLog('Cleanup', 'info', 'Paciente de teste removido.');
            }

        } catch (err: any) {
            addLog('CRASH', 'error', `Erro inesperado: ${err.message}`, err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800">Diagnóstico de Conexão</h1>
                            <p className="text-sm text-slate-500 font-bold">Verifique a saúde da integração com Supabase</p>
                        </div>
                    </div>
                    <button
                        onClick={runDiagnostics}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Rodando...' : <><Play size={18} /> Executar Testes</>}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <StatusCard icon={Database} label="Banco de Dados" status={logs.some(l => l.step === 'DB_READ' && l.status === 'success') ? 'ok' : 'waiting'} />
                    <StatusCard icon={Shield} label="Sessão/Auth" status={logs.some(l => l.step === 'SESSION' && l.status === 'success') ? 'ok' : 'waiting'} />
                    <StatusCard icon={Server} label="Escrita (Insert)" status={logs.some(l => l.step === 'DB_WRITE' && l.status === 'success') ? 'ok' : 'waiting'} />
                </div>

                <div className="bg-slate-900 rounded-xl p-4 font-mono text-sm overflow-hidden flex flex-col h-[400px]">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
                        <span className="text-slate-400 font-bold text-xs">CONSOLE DE DIAGNÓSTICO</span>
                        <button onClick={copyLogs} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-xs font-bold">
                            <Copy size={12} /> Copiar
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-slate-700">
                        {logs.length === 0 && <span className="text-slate-600 italic">Aguardando execução...</span>}
                        {logs.map(log => (
                            <div key={log.id} className="flex gap-2 items-start animate-in fade-in slide-in-from-left-2">
                                <span className="text-slate-500 shrink-0">[{log.time}]</span>
                                <div className="break-all">
                                    <span className={`font-bold ${log.status === 'success' ? 'text-emerald-400' :
                                            log.status === 'error' ? 'text-rose-400' : 'text-blue-400'
                                        }`}>
                                        {log.step}: {log.message}
                                    </span>
                                    {log.data && (
                                        <pre className="mt-1 text-[10px] text-slate-500 bg-black/30 p-2 rounded border border-slate-800 overflow-x-auto">
                                            {JSON.stringify(log.data, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Utils
import { Activity } from 'lucide-react';

const StatusCard = ({ icon: Icon, label, status }: any) => (
    <div className={`p-4 rounded-xl border flex items-center gap-3 ${status === 'ok' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
            status === 'error' ? 'bg-rose-50 border-rose-100 text-rose-700' :
                'bg-slate-50 border-slate-100 text-slate-400'
        }`}>
        <div className={`p-2 rounded-lg ${status === 'ok' ? 'bg-emerald-100' :
                status === 'error' ? 'bg-rose-100' :
                    'bg-slate-100'
            }`}>
            <Icon size={20} />
        </div>
        <div>
            <div className="text-xs font-bold uppercase opacity-70">Status</div>
            <div className="font-black text-sm">{label}</div>
        </div>
        {status === 'ok' && <CheckCircle size={16} className="ml-auto" />}
        {status === 'error' && <AlertCircle size={16} className="ml-auto" />}
    </div>
);

export default DebugConn;
