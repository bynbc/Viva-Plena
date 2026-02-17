import React, { useState, useRef } from 'react';
import { Pill, Loader2, Plus, X, UploadCloud, FileText, Search } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import MobileModal from './common/MobileModal';

const NewMedicationModal: React.FC = () => {
  const { brain, setQuickAction, push, addToast } = useBrain();
  const [loading, setLoading] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [prescriptionFile, setPrescriptionFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lista de itens do estoque que são REMÉDIOS
  const stockMeds = brain.inventory.filter(i => i.category === 'Medicamentos');

  const [items, setItems] = useState([
    { id: crypto.randomUUID(), name: '', dosage: '', time: '08:00', inventory_id: '' }
  ]);

  const activePatients = brain.patients?.filter(p => p.status === 'active') || [];

  const handleAddItem = () => setItems([...items, { id: crypto.randomUUID(), name: '', dosage: '', time: '08:00', inventory_id: '' }]);

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: string, value: string) => {
    setItems(items.map(item => {
      if (item.id !== id) return item;

      // Se o usuário selecionou algo do estoque, preenchemos o nome automaticamente
      if (field === 'inventory_id') {
        const stockItem = stockMeds.find(s => s.id === value);
        return {
          ...item,
          inventory_id: value,
          name: stockItem ? stockItem.name : item.name // Atualiza nome se achou
        };
      }
      return { ...item, [field]: value };
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return addToast('Arquivo muito grande (Max 5MB).', 'warning');
      const reader = new FileReader();
      reader.onloadend = () => setPrescriptionFile(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return addToast("Selecione um paciente.", "warning");

    const validItems = items.filter(i => i.name.trim().length > 0);
    if (validItems.length === 0) return addToast("Adicione pelo menos um medicamento.", "warning");

    setLoading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const item of validItems) {
        try {
          await push('medications', {
            clinic_id: brain.session.clinicId,
            patient_id: patientId,
            patient_name: activePatients.find(p => p.id === patientId)?.name || 'Paciente',
            name: item.name,
            dosage: item.dosage,
            scheduled_time: item.time,
            prescription_file: prescriptionFile,
            status: 'pending',
            inventory_item_id: item.inventory_id || null,
            prescription_expiry: (item as any).prescription_expiry || null
          });
          successCount++;
        } catch (innerErr) {
          console.error(`Falha ao salvar item ${item.name}:`, innerErr);
          errorCount++;
        }
      }

      if (successCount > 0) {
        addToast(`${successCount} prescrições criadas!`, "success");
        setQuickAction(null);
      }
      if (errorCount > 0) addToast(`${errorCount} erros ao salvar.`, "error");

    } catch (err) {
      console.error('Erro geral ao salvar prescrição:', err);
      addToast(`Erro crítico ao processar: ${(err as any).message || 'Desconhecido'}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex gap-3 w-full">
      <button type="button" onClick={() => setQuickAction(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-[10px] uppercase text-slate-500">Cancelar</button>
      <button form="new-med-form" type="submit" disabled={loading} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-[10px] uppercase shadow-lg">
        {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : `Salvar (${items.length})`}
      </button>
    </div>
  );

  return (
    <MobileModal title="Nova Prescrição" subtitle="Anexar Receita & Agendar" icon={Pill} iconColor="bg-indigo-600" onClose={() => setQuickAction(null)} footer={footer}>
      <form id="new-med-form" onSubmit={handleSave} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Paciente</label>
          <select required value={patientId} onChange={e => setPatientId(e.target.value)} className="w-full px-5 py-4 bg-slate-50 text-slate-900 border rounded-2xl font-bold text-sm outline-none focus:border-indigo-500 transition-colors">
            <option value="">Selecione...</option>
            {activePatients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Upload da Receita (Opcional)</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 py-4 rounded-xl border-dashed border-2 flex flex-col items-center justify-center gap-2 transition-all ${prescriptionFile ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-300 bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
            >
              {prescriptionFile ? (
                <>
                  <FileText size={24} />
                  <span className="text-xs font-bold uppercase">Receita Anexada</span>
                </>
              ) : (
                <>
                  <UploadCloud size={24} />
                  <span className="text-xs font-bold uppercase">Toque para anexar foto/PDF</span>
                </>
              )}
            </button>
            {prescriptionFile && (
              <button
                type="button"
                onClick={() => setPrescriptionFile(null)}
                className="p-4 bg-rose-100 text-rose-600 rounded-xl"
              >
                <X size={20} />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Lista de Medicamentos */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex justify-between items-end px-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medicamentos</label>
            <button type="button" onClick={handleAddItem} className="text-[10px] font-bold text-indigo-600 uppercase flex items-center gap-1 hover:underline"><Plus size={12} /> Adicionar</button>
          </div>
          {items.map((item, index) => (
            <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative">
              {items.length > 1 && <button type="button" onClick={() => handleRemoveItem(item.id)} className="absolute top-2 right-2 p-2 text-slate-300 hover:text-rose-500"><X size={16} /></button>}

              {/* SELETOR DE ESTOQUE */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase pl-1">Vincular ao Estoque (Opcional)</label>
                <select
                  value={item.inventory_id}
                  onChange={e => updateItem(item.id, 'inventory_id', e.target.value)}
                  className="w-full p-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-500"
                >
                  <option value="">-- Apenas Digitar Nome --</option>
                  {stockMeds.map(sm => (
                    <option key={sm.id} value={sm.id}>{sm.name} (Qtd: {sm.quantity})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="bg-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100">{index + 1}</span>
                <input placeholder="Nome do Medicamento" value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} className="flex-1 bg-transparent text-slate-900 border-b border-slate-200 focus:border-indigo-500 outline-none text-sm font-bold py-1" />
              </div>
              <div className="grid grid-cols-2 gap-4 pl-8">
                <input placeholder="Dose (Ex: 50mg)" value={item.dosage} onChange={e => updateItem(item.id, 'dosage', e.target.value)} className="bg-white text-slate-900 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-indigo-500" />
                <input type="time" value={item.time} onChange={e => updateItem(item.id, 'time', e.target.value)} className="w-full bg-white text-slate-900 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-indigo-500 text-center" />
              </div>

              <div className="pl-8 pt-2">
                <label className="text-[9px] font-bold text-slate-400 uppercase pl-1">Validade da Receita</label>
                <input
                  type="date"
                  onChange={e => updateItem(item.id, 'prescription_expiry', e.target.value)}
                  className="w-full bg-white text-slate-900 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-indigo-500 text-center"
                />
              </div>
            </div>
          ))}
        </div>
      </form>
    </MobileModal>
  );
};

export default NewMedicationModal;
