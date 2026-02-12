import React, { useState } from 'react';
import { useBrain } from '../../context/BrainContext';
import { Save, Activity } from 'lucide-react';

interface Props {
    patientId: string;
}

const Input = ({ label, field, value, onChange, placeholder, type = 'text' }: any) => (
    <div className="space-y-1">
        <label className="text-xs font-black text-slate-400 uppercase">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-500"
            placeholder={placeholder}
        />
    </div>
);

const AssessmentNursing: React.FC<Props> = ({ patientId }) => {
    const { push, addToast, brain } = useBrain();
    const [loading, setLoading] = useState(false);

    const [data, setData] = useState({
        blood_pressure: '',
        temperature: '',
        heart_rate: '',
        respiratory_rate: '',
        oxygen_saturation: '',
        weight: '',
        height: '',
        allergies: '',
        complaints: '',
        observation: ''
    });

    const handleSave = async () => {
        setLoading(true);
        try {
            await push('assessments', {
                clinic_id: brain.session?.clinicId,
                patient_id: patientId,
                type: 'NURSING',
                data: data,
                created_at: new Date().toISOString(),
                professional_id: brain.session?.user?.id
            });

            addToast('Ficha de Enfermagem salva!', 'success');
            setData({ ...data, complaints: '', observation: '' }); // Limpa campos temporários
        } catch (error) {
            console.error(error);
            addToast('Erro ao salvar ficha.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><Activity size={24} /></div>
                <div>
                    <h3 className="font-black text-slate-700 uppercase text-sm">Ficha de Enfermagem / Sinais Vitais</h3>
                    <p className="text-sm text-slate-500">Registro de admissão e acompanhamento diário.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Input label="PA (mmHg)" value={data.blood_pressure} onChange={(e: any) => setData({ ...data, blood_pressure: e.target.value })} placeholder="120/80" />
                <Input label="Temp (°C)" value={data.temperature} onChange={(e: any) => setData({ ...data, temperature: e.target.value })} placeholder="36.5" type="number" />
                <Input label="FC (bpm)" value={data.heart_rate} onChange={(e: any) => setData({ ...data, heart_rate: e.target.value })} placeholder="75" type="number" />
                <Input label="FR (rpm)" value={data.respiratory_rate} onChange={(e: any) => setData({ ...data, respiratory_rate: e.target.value })} placeholder="18" type="number" />
                <Input label="Sat O2 (%)" value={data.oxygen_saturation} onChange={(e: any) => setData({ ...data, oxygen_saturation: e.target.value })} placeholder="98" type="number" />
                <Input label="Peso (kg)" value={data.weight} onChange={(e: any) => setData({ ...data, weight: e.target.value })} placeholder="70.5" type="number" />
                <Input label="Altura (m)" value={data.height} onChange={(e: any) => setData({ ...data, height: e.target.value })} placeholder="1.75" type="number" />
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="space-y-1">
                    <label className="text-xs font-black text-slate-400 uppercase">Alergias Conhecidas</label>
                    <textarea
                        value={data.allergies}
                        onChange={e => setData({ ...data, allergies: e.target.value })}
                        className="w-full p-3 bg-red-50 border border-red-100 rounded-xl font-bold text-red-700 outline-none focus:border-red-500 min-h-[80px]"
                        placeholder="Descreva alergias a medicamentos ou alimentos..."
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-black text-slate-400 uppercase">Queixas Principais</label>
                    <textarea
                        value={data.complaints}
                        onChange={e => setData({ ...data, complaints: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-indigo-500 min-h-[100px]"
                        placeholder="Relato do paciente..."
                    />
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                    <Save size={18} />
                    {loading ? 'Salvando...' : 'Registrar Sinais'}
                </button>
            </div>
        </div>
    );
};

export default AssessmentNursing;
