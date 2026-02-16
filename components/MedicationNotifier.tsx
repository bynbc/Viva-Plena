import React, { useEffect } from 'react';
import { useBrain } from '../context/BrainContext'; // Caminho corrigido
import toast from 'react-hot-toast';
import { Pill } from 'lucide-react';

const MedicationNotifier: React.FC = () => {
   const { brain } = useBrain();
   const lastChecked = React.useRef<string>('');

   useEffect(() => {
      const checkMedications = () => {
         if (!brain.medications) return;

         const now = new Date();
         const currentTime = now.toTimeString().slice(0, 5); // HH:MM

         // Avoid double notification in the same minute
         if (currentTime === lastChecked.current) return;

         brain.medications.forEach(med => {
            if (med.scheduled_time === currentTime && med.status === 'pending') {
               lastChecked.current = currentTime; // Mark as notified

               toast((t) => (
                  <div className="flex items-center gap-3">
                     <div className="bg-indigo-100 p-2 rounded-full text-indigo-600"><Pill size={20} /></div>
                     <div>
                        <p className="font-bold text-slate-800">Hora do Remédio!</p>
                        <p className="text-sm text-slate-600">{med.name} para {med.patient_name}</p>
                     </div>
                  </div>
               ), { duration: 6000, position: 'top-right', id: `med-${med.id}-${currentTime}` });
            }
         });
      };

      const interval = setInterval(checkMedications, 10000); // Check every 10s
      checkMedications(); // Run immediately on mount

      return () => clearInterval(interval);
   }, [brain.medications]);

   return null;
};

export default MedicationNotifier;
