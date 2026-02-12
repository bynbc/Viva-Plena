import React, { useState } from 'react';
import { useBrain } from '../context/BrainContext';
import { Calendar, Package, UserPlus } from 'lucide-react';

interface Props {
    patientId: string;
}

const VisitsControl: React.FC<Props> = ({ patientId }) => {
    const { brain, push, addToast } = useBrain();
    const [visitorName, setVisitorName] = useState('');
    const [items, setItems] = useState('');

    // Como não temos tabela de visitas no type original ainda, vamos assumir que usamos 'occurrences' com type 'visit' 
    // OU uma nova tabela se o repo suportar. Por enquanto, vou usar uma lista local simulada ou genérica para ilustrar.
    // NA PRÁTICA: Melhor salvar como 'occurrences' com type='VISIT' para aproveitar a estrutura existente sem migração complexa agora.

    const visits = brain.occurrences?.filter(o => o.patient_id === patientId && o.type === 'VISIT') || [];

    const handleRegister = async () => {
        if (!visitorName) return addToast('Nome do visitante obrigatório', 'warning');

        try {
            await push('occurrences', {
                clinic_id: brain.session?.clinicId,
                patient_id: patientId,
                type: 'VISIT',
                title: `Visita: ${visitorName}`,
                description: items ? `Ítens trazidos: ${items}` : 'Visita de rotina sem entrega de itens.',
                created_at: new Date().toISOString(),
                severity: 'Informativa',
                status: 'resolved'
            });
            addToast('Visita registrada!', 'success');
            setVisitorName('');
            setItems('');
        } catch (e) {
            console.error(e);
            addToast('Erro ao registrar', 'error');
        }
    };

    return (
        <div className="space-y-6">
            {/* FORMULÁRIO */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                <h3 className="font-black text-slate-700 uppercase flex items-center gap-2"><UserPlus size={18} /> Nova Visita</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <input
                        value={visitorName}
                        onChange={e => setVisitorName(e.target.value)}
                        placeholder="Nome do Visitante"
                        className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-bold"
                    />
                    <input
                        value={items}
                        onChange={e => setItems(e.target.value)}
                        placeholder="Pertences / Sacolas (Opcional)"
                        className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-bold"
                    />
                </div>
                <button onClick={handleRegister} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black uppercase hover:bg-emerald-700 transition-colors">
                    Registrar Entrada
                </button>
            </div>

            {/* HISTÓRICO */}
            <div className="space-y-3">
                <h3 className="font-black text-slate-400 uppercase text-xs ml-2">Histórico de Visitas</h3>
                {visits.length === 0 ? (
                    <div className="text-center p-8 text-slate-400 bg-white border border-slate-100 rounded-2xl">Nenhuma visita registrada.</div>
                ) : (
                    visits.map(visit => (
                        <div key={visit.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between">
                            <div>
                                <h4 className="font-black text-slate-800">{visit.title.replace('Visita: ', '')}</h4>
                                <p className="text-xs text-slate-500 mt-1">{visit.description}</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-lg">
                                <Calendar size={12} />
                                {new Date(visit.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default VisitsControl;
