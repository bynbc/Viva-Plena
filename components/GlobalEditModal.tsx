import React from 'react';
import { X } from 'lucide-react';
import { useBrain } from '../context/BrainContext';

// Importe aqui os modais de edição específicos se existirem
// Por enquanto vamos fazer um genérico simples para evitar erro

const GlobalEditModal: React.FC = () => {
  const { brain, cancelEdit } = useBrain();
  const { editingItem } = brain.ui;

  if (!editingItem) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl relative">
        <button 
          onClick={cancelEdit}
          className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-400 hover:bg-slate-200"
        >
          <X size={20} />
        </button>
        
        <div className="text-center py-8">
          <h2 className="text-xl font-black text-slate-800">Edição Rápida</h2>
          <p className="text-sm text-slate-500 font-bold mt-2">
            Editando {editingItem.type}...
          </p>
          <p className="text-xs text-slate-400 mt-4">
            (Funcionalidade de edição detalhada em construção)
          </p>
        </div>
      </div>
    </div>
  );
};

export default GlobalEditModal;
