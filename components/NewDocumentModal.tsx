import React, { useState } from 'react';
import { FileText, UploadCloud, X } from 'lucide-react';
import { useBrain } from '../context/BrainContext';
import MobileModal from './common/MobileModal';

const NewDocumentModal: React.FC = () => {
  const { setQuickAction, push, addToast, brain } = useBrain();
  const [name, setName] = useState('');
  const [type, setType] = useState('Exame');
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if(file.size > 5 * 1024 * 1024) return addToast('Arquivo muito grande (Max 5MB)', 'warning');
      const reader = new FileReader();
      reader.onloadend = () => setFileContent(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return addToast('Defina um nome para o documento', 'warning');

    setLoading(true);
    try {
      await push('documents', {
        clinic_id: brain.session.clinicId,
        title: name,
        type,
        url: fileContent, // Salva o base64 do arquivo
        created_at: new Date().toISOString()
      });
      addToast('Documento salvo!', 'success');
      setQuickAction(null);
    } catch (err) {
      addToast('Erro ao salvar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex gap-3 w-full">
        <button type="button" onClick={() => setQuickAction(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-xs uppercase text-slate-500">Cancelar</button>
        <button type="submit" form="doc-form" disabled={loading} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase shadow-lg hover:bg-blue-700">
            {loading ? 'Enviando...' : 'Salvar Arquivo'}
        </button>
    </div>
  );

  return (
    <MobileModal title="Novo Documento" subtitle="Arquivar exames ou contratos" icon={FileText} iconColor="bg-blue-600" onClose={() => setQuickAction(null)} footer={footer}>
       <form id="doc-form" onSubmit={handleSave} className="space-y-6">
           <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nome do Documento</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full p-4 bg-slate-50 rounded-xl font-bold border border-slate-100 outline-none focus:border-blue-500" placeholder="Ex: Hemograma Completo" autoFocus />
           </div>
           
           <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Categoria</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full p-4 bg-slate-50 rounded-xl font-bold border border-slate-100 outline-none focus:border-blue-500">
                 <option>Exame</option>
                 <option>Contrato</option>
                 <option>Laudo</option>
                 <option>Documento Pessoal</option>
                 <option>Outros</option>
              </select>
           </div>

           {/* ÁREA DE UPLOAD CORRIGIDA */}
           <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-slate-50/50 hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer relative">
               <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
               <UploadCloud size={32} className={`mb-2 ${fileContent ? 'text-blue-600' : 'text-slate-300'}`} />
               {fileContent ? (
                  <p className="text-xs font-bold text-blue-600">Arquivo Selecionado!</p>
               ) : (
                  <>
                    <p className="text-xs font-bold text-slate-500">Toque para selecionar arquivo</p>
                    <p className="text-[9px] font-bold text-slate-300 mt-1 uppercase">PDF, JPG ou PNG (Max 5MB)</p>
                  </>
               )}
           </div>
       </form>
    </MobileModal>
  );
};

export default NewDocumentModal;
