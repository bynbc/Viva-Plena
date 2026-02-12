import React, { useState } from 'react';
import { useBrain } from '../../context/BrainContext';
import { Save, AlertTriangle } from 'lucide-react';

interface Props {
  patientId: string;
}

const AssessmentAssist: React.FC<Props> = ({ patientId }) => {
  const { push, addToast, brain } = useBrain();
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState<any>({
    tobacco: 0,
    alcohol: 0,
    cannabis: 0,
    cocaine: 0,
    stimulants: 0,
    sedatives: 0,
    hallucinogens: 0,
    opioids: 0,
    others: 0
  });

  const substances = [
    { key: 'tobacco', label: 'Tabaco (cigarros, mascar, charuto, etc.)' },
    { key: 'alcohol', label: 'Bebidas alcoólicas (cerveja, vinho, pinga, etc.)' },
    { key: 'cannabis', label: 'Maconha (haxixe, skunk, etc.)' },
    { key: 'cocaine', label: 'Cocaína, crack, etc.' },
    { key: 'stimulants', label: 'Estimulantes (anfetaminas, ritalina, etc.)' },
    { key: 'sedatives', label: 'Inalantes / Sedativos (calmantes, remédios p/ dormir)' },
    { key: 'hallucinogens', label: 'Alucinógenos (LSD, cogumelos, etc.)' },
    { key: 'opioids', label: 'Opióides (heroína, morfina, metadona, etc.)' },
    { key: 'others', label: 'Outras substâncias' }
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      const totalScore = Object.values(scores).reduce((a: any, b: any) => a + Number(b), 0);

      await push('assessments', {
        clinic_id: brain.session?.clinicId,
        patient_id: patientId,
        type: 'ASSIST',
        data: scores,
        total_score: totalScore,
        created_at: new Date().toISOString(),
        professional_id: brain.session?.user?.id
      });

      addToast('Avaliação ASSIST salva com sucesso!', 'success');
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
        <h3 className="font-black text-slate-700 uppercase text-sm mb-2">ASSIST - Triagem de Álcool, Tabaco e Outras Substâncias</h3>
        <p className="text-sm text-slate-500">Preencha a pontuação para cada substância referente aos últimos 3 meses.</p>
      </div>

      <div className="grid gap-4">
        {substances.map(sub => (
          <div key={sub.key} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white border border-slate-100 rounded-xl gap-2">
            <label className="font-bold text-slate-700 text-sm">{sub.label}</label>
            <input
              type="number"
              min="0"
              max="40"
              value={scores[sub.key]}
              onChange={e => setScores({ ...scores, [sub.key]: Number(e.target.value) })}
              className="w-full md:w-20 p-2 bg-slate-50 border border-slate-200 rounded-lg text-center font-black outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
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

export default AssessmentAssist;
