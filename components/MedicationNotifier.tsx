import React, { useEffect } from 'react';
import { useBrain } from '../context/BrainContext'; // Caminho corrigido
import toast from 'react-hot-toast';
import { Pill } from 'lucide-react';

const MedicationNotifier: React.FC = () => {
  const { brain } = useBrain();

  useEffect(() => {
    const checkMedications = () => {
      if (!brain.medications) return;
      
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM

      brain.medications.forEach(med => {
         if (med.scheduled_time === currentTime && med.status === 'pending') {
            toast((t) => (
               <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-full text-indigo-600"><Pill size={20} /></div>
                  <div>
                     <p className="font-bold text-slate-800">Hora do Remédio!</p>
                     <p className="text-sm text-slate-600">{med.name} para {med.patient_name}</p>
                  </div>
               </div>
            ), { duration: 6000, position: 'top-right' });
         }
      });
    };

    const interval = setInterval(checkMedications, 60000); // Checa a cada minuto
    return () => clearInterval(interval);
  }, [brain.medications]);

  return null;
};

export default MedicationNotifier;
