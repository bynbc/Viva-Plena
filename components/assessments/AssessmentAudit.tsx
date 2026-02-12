import React, { useState } from 'react';
import { useBrain } from '../../context/BrainContext';
import { Save } from 'lucide-react';

interface Props {
    patientId: string;
}

const AssessmentAudit: React.FC<Props> = ({ patientId }) => {
    const { push, addToast, brain } = useBrain();
    const [loading, setLoading] = useState(false);

    // Perguntas resumidas do AUDIT
    const questions = [
        "1. Com que frequência você consome bebidas alcoólicas?",
        "2. Quantas doses você consome num dia típico que bebe?",
        "3. Com que frequência consome 6 ou mais doses numa ocasião?",
        "4. Com que frequência não conseguiu parar de beber?",
        "5. Com que frequência deixou de fazer tarefas por causa da bebida?",
        "6. Com que frequência precisou beber pela manhã para 'curar' a ressaca?",
        "7. Com que frequência teve remorso ou culpa após beber?",
        "8. Com que frequência não se lembrou do que aconteceu por causa da bebida?",
        "9. Você ou alguém já se feriu por causa da sua bebida?",
        "10. Algum parente/amigo já sugeriu que você parasse de beber?"
    ];

    const [answers, setAnswers] = useState<number[]>(new Array(10).fill(0));

    const handleSave = async () => {
        setLoading(true);
        try {
            const totalScore = answers.reduce((a, b) => a + b, 0);

            await push('assessments', {
                clinic_id: brain.session?.clinicId,
                patient_id: patientId,
                type: 'AUDIT',
                data: { answers },
                total_score: totalScore,
                created_at: new Date().toISOString(),
                professional_id: brain.session?.user?.id
            });

            addToast('Avaliação AUDIT salva com sucesso!', 'success');
        } catch (error) {
            console.error(error);
            addToast('Erro ao salvar avaliação.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
                <h3 className="font-black text-slate-700 uppercase text-sm mb-2">AUDIT - Teste de Identificação de Transtornos por Uso de Álcool</h3>
                <p className="text-sm text-slate-500">Pontue de 0 a 4 para cada questão.</p>
            </div>

            <div className="space-y-4">
                {questions.map((q, index) => (
                    <div key={index} className="p-4 bg-white border border-slate-100 rounded-xl space-y-2">
                        <label className="font-bold text-slate-700 text-sm block">{q}</label>
                        <div className="flex gap-2">
                            {[0, 1, 2, 3, 4].map(score => (
                                <button
                                    key={score}
                                    onClick={() => {
                                        const newAnswers = [...answers];
                                        newAnswers[index] = score;
                                        setAnswers(newAnswers);
                                    }}
                                    className={`flex-1 py-2 rounded-lg font-black text-sm transition-all border ${answers[index] === score
                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                                        }`}
                                >
                                    {score}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end pt-4 items-center gap-4">
                <p className="font-black text-slate-700">Total: <span className="text-2xl text-indigo-600">{answers.reduce((a, b) => a + b, 0)}</span></p>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                    <Save size={18} />
                    {loading ? 'Salvando...' : 'Salvar Avaliação'}
                </button>
            </div>
        </div>
    );
};

export default AssessmentAudit;
